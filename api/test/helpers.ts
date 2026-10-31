import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { loadConfig } from '../src/config.js';
import type { EntriesChangedEvent } from '../src/content/routes.js';
import { createUser } from '../src/auth/users.js';
import { openDatabase } from '../src/db/client.js';
import { buildApp } from '../src/app.js';
import type { MailMessage } from '../src/contact/mailer.js';

export const ADMIN_ORIGIN = 'http://admin.test';
export const SITE_ORIGIN = 'https://site.test';

export async function setupApp(options: { env?: Record<string, string>; failMail?: boolean } = {}) {
  const mediaDir = mkdtempSync(join(tmpdir(), 'amavocat-media-'));
  const config = loadConfig({
    NODE_ENV: 'test',
    DATABASE_PATH: ':memory:',
    MEDIA_DIR: mediaDir,
    PUBLIC_URL: 'https://api.test',
    CORS_ORIGINS: `${ADMIN_ORIGIN},${SITE_ORIGIN}`,
    SMTP_HOST: 'smtp.test',
    CONTACT_TO: 'contact@example.com',
    CONTACT_FROM: 'Site <site@example.com>',
    ...options.env,
  });
  const { db, close } = openDatabase(config.databasePath);
  const events: EntriesChangedEvent[] = [];
  const mails: MailMessage[] = [];
  const app = await buildApp({
    config,
    db,
    onEntriesChanged: (event) => events.push(event),
    mailer: {
      async send(message) {
        if (options.failMail) {
          throw new Error('SMTP down');
        }
        mails.push(message);
      },
    },
  });
  return {
    app,
    db,
    config,
    events,
    mails,
    async teardown() {
      await app.close();
      close();
      rmSync(mediaDir, { recursive: true, force: true });
    },
  };
}

/** Creates an account and returns the session cookie of a logged-in request */
export async function loginAs(ctx: Awaited<ReturnType<typeof setupApp>>, email = 'aurelie@example.com') {
  const password = 'correct horse battery';
  await createUser(ctx.db, { email, password, displayName: 'Aurélie Manier', role: 'admin' });
  const res = await ctx.app.inject({ method: 'POST', url: '/api/auth/login', payload: { email, password } });
  return sessionCookie(res.headers['set-cookie']);
}

export function sessionCookie(setCookie: string | string[] | undefined): string {
  const header = Array.isArray(setCookie) ? setCookie[0] : setCookie;
  if (!header) {
    throw new Error('No Set-Cookie header');
  }
  return header.split(';')[0]!;
}
