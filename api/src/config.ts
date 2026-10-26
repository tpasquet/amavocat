import { z } from 'zod';

const booleanString = z
  .enum(['true', 'false'])
  .transform((value) => value === 'true');

const configSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  // Alwaysdata exposes the address and port the site must listen on as IP and PORT
  IP: z.string().default('127.0.0.1'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_PATH: z.string().default('./data/amavocat.sqlite'),
  CORS_ORIGINS: z
    .string()
    .default('')
    .transform((value) => value.split(',').map((origin) => origin.trim()).filter(Boolean)),
  COOKIE_SECURE: booleanString.default(false),
  SESSION_TTL_DAYS: z.coerce.number().int().positive().default(7),
});

export type Config = {
  env: 'development' | 'test' | 'production';
  host: string;
  port: number;
  databasePath: string;
  corsOrigins: string[];
  cookieSecure: boolean;
  sessionTtlMs: number;
};

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const parsed = configSchema.parse(env);
  return {
    env: parsed.NODE_ENV,
    host: parsed.IP,
    port: parsed.PORT,
    databasePath: parsed.DATABASE_PATH,
    corsOrigins: parsed.CORS_ORIGINS,
    cookieSecure: parsed.COOKIE_SECURE,
    sessionTtlMs: parsed.SESSION_TTL_DAYS * 24 * 60 * 60 * 1000,
  };
}
