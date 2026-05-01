import express from 'express';
import type { ErrorRequestHandler } from 'express';
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

function getErrorPayload(err: unknown): { status: number; error: string; code?: string } {
  if (err instanceof Error) {
    const maybeError = err as Error & { status?: number; code?: string };

    return {
      status: maybeError.status ?? 500,
      error: maybeError.message || 'Internal Server Error',
      code: maybeError.code,
    };
  }

  return {
    status: 500,
    error: 'Internal Server Error',
  };
}

// Error handling middleware
const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const payload = getErrorPayload(err);

  console.error(err instanceof Error ? err.stack : err);
  res.status(payload.status).json({
    error: payload.error,
    code: payload.code,
  });
};

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Shvasa Backend listening at http://localhost:${port}`);
});
