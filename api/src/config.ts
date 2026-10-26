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
  MEDIA_DIR: z.string().default('./data/media'),
  // Built admin app (ng build admin), served under /admin/
  ADMIN_DIR: z.string().default('../dist/admin/browser'),
  // Public origin of the API, used to build absolute URLs of uploaded images
  PUBLIC_URL: z.url().default('http://localhost:3000'),
  CORS_ORIGINS: z
    .string()
    .default('')
    .transform((value) => value.split(',').map((origin) => origin.trim()).filter(Boolean)),
  COOKIE_SECURE: booleanString.default(false),
  // Fine-grained token with "Contents: read and write" on the repository, used to trigger the site rebuild
  GITHUB_DISPATCH_TOKEN: z.string().optional(),
  GITHUB_REPOSITORY: z.string().default('tpasquet/amavocat'),
  SESSION_TTL_DAYS: z.coerce.number().int().positive().default(7),
});

export type Config = {
  env: 'development' | 'test' | 'production';
  host: string;
  port: number;
  databasePath: string;
  mediaDir: string;
  adminDir: string;
  publicUrl: string;
  corsOrigins: string[];
  cookieSecure: boolean;
  githubDispatchToken: string | undefined;
  githubRepository: string;
  sessionTtlMs: number;
};

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const parsed = configSchema.parse(env);
  return {
    env: parsed.NODE_ENV,
    host: parsed.IP,
    port: parsed.PORT,
    databasePath: parsed.DATABASE_PATH,
    mediaDir: parsed.MEDIA_DIR,
    adminDir: parsed.ADMIN_DIR,
    publicUrl: parsed.PUBLIC_URL.replace(/\/+$/, ''),
    corsOrigins: parsed.CORS_ORIGINS,
    cookieSecure: parsed.COOKIE_SECURE,
    githubDispatchToken: parsed.GITHUB_DISPATCH_TOKEN || undefined,
    githubRepository: parsed.GITHUB_REPOSITORY,
    sessionTtlMs: parsed.SESSION_TTL_DAYS * 24 * 60 * 60 * 1000,
  };
}
