import dotenv from 'dotenv';
// Load environment variables immediately before any other imports
dotenv.config();
dotenv.config({ path: '.env.local', override: true });

import express from 'express';
import type { ErrorRequestHandler } from 'express';
import cors from 'cors';
import { tasksRouter } from './routes/tasks';
import { tasksV3Router } from './routes/api/tasks';
import { parseRouter } from './routes/api/parse';
import { prisma } from './db';

const app = express();
const port = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/tasks', tasksRouter);
app.use('/api/tasks', tasksV3Router);
app.use('/api/parse', parseRouter);

// Health check with DB status
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ 
      status: 'ok', 
      database: 'connected',
      timestamp: new Date().toISOString() 
    });
  } catch (err) {
    res.status(503).json({ 
      status: 'error', 
      database: 'disconnected',
      timestamp: new Date().toISOString() 
    });
  }
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

  console.error('[Shvasa Server Error]:', err instanceof Error ? err.stack : err);
  res.status(payload.status).json({
    error: payload.error,
    code: payload.code,
  });
};

app.use(errorHandler);

app.listen(port, () => {
  console.log(`
  🌿 Shvasa Backend is breathing...
  📡 Listening at http://localhost:${port}
  `);
});
