import { Router } from 'express';
import { z } from 'zod';
import { cleanupTranscription, extractTaskData, detectSchedulingConflicts } from '../services/ai_v3';
import { prisma } from '../../db';
import { authMiddleware } from '../../middleware/auth';

export const parseRouter = Router();
parseRouter.use(authMiddleware);

parseRouter.post('/', async (req, res, next) => {
  try {
    const { raw_transcript } = z.object({
      raw_transcript: z.string(),
    }).parse(req.body);

    const user_id = req.user?.id;
    if (!user_id) return res.status(401).json({ error: 'Unauthorized' });

    const today = new Date().toISOString().split('T')[0];
    
    // Prompt 1: Cleanup
    const cleaned = await cleanupTranscription(raw_transcript);
    
    // Prompt 2: Extraction
    const extractionResult = await extractTaskData(cleaned, today);
    
    // Prompt 4: Conflict Detection (if user_id provided)
    let conflictResult = null;
    if (user_id) {
        const existingTasks = await prisma.task.findMany({
            where: { user_id, deadline: { not: null } } // Simplified for MVP
        });
        conflictResult = await detectSchedulingConflicts(extractionResult, existingTasks);
    }

    res.json({
        raw: raw_transcript,
        cleaned,
        extraction: extractionResult,
        conflicts: conflictResult,
        confidence: extractionResult.confidence,
    });
  } catch (err) {
    next(err);
  }
});
