import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { FastifyInstance } from 'fastify';
import fastifyStatic from '@fastify/static';
import type { Config } from '../config.js';

/**
 * Serves the Angular admin app (projects/admin) under /admin/, from the same origin as the API
 * so the session cookie needs no cross-site setup.
 */
export async function adminRoutes(app: FastifyInstance, opts: { config: Config }) {
  const root = resolve(opts.config.adminDir);
  if (!existsSync(resolve(root, 'index.html'))) {
    app.log.warn({ root }, 'Admin app not found, /admin/ is disabled');
    return;
  }

  app.addHook('onSend', async (request, reply) => {
    if (request.url.startsWith('/admin')) {
      reply.header('x-frame-options', 'DENY');
      reply.header('content-security-policy', "frame-ancestors 'none'");
      reply.header('referrer-policy', 'same-origin');
      reply.header('x-robots-tag', 'noindex, nofollow');
    }
  });

  await app.register(fastifyStatic, {
    root,
    prefix: '/admin/',
    // The media plugin already decorates the reply with sendFile
    decorateReply: false,
    wildcard: false,
    index: ['index.html'],
    // Hashed bundles can be cached forever; index.html must always be revalidated
    setHeaders: (res, path) => {
      res.header('cache-control', path.endsWith('index.html') ? 'no-cache' : 'public, max-age=31536000, immutable');
    },
  });

  app.get('/admin', async (_request, reply) => reply.redirect('/admin/'));

  // Client-side routes (/admin/content/article/…) all load the app shell
  const indexHtml = await readFile(resolve(root, 'index.html'), 'utf8');
  app.get('/admin/*', async (_request, reply) =>
    reply.type('text/html').header('cache-control', 'no-cache').send(indexHtml),
  );
}
