import { sqliteTable, text, integer, index, uniqueIndex } from 'drizzle-orm/sqlite-core';

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

export const entries = sqliteTable(
  'entries',
  {
    id: text('id').primaryKey(),
    type: text('type').notNull(),
    // null for content types that are not localized
    locale: text('locale'),
    // Entries that are translations of each other share this id
    translationGroup: text('translation_group').notNull(),
    slug: text('slug').notNull(),
    // null = draft; future = scheduled; past = published
    publishAt: integer('publish_at', { mode: 'timestamp_ms' }),
    // Field values, validated against the content type's schema before every write
    data: text('data', { mode: 'json' }).notNull().$type<Record<string, unknown>>(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
    createdBy: text('created_by').references(() => users.id, { onDelete: 'set null' }),
    updatedBy: text('updated_by').references(() => users.id, { onDelete: 'set null' }),
  },
  (table) => [
    uniqueIndex('entries_type_locale_slug_idx').on(table.type, table.locale, table.slug),
    index('entries_type_publish_at_idx').on(table.type, table.publishAt),
    index('entries_translation_group_idx').on(table.translationGroup),
  ],
);

export type Entry = typeof entries.$inferSelect;

/** Small key/value store for server state (e.g. when the last site rebuild was requested) */
export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
});
