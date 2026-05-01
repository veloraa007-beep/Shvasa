import { NextRequest, NextResponse } from 'next/server';
import { OpenRouter } from '@openrouter/sdk';
import { z } from 'zod';
import { getSupabaseEnv } from '@/lib/env/public';
import { getOpenRouterApiKey } from '@/lib/env/server';

// ─── Schema ───────────────────────────────────────────────────────────────────

const RequestSchema = z.object({
  question_id: z.string().trim().min(1),
  question_label: z.string().trim().min(1),
  user_response: z.string().trim().min(1),
  conversation_so_far: z.array(
    z.object({ q: z.string(), a: z.string() })
  ).default([]),
});

const DiagnoseResponseSchema = z.object({
  follow_up: z.string().trim().min(1),
  is_final: z.boolean(),
  inferred: z.record(z.string()).optional(),
});

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

const DIAGNOSE_SYSTEM_PROMPT = `You are BLOOM — a precise behavioral diagnosis engine inside Shvasa.

A user said "I'm not sure" when asked an onboarding question. Your job is to ask short, sharp follow-up questions to identify their real situation.

Rules:
- Ask ONE question at a time
- Keep questions short (max 12 words)
- Be conversational, not clinical
- After 2-5 exchanges, you will have enough to infer the answer
- When you have enough, set "is_final": true and fill "inferred" with the structured data

"inferred" keys depend on the original question:
- "work_type" → infer what kind of work they do
- "focus_problem" → infer their main focus challenge  
- "distractions" → infer their main distractions
- "best_focus_time" → infer when they focus best
- "goals" → infer what they want to achieve

Return ONLY valid JSON:
{
  "follow_up": "your next question here",
  "is_final": false,
  "inferred": {}
}

When is_final is true:
{
  "follow_up": "Got it. I've identified your pattern.",
  "is_final": true,
  "inferred": { "fieldName": "inferred value, comma-separated if multiple" }
}

NEVER ask more than 5 follow-up questions total.
NEVER sound clinical or robotic.
Return ONLY JSON.`;

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const bearer = getBearerToken(request);
    if (!bearer || !(await verifyToken(bearer))) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const apiKey = getOpenRouterApiKey();

    const body = RequestSchema.parse(await request.json());

    const historyText = body.conversation_so_far
      .map((c, i) => `Q${i + 1}: ${c.q}\nUser: ${c.a}`)
      .join('\n');

    const userMessage = `
Original question: "${body.question_label}"
User said: "${body.user_response}"
${historyText ? `\nConversation so far:\n${historyText}` : ''}
Exchanges so far: ${body.conversation_so_far.length}
Max exchanges allowed: 5
`.trim();

    const openRouter = new OpenRouter({ apiKey });
    const completion = await openRouter.chat.send({
      chatRequest: {
        model: 'openai/gpt-4o-mini',
        messages: [
          { role: 'system', content: DIAGNOSE_SYSTEM_PROMPT },
          { role: 'user', content: userMessage },
        ],
        responseFormat: { type: 'json_object' },
        stream: false,
      },
    });

    const raw = completion.choices?.[0]?.message?.content ?? '';
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
    const result = DiagnoseResponseSchema.parse(JSON.parse(cleaned));

    return NextResponse.json({ ok: true, data: result });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: error.issues[0]?.message ?? 'Invalid request' },
        { status: 400 }
      );
    }
    console.error('[diagnose] Error:', error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unexpected error' },
      { status: 500 }
    );
  }
}
