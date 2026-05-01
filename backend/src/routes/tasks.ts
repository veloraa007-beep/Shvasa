import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { calculateUrgency } from '../utils/urgency';
import { authMiddleware } from '../middleware/auth';
import { parseVoiceInput } from '../services/ai';

export const tasksRouter = Router();
tasksRouter.use(authMiddleware);

type ParsedSubtask = {
  text: string;
  order: number;
};

const CreateTaskFlowSchema = z.object({
  raw_transcript: z.string().min(1),
});

tasksRouter.post('/', async (req, res, next) => {
  try {
    const { raw_transcript } = CreateTaskFlowSchema.parse(req.body);
    const user_id = req.user?.id;
    if (!user_id) return res.status(401).json({ error: 'Unauthorized: No user session found' });
    
    const parseResult = await parseVoiceInput(raw_transcript);
    
    // Conflict detection before DB save constraint
    if (parseResult.task.deadline) {
      const deadlineDate = new Date(parseResult.task.deadline);
      const windowStart = new Date(deadlineDate.getTime() - 30 * 60000); // 30 mins before
      const windowEnd = new Date(deadlineDate.getTime() + 30 * 60000);   // 30 mins after
      
      const conflicts = await prisma.task.findFirst({
        where: {
          user_id,
          deadline: {
            gte: windowStart,
            lte: windowEnd,
          },
        },
      });
      
      if (conflicts) {
        return res.status(409).json({
          conflict_detected: true,
          conflicting_task_id: conflicts.id,
          suggested_reschedule_time: new Date(deadlineDate.getTime() + 60 * 60000).toISOString(),
          partial_task: parseResult,
        });
      }
    }
    
    if (parseResult.confidence < 0.75) {
      return res.status(202).json({
        needs_confirmation: true,
        partial_task: parseResult,
      });
    }
    
    const createdTask = await prisma.task.create({
      data: {
        user_id,
        title: parseResult.task.title || 'Untitled Task',
        deadline: parseResult.task.deadline ? new Date(parseResult.task.deadline) : null,
        priority: parseResult.task.priority || 'MEDIUM',
        raw_transcript,
        ai_confidence: parseResult.confidence,
        urgency_score: calculateUrgency(parseResult.task.deadline ? new Date(parseResult.task.deadline) : null, parseResult.task.priority || 'MEDIUM', parseResult.task.subtasks?.length || 0),
        subtasks: {
          create: parseResult.task.subtasks?.map((st: ParsedSubtask) => ({
            text: st.text,
            order: st.order,
          })) || [],
        },
      },
    });
    
    await prisma.aIParseLog.create({
      data: {
        task_id: createdTask.id,
        raw_input: raw_transcript,
        parsed_output: parseResult,
        confidence: parseResult.confidence,
        ms_latency: parseResult._latency,
      },
    });
    
    res.status(201).json(createdTask);
  } catch (err) {
    next(err);
  }
});

tasksRouter.get('/', async (req, res, next) => {
  try {
    const user_id = req.user?.id;
    if (!user_id) return res.status(401).json({ error: 'Unauthorized: No user session found' });
    const tasks = await prisma.task.findMany({
      where: { user_id },
      orderBy: { urgency_score: 'desc' },
      include: { subtasks: true },
    });
    res.json(tasks);
  } catch (err) {
    next(err);
  }
});

tasksRouter.get('/:id', async (req, res, next) => {
  try {
    const user_id = req.user?.id;
    if (!user_id) return res.status(401).json({ error: 'Unauthorized: No user session found' });
    const task = await prisma.task.findUnique({
      where: { 
        id: req.params.id,
        user_id // Ensure the task belongs to the user
      },
      include: { subtasks: true },
    });
    
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (err) {
    next(err);
  }
});

tasksRouter.post('/parse', async (req, res, next) => {
  try {
    const { raw_transcript } = z.object({ raw_transcript: z.string() }).parse(req.body);
    const parseResult = await parseVoiceInput(raw_transcript);
    res.json(parseResult);
  } catch (err) {
    next(err);
  }
});
