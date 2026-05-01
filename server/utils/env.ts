function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing ${name}`);
  }

  return value;
}

export function getOpenRouterApiKey(): string {
  return requireEnv('OPENROUTER_API_KEY');
}

export function validateBackendEnv() {
  return {
    OPENROUTER_API_KEY: getOpenRouterApiKey(),
  };
}
