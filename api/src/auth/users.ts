import { eq } from 'drizzle-orm';
import type { Db } from '../db/client.js';
import { users, type User, type UserRole } from '../db/schema.js';
import { hashPassword, MIN_PASSWORD_LENGTH } from './password.js';

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function findUserByEmail(db: Db, email: string): User | undefined {
  return db.select().from(users).where(eq(users.email, normalizeEmail(email))).get();
}

export async function createUser(
  db: Db,
  input: { email: string; displayName: string; password: string; role: UserRole },
): Promise<User> {
  if (input.password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long`);
  }
  const now = new Date();
  return db
    .insert(users)
    .values({
      id: crypto.randomUUID(),
      email: normalizeEmail(input.email),
      displayName: input.displayName.trim(),
      passwordHash: await hashPassword(input.password),
      role: input.role,
      createdAt: now,
      updatedAt: now,
    })
    .returning()
    .get();
}

export async function setPassword(db: Db, userId: string, password: string): Promise<void> {
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long`);
  }
  db.update(users)
    .set({ passwordHash: await hashPassword(password), updatedAt: new Date() })
    .where(eq(users.id, userId))
    .run();
}
