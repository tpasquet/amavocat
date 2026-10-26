import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import { z } from 'zod';
import type { Config } from '../config.js';
import type { Db } from '../db/client.js';
import type { PublicUser } from '../db/schema.js';
import { getDummyHash, verifyPassword } from './password.js';
import { createSession, deleteSession, findSessionUser, SESSION_COOKIE } from './sessions.js';
import { findUserByEmail } from './users.js';

declare module 'fastify' {
  interface FastifyRequest {
    user: PublicUser | null;
  }
  interface FastifyInstance {
    requireUser: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

const loginBody = z.object({
  email: z.string().trim().pipe(z.email()),
  password: z.string().min(1).max(1024),
});

export const authPlugin = fp(async (app: FastifyInstance, opts: { db: Db; config: Config }) => {
  const { db, config } = opts;

  const cookieOptions = {
    path: '/',
    httpOnly: true,
    secure: config.cookieSecure,
    sameSite: 'strict' as const,
  };

  app.decorateRequest('user', null);

  app.addHook('onRequest', async (request) => {
    const token = request.cookies[SESSION_COOKIE];
    request.user = token ? (findSessionUser(db, token) ?? null) : null;
  });

  app.decorate('requireUser', async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.user) {
      await reply.code(401).send({ error: 'unauthorized' });
    }
  });

  app.post(
    '/api/auth/login',
    {
      config: {
        // Brute-force protection: 5 attempts per 15 minutes per IP
        rateLimit: { max: 5, timeWindow: '15 minutes' },
      },
    },
    async (request, reply) => {
      const parsed = loginBody.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: 'invalid_body' });
      }

      const user = findUserByEmail(db, parsed.data.email);
      const valid = await verifyPassword(user?.passwordHash ?? (await getDummyHash()), parsed.data.password);
      if (!user || !valid) {
        return reply.code(401).send({ error: 'invalid_credentials' });
      }

      const session = createSession(db, user.id, config.sessionTtlMs);
      reply.setCookie(SESSION_COOKIE, session.token, { ...cookieOptions, expires: session.expiresAt });
      return { user: { id: user.id, email: user.email, displayName: user.displayName, role: user.role } };
    },
  );

  app.post('/api/auth/logout', async (request, reply) => {
    const token = request.cookies[SESSION_COOKIE];
    if (token) {
      deleteSession(db, token);
    }
    reply.clearCookie(SESSION_COOKIE, cookieOptions);
    return reply.code(204).send();
  });

  app.get('/api/auth/me', { preHandler: app.requireUser }, async (request) => ({ user: request.user }));
});
