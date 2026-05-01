import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { tasksRouter } from './routes/tasks';
import { tasksV3Router } from './routes/api/tasks';
import { parseRouter } from './routes/api/parse';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/tasks', tasksRouter);
app.use('/api/tasks', tasksV3Router);
app.use('/api/parse', parseRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    code: err.code
  });
});

app.listen(port, () => {
  console.log(`Shvasa Backend listening at http://localhost:${port}`);
});
