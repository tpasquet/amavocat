import { and, desc, eq, isNull, lte, ne, type SQL } from 'drizzle-orm';
import { z } from 'zod';
import type { Db } from '../db/client.js';
import { entries, type Entry } from '../db/schema.js';
import { locales, type ContentType, type Locale } from './registry.js';
import { slugify, slugPattern } from './slug.js';

export type EntryStatus = 'draft' | 'scheduled' | 'published';

export function entryStatus(entry: Pick<Entry, 'publishAt'>, now = new Date()): EntryStatus {
  if (!entry.publishAt) return 'draft';
  return entry.publishAt.getTime() > now.getTime() ? 'scheduled' : 'published';
}

export class EntryError extends Error {
  constructor(
    readonly code: 'validation' | 'slug_taken' | 'translation_exists' | 'not_found',
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
  }
}

const writeInput = z.object({
  locale: z.enum(locales).nullish(),
  slug: z.string().trim().max(80).regex(slugPattern).optional(),
  publishAt: z.iso.datetime({ offset: true }).nullish(),
  data: z.record(z.string(), z.unknown()),
  /** Id of an existing entry this one translates (localized types only) */
  translationOf: z.string().optional(),
});
export type EntryWriteInput = z.input<typeof writeInput>;

export function serializeEntry(entry: Entry, now = new Date()) {
  return {
    id: entry.id,
    type: entry.type,
    locale: entry.locale as Locale | null,
    translationGroup: entry.translationGroup,
    slug: entry.slug,
    status: entryStatus(entry, now),
    publishAt: entry.publishAt?.toISOString() ?? null,
    data: entry.data,
    createdAt: entry.createdAt.toISOString(),
    updatedAt: entry.updatedAt.toISOString(),
  };
}

function localeCondition(locale: string | null): SQL {
  return locale === null ? isNull(entries.locale) : eq(entries.locale, locale);
}

export class EntryService {
  constructor(private readonly db: Db) {}

  list(type: ContentType, filter: { locale?: Locale; status?: EntryStatus } = {}, now = new Date()) {
    const conditions = [eq(entries.type, type.name)];
    if (filter.locale) conditions.push(eq(entries.locale, filter.locale));
    const rows = this.db
      .select()
      .from(entries)
      .where(and(...conditions))
      .orderBy(desc(entries.updatedAt))
      .all();
    return filter.status ? rows.filter((row) => entryStatus(row, now) === filter.status) : rows;
  }

  get(type: ContentType, id: string): Entry {
    const entry = this.db
      .select()
      .from(entries)
      .where(and(eq(entries.type, type.name), eq(entries.id, id)))
      .get();
    if (!entry) throw new EntryError('not_found', 'Entry not found');
    return entry;
  }

  translations(entry: Entry): Entry[] {
    return this.db
      .select()
      .from(entries)
      .where(and(eq(entries.translationGroup, entry.translationGroup), ne(entries.id, entry.id)))
      .all();
  }

  create(type: ContentType, input: unknown, userId: string | null, now = new Date()): Entry {
    const parsed = this.parse(type, input);
    let translationGroup: string = crypto.randomUUID();
    if (parsed.translationOf) {
      const source = this.get(type, parsed.translationOf);
      translationGroup = source.translationGroup;
      const existing = this.db
        .select({ id: entries.id })
        .from(entries)
        .where(and(eq(entries.translationGroup, translationGroup), localeCondition(parsed.locale)))
        .get();
      if (existing) {
        throw new EntryError('translation_exists', `A ${parsed.locale} version already exists`);
      }
    }
    const slug = parsed.slug ?? this.suggestSlug(type, parsed.data);
    this.assertSlugFree(type, parsed.locale, slug);

    return this.db
      .insert(entries)
      .values({
        id: crypto.randomUUID(),
        type: type.name,
        locale: parsed.locale,
        translationGroup,
        slug,
        publishAt: parsed.publishAt,
        data: parsed.data,
        createdAt: now,
        updatedAt: now,
        createdBy: userId,
        updatedBy: userId,
      })
      .returning()
      .get();
  }

  update(type: ContentType, id: string, input: unknown, userId: string | null, now = new Date()): Entry {
    const current = this.get(type, id);
    const parsed = this.parse(type, { locale: current.locale, ...(input as object) });
    if (parsed.locale !== current.locale) {
      throw new EntryError('validation', 'The locale of an entry cannot change');
    }
    const slug = parsed.slug ?? current.slug;
    this.assertSlugFree(type, current.locale, slug, current.id);

    return this.db
      .update(entries)
      .set({ slug, publishAt: parsed.publishAt, data: parsed.data, updatedAt: now, updatedBy: userId })
      .where(eq(entries.id, current.id))
      .returning()
      .get()!;
  }

  delete(type: ContentType, id: string): void {
    const current = this.get(type, id);
    this.db.delete(entries).where(eq(entries.id, current.id)).run();
  }

  /** Published entries only: what the public site may show */
  listPublished(type: ContentType, locale: Locale | null, now = new Date()): Entry[] {
    const conditions = [eq(entries.type, type.name), lte(entries.publishAt, now)];
    if (type.localized && locale) conditions.push(eq(entries.locale, locale));
    return this.db
      .select()
      .from(entries)
      .where(and(...conditions))
      .orderBy(desc(entries.publishAt))
      .all();
  }

  private parse(type: ContentType, input: unknown) {
    const envelope = writeInput.safeParse(input);
    if (!envelope.success) {
      throw new EntryError('validation', 'Invalid entry', z.treeifyError(envelope.error));
    }
    const data = type.dataSchema.safeParse(envelope.data.data);
    if (!data.success) {
      throw new EntryError('validation', 'Invalid fields', z.treeifyError(data.error));
    }
    const locale = envelope.data.locale ?? null;
    if (type.localized && !locale) {
      throw new EntryError('validation', 'A locale is required for this content type');
    }
    if (!type.localized && locale) {
      throw new EntryError('validation', 'This content type is not localized');
    }
    if (!type.schedulable && envelope.data.publishAt === undefined) {
      // Content without scheduling is published as soon as it is saved
      envelope.data.publishAt = new Date(0).toISOString();
    }
    return {
      locale,
      slug: envelope.data.slug,
      publishAt: envelope.data.publishAt ? new Date(envelope.data.publishAt) : null,
      data: data.data as Record<string, unknown>,
      translationOf: envelope.data.translationOf,
    };
  }

  private suggestSlug(type: ContentType, data: Record<string, unknown>): string {
    const source = type.slugFrom ? data[type.slugFrom] : undefined;
    const slug = typeof source === 'string' ? slugify(source) : '';
    return slug || crypto.randomUUID().slice(0, 8);
  }

  private assertSlugFree(type: ContentType, locale: string | null, slug: string, exceptId?: string): void {
    const conditions = [eq(entries.type, type.name), localeCondition(locale), eq(entries.slug, slug)];
    if (exceptId) conditions.push(ne(entries.id, exceptId));
    const taken = this.db.select({ id: entries.id }).from(entries).where(and(...conditions)).get();
    if (taken) throw new EntryError('slug_taken', `The slug "${slug}" is already used`);
  }
}
