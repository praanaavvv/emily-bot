import dotenv from 'dotenv';
import { envSchema, type Env } from '../validators/env.validator.js';

export function loadEnv(): Env {
  dotenv.config();
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('\n');
    throw new Error(`Environment validation failed:\n${issues}`);
  }
  return parsed.data;
}
