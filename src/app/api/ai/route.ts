import { NextRequest, NextResponse } from 'next/server';
import { OpenRouter } from '@openrouter/sdk';
import { z } from 'zod';
import { getSupabaseEnv } from '@/lib/env/public';
import { getOpenRouterApiKey } from '@/lib/env/server';

const RequestSchema = z.object({
  message: z.string().trim().min(1, 'Message is required'),
});

const AIPlanSchema = z.object({
  type: z.enum(['task', 'note', 'reminder', 'focus', 'chat']),
  title: z
    .string()
    .trim()
    .refine((value) => value.split(/\s+/).filter(Boolean).length <= 5, 'Title must be 5 words or fewer'),
  description: z.string().trim(),
  deadline: z.string().datetime().nullable(),
  priority: z.enum(['low', 'medium', 'high']),
  steps: z.array(z.string().trim().min(1)),
  confidence: z.number().min(0).max(1),
  reply: z.string().trim().max(100),
});

type AIPlan = z.infer<typeof AIPlanSchema>;

const SYSTEM_PROMPT = `
You are Shvasa - a calm, nature-inspired AI execution coach.

Your philosophy: Work should feel like tending a garden. Each task is a seed. Focus is sunlight. Completion is a bloom.

Tone: Gentle, encouraging, minimal noise. Guide don't chatter.

Return ONLY valid JSON matching this exact schema:
{
  "type": "task | note | reminder | focus | chat",
  "title": "short memorable title (max 5 words)",
  "description": "clear, concise description",
  "deadline": "ISO datetime string or null",
  "priority": "low | medium | high",
  "steps": ["micro-step 1", "micro-step 2"],
  "confidence": 0.0-1.0,
  "reply": "friendly confirmation (max 100 chars, warm tone)"
}

Rules:
- Listen for intention. If unclear, ask gently via chat type.
- Tasks: Break into tiny steps (3-5 min each).
- If user says "start focus" or "I'm distracted" -> type:"focus"
- If user wants to capture a thought -> type:"note"
- If user sets reminder/alert -> type:"reminder"
- Deadlines: infer from context. If none -> null.
- Priority: urgent words -> high, someday -> low, else medium.
- Confidence < 0.7 -> add uncertainty hint in reply.
- Keep replies warm but brief. Like a breath of fresh air.

Return ONLY JSON. No markdown, no extra text.
`;

function getBearerToken(request: NextRequest) {
  const auth = request.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  return auth.slice('Bearer '.length).trim() || null;
}

async function verifySupabaseToken(token: string) {
  const env = getSupabaseEnv();

  const response = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`, {
    headers: {
      apikey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token}`,
    },
  });

  return response.ok;
}

function fallbackPlan(raw: string): AIPlan {
  const trimmed = raw.trim();
  return {
    type: 'chat',
    title: '',
    description: trimmed || 'I could not shape that yet.',
    deadline: null,
    priority: 'medium',
    steps: [],
    confidence: 0.5,
    reply: (trimmed || 'Try once more, gently.').slice(0, 100),
  };
}

function parseAIPlan(raw: string): AIPlan {
  try {
    return AIPlanSchema.parse(JSON.parse(raw));
  } catch {
    return fallbackPlan(raw);
  }
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Unexpected AI route error';
}

export async function POST(request: NextRequest) {
  try {
    const bearer = getBearerToken(request);
    if (!bearer || !(await verifySupabaseToken(bearer))) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const apiKey = getOpenRouterApiKey();

    const { message } = RequestSchema.parse(await request.json());
    const openRouter = new OpenRouter({ apiKey });

    const completion = await openRouter.chat.send({
      chatRequest: {
        model: 'openai/gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: JSON.stringify({
              user_input: message,
              now: new Date().toISOString(),
            }),
          },
        ],
        responseFormat: { type: 'json_object' },
        stream: false,
      },
    });

    const raw = completion.choices?.[0]?.message?.content ?? '';
    return NextResponse.json({ ok: true, data: parseAIPlan(raw) });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ ok: false, error: error.issues[0]?.message ?? 'Invalid request' }, { status: 400 });
    }

    console.error('AI route error:', error);
    return NextResponse.json({ ok: false, error: errorMessage(error) }, { status: 500 });
  }
}
