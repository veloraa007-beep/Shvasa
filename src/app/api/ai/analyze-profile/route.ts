import { NextRequest, NextResponse } from 'next/server';
import { OpenRouter } from '@openrouter/sdk';
import { z } from 'zod';
import { getSupabaseEnv } from '@/lib/env/public';
import { getOpenRouterApiKey } from '@/lib/env/server';

// ─── Request Schema ────────────────────────────────────────────────────────────

const ProfileInputSchema = z.object({
  display_name: z.string().trim().min(1),
  focus_problem: z.string().trim().min(1),
  distractions: z.string().trim().min(1),
  goals: z.string().trim().min(1),
  work_type: z.string().trim().min(1),
  best_focus_time: z.string().trim().min(1),
  primary_language: z.string().trim().default('English'),
});

// ─── Response Schema (matches BLOOM Step 8 output) ────────────────────────────

const BloomTaskSchema = z.object({
  title: z.string().trim().min(1),
  priority: z.enum(['high', 'medium', 'low']),
});

const DistractionPlanSchema = z.object({
  trigger: z.string().trim().min(1),
  action: z.string().trim().min(1),
});

const BloomResponseSchema = z.object({
  display_name: z.string().trim(),
  archetype: z.string().trim(),
  daily_tasks: z.array(BloomTaskSchema).length(3),
  focus_mode: z.object({
    duration: z.string().trim(),
    break: z.string().trim(),
  }),
  distraction_plan: z.array(DistractionPlanSchema).min(1),
  coach_message: z.string().trim().max(300),
});

export type BloomAnalysis = z.infer<typeof BloomResponseSchema>;

// ─── BLOOM System Prompt ───────────────────────────────────────────────────────

const BLOOM_SYSTEM_PROMPT = `You are BLOOM — a calm, precise, and highly intelligent execution mentor inside the Shvasa system.

Your job is NOT to chat.
Your job is to transform a user into a focused, disciplined executor.

You will receive structured onboarding answers from a user. Analyze them and return ONLY a single valid JSON object — no markdown, no extra text.

STEP 1 — USER PROFILE ANALYSIS
Analyze deeply. Classify into ONE archetype:
- Overthinker
- Distracted Scroller
- Inconsistent Starter
- High Ambition / Low Execution
- Burnout Risk
- Structured Performer

STEP 2 — ROOT PROBLEM DIAGNOSIS
Identify why they fail. Sharp, no fluff.

STEP 3 — EXECUTION STRATEGY
Design a system for them: daily structure, focus style, session length, best window.

STEP 4 — DAILY 3 GENERATION
Generate exactly 3 actionable tasks for TODAY:
- Task 1 = highest impact (must complete)
- Task 2 = medium impact
- Task 3 = low but meaningful
Each must be clear, specific, doable in 1–2 hours.

STEP 5 — DISTRACTION DEFENSE PLAN
For each distraction: trigger + immediate counter-action.

STEP 6 — FOCUS MODE CONFIGURATION
Duration (20–45 min), break duration, environment suggestion.

STEP 7 — BLOOM COACH MESSAGE
2–3 lines. Calm. Direct. Slightly authoritative. Push them to act NOW.

STEP 8 — RETURN ONLY THIS JSON:
{
  "display_name": "",
  "archetype": "",
  "daily_tasks": [
    { "title": "specific task title", "priority": "high" },
    { "title": "specific task title", "priority": "medium" },
    { "title": "specific task title", "priority": "low" }
  ],
  "focus_mode": {
    "duration": "25 min",
    "break": "5 min"
  },
  "distraction_plan": [
    { "trigger": "specific trigger", "action": "specific immediate action" }
  ],
  "coach_message": "2-3 line message here."
}

RULES:
- DO NOT give long explanations
- DO NOT sound like a motivational speaker
- DO NOT overwhelm the user
- ALWAYS prioritize action over theory
- Return ONLY valid JSON. No markdown. No extra text.`;

// ─── Helpers ───────────────────────────────────────────────────────────────────

function getBearerToken(request: NextRequest): string | null {
  const auth = request.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  return auth.slice('Bearer '.length).trim() || null;
}

async function verifySupabaseToken(token: string): Promise<boolean> {
  const env = getSupabaseEnv();

  const response = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` },
  });
  return response.ok;
}

function parseBloomResponse(raw: string): BloomAnalysis | null {
  try {
    // Strip possible markdown fences if model slips up
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
    return BloomResponseSchema.parse(JSON.parse(cleaned));
  } catch {
    return null;
  }
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unexpected error';
}

// ─── Route Handler ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    // Auth check — every (app) route must be protected
    const bearer = getBearerToken(request);
    if (!bearer || !(await verifySupabaseToken(bearer))) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const apiKey = getOpenRouterApiKey();

    // Validate incoming profile data
    const body = ProfileInputSchema.parse(await request.json());

    const userMessage = `
Name: ${body.display_name}
Primary focus problem: ${body.focus_problem}
Main distractions: ${body.distractions}
Goals: ${body.goals}
Work type: ${body.work_type}
Best focus time: ${body.best_focus_time}
Preferred language: ${body.primary_language}
Today's date: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
`.trim();

    const openRouter = new OpenRouter({ apiKey });

    const completion = await openRouter.chat.send({
      chatRequest: {
        model: 'openai/gpt-4o-mini',
        messages: [
          { role: 'system', content: BLOOM_SYSTEM_PROMPT },
          { role: 'user', content: userMessage },
        ],
        responseFormat: { type: 'json_object' },
        stream: false,
      },
    });

    const raw = completion.choices?.[0]?.message?.content ?? '';
    const bloom = parseBloomResponse(raw);

    if (!bloom) {
      console.error('[analyze-profile] Failed to parse BLOOM response:', raw);
      return NextResponse.json(
        { ok: false, error: 'AI returned an unexpected format. Please try again.' },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true, data: bloom });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: error.issues[0]?.message ?? 'Invalid request body' },
        { status: 400 }
      );
    }

    console.error('[analyze-profile] Error:', error);
    return NextResponse.json(
      { ok: false, error: errorMessage(error) },
      { status: 500 }
    );
  }
}
