import Fastify from 'fastify';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import type { Config } from './config.js';
import type { Db } from './db/client.js';
import { authPlugin } from './auth/plugin.js';
import { contentRoutes, type EntriesChangedEvent } from './content/routes.js';
import { ContentTypeRegistry } from './content/registry.js';
import { contentTypes } from './content/types/index.js';
import { mediaRoutes } from './media/routes.js';
import { adminRoutes } from './admin/routes.js';

export async function buildApp(opts: {
  config: Config;
  db: Db;
  registry?: ContentTypeRegistry;
  onEntriesChanged?: (event: EntriesChangedEvent) => void;
}) {
  const { config, db } = opts;

  const app = Fastify({
    logger: config.env === 'test' ? false : { level: config.env === 'production' ? 'info' : 'debug' },
    // Alwaysdata serves Node sites behind its HTTP proxy
    trustProxy: true,
  });

  await app.register(cookie);
  await app.register(cors, { origin: config.corsOrigins, credentials: true });
  // Opt-in per route (login); other routes are not rate limited for now
  await app.register(rateLimit, { global: false });

  // Cookies are SameSite=Strict; also refuse state-changing requests coming from unknown origins
  app.addHook('onRequest', async (request, reply) => {
    if (request.method === 'GET' || request.method === 'HEAD' || request.method === 'OPTIONS') {
      return;
    }
    const origin = request.headers.origin;
    if (origin && !config.corsOrigins.includes(origin) && !isSameOrigin(origin, request.host)) {
      await reply.code(403).send({ error: 'forbidden_origin' });
    }
  });

  await app.register(authPlugin, { db, config });
  await app.register(contentRoutes, {
    db,
    registry: opts.registry ?? new ContentTypeRegistry(contentTypes),
    onEntriesChanged: opts.onEntriesChanged,
  });
  await app.register(mediaRoutes, { config });
  await app.register(adminRoutes, { config });

  app.get('/api/health', async () => ({ status: 'ok' }));

  return app;
}

// The admin app is served by the API itself, so its requests carry the API's own origin
function isSameOrigin(origin: string, host: string): boolean {
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
