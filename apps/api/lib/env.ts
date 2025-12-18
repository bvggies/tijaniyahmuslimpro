const requiredEnv = [
  'DATABASE_URL',
  'JWT_SECRET',
  'REFRESH_SECRET',
  'PLACES_API_KEY',
  'GROQ_API_KEY',
] as const;

type RequiredEnvKey = (typeof requiredEnv)[number];

export function getEnv(key: RequiredEnvKey): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required env var: ${key}`);
  }
  return value;
}


