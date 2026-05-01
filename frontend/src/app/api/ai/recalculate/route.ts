import { NextRequest, NextResponse } from 'next/server';
import { OpenRouter } from '@openrouter/sdk';
import { z } from 'zod';
import { getSupabaseEnv } from '@/lib/env/public';
import { getOpenRouterApiKey } from '@/lib/env/server';

// ─── Schema ───────────────────────────────────────────────────────────────────

const PreferencesSchema = z.object({
  display_name: z.string().trim().min(1),
  focus_problem: z.string().trim(),
  distractions: z.string().trim(),
  goals: z.string().trim(),
  work_type: z.string().trim(),
  best_focus_time: z.string().trim(),
  primary_language: z.string().trim().default('English'),
  // Extended preferences
  session_length: z.string().nullable().default(null),
  reminder_style: z.string().nullable().default(null),
  recovery_style: z.string().nullable().default(null),
  work_style: z.string().nullable().default(null),
});

const RecalcResponseSchema = z.object({
  archetype: z.string().trim(),
  daily_tasks: z.array(
    z.object({
      title: z.string().trim(),
      priority: z.enum(['high', 'medium', 'low']),
    })
  ).length(3),
  focus_mode: z.object({
    duration: z.string().trim(),
    break: z.string().trim(),
    environment: z.string().trim(),
  }),
  distraction_plan: z.array(
    z.object({ trigger: z.string().trim(), action: z.string().trim() })
  ).min(1),
  daily_structure: z.object({
    morning: z.string().trim(),
    afternoon: z.string().trim(),
    evening: z.string().trim(),
  }),
  coach_message: z.string().trim().max(300),
});

export type RecalcResult = z.infer<typeof RecalcResponseSchema>;

// ─── Auth ─────────────────────────────────────────────────────────────────────

function getBearerToken(req: NextRequest): string | null {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  return auth.slice(7).trim() || null;
}

async function verifyToken(token: string): Promise<boolean> {
  const env = getSupabaseEnv();
  const res = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` },
  });
  return res.ok;
}

// ─── System Prompt ────────────────────────────────────────────────────────────

const RECALC_SYSTEM_PROMPT = `You are BLOOM — a precision execution mentor inside Shvasa.

A user has updated their preferences. Recalculate their full profile config.

Return ONLY valid JSON:
{
  "archetype": "one of: Overthinker | Distracted Scroller | Inconsistent Starter | High Ambition / Low Execution | Burnout Risk | Structured Performer",
  "daily_tasks": [
    { "title": "specific high-impact task for today", "priority": "high" },
    { "title": "specific medium-impact task", "priority": "medium" },
    { "title": "low but meaningful task", "priority": "low" }
  ],
  "focus_mode": {
    "duration": "25 min",
    "break": "5 min",
    "environment": "silent | nature sounds | lo-fi music"
  },
  "distraction_plan": [
    { "trigger": "specific situation that causes them to lose focus", "action": "immediate counter-action" }
  ],
  "daily_structure": {
    "morning": "what to do in the morning",
    "afternoon": "what to do in the afternoon",
    "evening": "what to do in the evening"
  },
  "coach_message": "2-3 line calm, direct, authoritative push to act NOW."
}

If session_length is set, use that for focus_mode.duration exactly.
If reminder_style is "silent", remove urgency from coach_message.
If work_style is "sprints", use shorter focus durations.
If recovery_style is set, reflect it in the daily_structure breaks.
ALWAYS prioritize action. Return ONLY JSON.`;

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const bearer = getBearerToken(request);
    if (!bearer || !(await verifyToken(bearer))) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const apiKey = getOpenRouterApiKey();

    const body = PreferencesSchema.parse(await request.json());

    const userMessage = `
Name: ${body.display_name}
Work type: ${body.work_type}
Focus problem: ${body.focus_problem}
Distractions: ${body.distractions}
Goals: ${body.goals}
Best focus time: ${body.best_focus_time}
Language: ${body.primary_language}
Session length preference: ${body.session_length ?? 'not set'}
Reminder style: ${body.reminder_style ?? 'not set'}
Recovery style: ${body.recovery_style ?? 'not set'}
Work style: ${body.work_style ?? 'not set'}
Today: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
`.trim();

    const openRouter = new OpenRouter({ apiKey });
    const completion = await openRouter.chat.send({
      chatRequest: {
        model: 'openai/gpt-4o-mini',
        messages: [
          { role: 'system', content: RECALC_SYSTEM_PROMPT },
          { role: 'user', content: userMessage },
        ],
        responseFormat: { type: 'json_object' },
        stream: false,
      },
    });

    const raw = completion.choices?.[0]?.message?.content ?? '';
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
    const result = RecalcResponseSchema.parse(JSON.parse(cleaned));

    return NextResponse.json({ ok: true, data: result });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: error.issues[0]?.message ?? 'Invalid request' },
        { status: 400 }
      );
    }
    console.error('[recalculate] Error:', error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unexpected error' },
      { status: 500 }
    );
  }
}
