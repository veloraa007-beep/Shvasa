import { z } from 'zod';
import { getSupabaseEnv } from './public';

const ServerEnvSchema = z.object({
  OPENROUTER_API_KEY: z.string().min(1, 'Missing OPENROUTER_API_KEY'),
});

export function getOpenRouterApiKey(): string {
  const parsed = ServerEnvSchema.safeParse({
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? 'Invalid server environment configuration');
  }

  return parsed.data.OPENROUTER_API_KEY;
}

export function validateServerEnv() {
  return {
    ...getSupabaseEnv(),
    OPENROUTER_API_KEY: getOpenRouterApiKey(),
  };
}
