import type { FastifyInstance, FastifyReply } from 'fastify';
import { z } from 'zod';
import type { Db } from '../db/client.js';
import { EntryError, EntryService, entryStatus, serializeEntry } from './entries.js';
import { describeContentType, locales, type ContentTypeRegistry } from './registry.js';

const listQuery = z.object({
  locale: z.enum(locales).optional(),
  status: z.enum(['draft', 'scheduled', 'published']).optional(),
});
const publicQuery = z.object({ locale: z.enum(locales).optional() });

const errorStatus: Record<EntryError['code'], number> = {
  validation: 400,
  slug_taken: 409,
  translation_exists: 409,
  not_found: 404,
};

function sendEntryError(reply: FastifyReply, error: unknown) {
  if (error instanceof EntryError) {
    return reply.code(errorStatus[error.code]).send({ error: error.code, message: error.message, details: error.details });
  }
  throw error;
}

export interface EntriesChangedEvent {
  type: string;
  action: 'created' | 'updated' | 'deleted';
  id: string;
  /** The entry is, or was until this change, visible on the public site */
  affectsPublicSite: boolean;
}

export async function contentRoutes(
  app: FastifyInstance,
  opts: { db: Db; registry: ContentTypeRegistry; onEntriesChanged?: (event: EntriesChangedEvent) => void },
) {
  const service = new EntryService(opts.db);
  const notify = (event: EntriesChangedEvent) => opts.onEntriesChanged?.(event);

  const resolveType = (name: string, reply: FastifyReply) => {
    const type = opts.registry.get(name);
    if (!type) {
      void reply.code(404).send({ error: 'unknown_type' });
    }
    return type;
  };

  // Admin: everything below requires a session
  await app.register(async (admin) => {
    admin.addHook('preHandler', app.requireUser);

    admin.get('/api/admin/content-types', async () => ({
      contentTypes: opts.registry.all().map(describeContentType),
      locales,
    }));

    admin.get<{ Params: { type: string } }>('/api/admin/entries/:type', async (request, reply) => {
      const type = resolveType(request.params.type, reply);
      if (!type) return reply;
      const query = listQuery.safeParse(request.query);
      if (!query.success) return reply.code(400).send({ error: 'invalid_query' });
      return { entries: service.list(type, query.data).map((entry) => serializeEntry(entry)) };
    });

    admin.get<{ Params: { type: string; id: string } }>('/api/admin/entries/:type/:id', async (request, reply) => {
      const type = resolveType(request.params.type, reply);
      if (!type) return reply;
      try {
        const entry = service.get(type, request.params.id);
        return {
          entry: serializeEntry(entry),
          translations: service.translations(entry).map((t) => ({ id: t.id, locale: t.locale, slug: t.slug })),
        };
      } catch (error) {
        return sendEntryError(reply, error);
      }
    });

    admin.post<{ Params: { type: string } }>('/api/admin/entries/:type', async (request, reply) => {
      const type = resolveType(request.params.type, reply);
      if (!type) return reply;
      try {
        const entry = service.create(type, request.body, request.user!.id);
        notify({ type: type.name, action: 'created', id: entry.id, affectsPublicSite: entryStatus(entry) === 'published' });
        return reply.code(201).send({ entry: serializeEntry(entry) });
      } catch (error) {
        return sendEntryError(reply, error);
      }
    });

    admin.put<{ Params: { type: string; id: string } }>('/api/admin/entries/:type/:id', async (request, reply) => {
      const type = resolveType(request.params.type, reply);
      if (!type) return reply;
      try {
        const wasPublished = entryStatus(service.get(type, request.params.id)) === 'published';
        const entry = service.update(type, request.params.id, request.body, request.user!.id);
        notify({
          type: type.name,
          action: 'updated',
          id: entry.id,
          affectsPublicSite: wasPublished || entryStatus(entry) === 'published',
        });
        return { entry: serializeEntry(entry) };
      } catch (error) {
        return sendEntryError(reply, error);
      }
    });

    admin.delete<{ Params: { type: string; id: string } }>('/api/admin/entries/:type/:id', async (request, reply) => {
      const type = resolveType(request.params.type, reply);
      if (!type) return reply;
      try {
        const wasPublished = entryStatus(service.get(type, request.params.id)) === 'published';
        service.delete(type, request.params.id);
        notify({ type: type.name, action: 'deleted', id: request.params.id, affectsPublicSite: wasPublished });
        return reply.code(204).send();
      } catch (error) {
        return sendEntryError(reply, error);
      }
    });
  });

  // Public: published entries only, read by the site build
  app.get<{ Params: { type: string } }>('/api/public/entries/:type', async (request, reply) => {
    const type = resolveType(request.params.type, reply);
    if (!type) return reply;
    const query = publicQuery.safeParse(request.query);
    if (!query.success) return reply.code(400).send({ error: 'invalid_query' });
    const now = new Date();
    return {
      entries: service.listPublished(type, query.data.locale ?? null, now).map((entry) => {
        const { status: _status, ...rest } = serializeEntry(entry, now);
        return rest;
      }),
    };
  });
}
