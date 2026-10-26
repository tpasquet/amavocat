import Fastify from 'fastify';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import type { Config } from './config.js';
import type { Db } from './db/client.js';
import { authPlugin } from './auth/plugin.js';

export async function buildApp(opts: { config: Config; db: Db }) {
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
    if (origin && !config.corsOrigins.includes(origin)) {
      await reply.code(403).send({ error: 'forbidden_origin' });
    }
  });

  await app.register(authPlugin, { db, config });

  app.get('/api/health', async () => ({ status: 'ok' }));

  return app;
}
