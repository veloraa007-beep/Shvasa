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

export async function cleanupTranscription(raw: string): Promise<string> {
  const completion = await getOpenAIClient().chat.completions.create({
    model: 'openai/gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `Clean voice transcription into clear task commands.
Remove: um, uh, like, you know, so, actually.
Resolve times: "3ish" → "3:00 PM", "end of day" → "5:00 PM", "morning" → "9:00 AM".
If ambiguous, add "[?]" after time.
Return ONLY cleaned text.`
      },
      { role: 'user', content: raw }
    ],
  });
  return completion.choices[0].message.content || raw;
}

export async function extractTaskData(cleaned: string, today: string) {
  const completion = await getOpenAIClient().chat.completions.create({
    model: 'openai/gpt-4o-mini',
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `Extract task data. Return JSON:
{
  "title": "string",
  "deadline": "ISO datetime or null",
  "priority": "HIGH|MEDIUM|LOW",
  "subtasks": [{"text":"string","order":number}],
  "notes": "string or null",
  "estimated_minutes": number or null,
  "confidence": 0.0-1.0
}
Today: ${today}. Resolve "tomorrow" → +1d, "next week" → +7d.`
      },
      { role: 'user', content: cleaned }
    ],
  });
  return JSON.parse(completion.choices[0].message.content || '{}');
}

export async function detectSchedulingConflicts(newTask: any, existingTasks: any[]) {
    const completion = await getOpenAIClient().chat.completions.create({
      model: 'openai/gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `Detect scheduling conflicts for new task.
Return: { "conflict_detected": boolean, "conflicting_task_id": string|null, "conflict_type": "overlap"|"back_to_back"|"overload"|null, "suggested_reschedule_time": "ISO string or null" }`
        },
        { role: 'user', content: JSON.stringify({ newTask, existingTasks }) }
      ],
    });
    return JSON.parse(completion.choices[0].message.content || '{}');
  }
