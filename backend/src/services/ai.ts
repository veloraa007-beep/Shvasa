import OpenAI from 'openai';
import { AIParseResultSchema } from '../../../shared/schemas';
import { getOpenRouterApiKey } from '../utils/env';

let openai: OpenAI | null = null;

function getOpenAIClient() {
  if (!openai) {
    openai = new OpenAI({
      apiKey: getOpenRouterApiKey(),
      baseURL: 'https://openrouter.ai/api/v1',
      defaultHeaders: {
        'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
        'X-Title': 'Shvasa AI Coach',
      },
    });
  }

  return openai;
}

export async function parseVoiceInput(transcript: string) {
  const start = Date.now();
  
  const completion = await getOpenAIClient().chat.completions.create({
    model: 'openai/gpt-4o-mini',
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `You are Shvasa AI. Extract structured tasks from voice transcripts.
Return JSON matching:
{
  "task": {
    "title": "string",
    "deadline": "ISO8601 string or null",
    "priority": "LOW|MEDIUM|HIGH",
    "subtasks": [{"text": "string", "order": "number"}],
    "notes": "string"
  },
  "confidence": 0.0-1.0,
  "needs_confirmation": boolean
}
Rules:
- Remove filler words (um, uh, like)
- Resolve approximate times: "around 3" → "15:00", "end of day" → "17:00"
- "tomorrow" → tomorrow same time, "next week" → +7 days
- If deadline uncertain, set confidence < 0.7 and needs_confirmation=true`
      },
      { role: 'user', content: transcript }
    ],
  });

  const latency = Date.now() - start;
  const rawOutput = completion.choices[0].message.content || '{}';
  
  // Zod validation strictly enforces structural contract
  const parsed = AIParseResultSchema.parse(JSON.parse(rawOutput));
  return { ...parsed, _latency: latency };
}
