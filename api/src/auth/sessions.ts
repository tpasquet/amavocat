import { createHash, randomBytes } from 'node:crypto';
import { and, eq, gt, lte } from 'drizzle-orm';
import type { Db } from '../db/client.js';
import { sessions, users, type PublicUser } from '../db/schema.js';

export const SESSION_COOKIE = 'amv_session';

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function createSession(db: Db, userId: string, ttlMs: number, now = new Date()) {
  const token = randomBytes(32).toString('base64url');
  const expiresAt = new Date(now.getTime() + ttlMs);
  db.insert(sessions)
    .values({ tokenHash: hashToken(token), userId, createdAt: now, expiresAt })
    .run();
  return { token, expiresAt };
}

export function findSessionUser(db: Db, token: string, now = new Date()): PublicUser | undefined {
  return db
    .select({ id: users.id, email: users.email, displayName: users.displayName, role: users.role })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(and(eq(sessions.tokenHash, hashToken(token)), gt(sessions.expiresAt, now)))
    .get();
}

export function deleteSession(db: Db, token: string): void {
  db.delete(sessions).where(eq(sessions.tokenHash, hashToken(token))).run();
}

export function deleteExpiredSessions(db: Db, now = new Date()): void {
  db.delete(sessions).where(lte(sessions.expiresAt, now)).run();
}
