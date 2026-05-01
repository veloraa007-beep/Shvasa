import { Router } from 'express';
import { prisma } from '../../db';
import { authMiddleware } from '../../middleware/auth';

export const tasksV3Router = Router();

tasksV3Router.use(authMiddleware);

tasksV3Router.get('/', async (req, res, next) => {
  try {
    const user_id = req.user?.id;
    if (!user_id) return res.status(401).json({ error: 'User ID not found in session' });
    const tasks = await prisma.task.findMany({
      where: { user_id },
      orderBy: { urgency_score: 'desc' },
      include: { subtasks: true }
    });
    res.json(tasks);
  } catch (err) {
    next(err);
  }
});

tasksV3Router.post('/', async (req, res, next) => {
    try {
        const user_id = req.user?.id;
        if (!user_id) return res.status(401).json({ error: 'User ID not found in session' });
        const { title, deadline, priority, subtasks, raw_transcript, ai_confidence } = req.body;

        const task = await prisma.task.create({
            data: {
                user_id,
                title,
                deadline: deadline ? new Date(deadline) : null,
                priority,
                status: 'SEED',
                raw_transcript,
                ai_confidence,
                subtasks: {
                    create: subtasks?.map((st: any) => ({
                        text: st.text,
                        order: st.order
                    }))
                }
            }
        });

        // Prompt 3: Urgency Score would normally run here or via Inngest
        // For now, logging the creation event
        await prisma.taskEvent.create({
            data: {
                task_id: task.id,
                user_id,
                event_type: 'created',
                metadata: { source: 'api_v3' }
            }
        });

        res.status(201).json(task);
    } catch (err) {
        next(err);
    }
});
