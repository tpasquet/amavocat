import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';

export const userRoles = ['admin', 'editor'] as const;
export type UserRole = (typeof userRoles)[number];

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  displayName: text('display_name').notNull(),
  passwordHash: text('password_hash').notNull(),
  role: text('role', { enum: userRoles }).notNull().default('editor'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
});

export const sessions = sqliteTable(
  'sessions',
  {
    // SHA-256 of the token stored in the cookie, so a database leak does not expose live sessions
    tokenHash: text('token_hash').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (table) => [index('sessions_user_id_idx').on(table.userId)],
);

export type User = typeof users.$inferSelect;
export type PublicUser = Pick<User, 'id' | 'email' | 'displayName' | 'role'>;
