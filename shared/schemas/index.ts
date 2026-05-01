import { z } from 'zod';

export const PrioritySchema = z.enum(['HIGH', 'MEDIUM', 'LOW']);
export const TaskStatusSchema = z.enum(['SEED', 'PLANT', 'TREE']);

export const SubtaskSchema = z.object({
  text: z.string().min(1),
  order: z.number().int(),
});

export const TaskSchema = z.object({
  title: z.string().min(1),
  deadline: z.string().datetime().nullable(),
  priority: PrioritySchema,
  subtasks: z.array(SubtaskSchema).default([]),
  notes: z.string().nullable(),
  estimated_minutes: z.number().nullable(),
  confidence: z.number().min(0).max(1),
});

export const AIParseResultSchema = z.object({
  task: TaskSchema,
  confidence: z.number(),
  conflict_detected: z.boolean().optional(),
});

export const ThemeSchema = z.object({
  theme_name: z.string(),
  background_primary: z.string().regex(/^#[0-9A-F]{6}$/i),
  background_secondary: z.string().regex(/^#[0-9A-F]{6}$/i),
  accent_primary: z.string().regex(/^#[0-9A-F]{6}$/i),
  accent_secondary: z.string().regex(/^#[0-9A-F]{6}$/i),
  text_primary: z.string().regex(/^#[0-9A-F]{6}$/i),
  text_secondary: z.string().regex(/^#[0-9A-F]{6}$/i),
  border_color: z.string().regex(/^#[0-9A-F]{6}$/i),
  priority_high: z.string().regex(/^#[0-9A-F]{6}$/i),
  priority_medium: z.string().regex(/^#[0-9A-F]{6}$/i),
  priority_low: z.string().regex(/^#[0-9A-F]{6}$/i),
  nature_metaphor: z.string(),
  ambient_sound: z.enum(['rain', 'forest', 'ocean', 'wind', 'fire', 'silence']),
  animation_speed: z.enum(['slow', 'medium', 'fast']),
});
