import { loadConfig } from '../src/config.js';
import { openDatabase } from '../src/db/client.js';
import { buildApp } from '../src/app.js';

export const ADMIN_ORIGIN = 'http://admin.test';

export async function setupApp() {
  const config = loadConfig({ NODE_ENV: 'test', DATABASE_PATH: ':memory:', CORS_ORIGINS: ADMIN_ORIGIN });
  const { db, close } = openDatabase(config.databasePath);
  const app = await buildApp({ config, db });
  return {
    app,
    db,
    config,
    async teardown() {
      await app.close();
      close();
    },
  };
}

export function sessionCookie(setCookie: string | string[] | undefined): string {
  const header = Array.isArray(setCookie) ? setCookie[0] : setCookie;
  if (!header) {
    throw new Error('No Set-Cookie header');
  }
  return header.split(';')[0]!;
}
