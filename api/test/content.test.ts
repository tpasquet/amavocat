import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { loginAs, setupApp } from './helpers.js';

const hour = 60 * 60 * 1000;

describe('content entries', () => {
  let ctx: Awaited<ReturnType<typeof setupApp>>;
  let cookie: string;

  beforeEach(async () => {
    ctx = await setupApp();
    cookie = await loginAs(ctx);
  });

  afterEach(async () => {
    await ctx.teardown();
  });

  const api = (method: 'GET' | 'POST' | 'PUT' | 'DELETE', url: string, payload?: object) =>
    ctx.app.inject({ method, url, payload, headers: { cookie } });

  const article = (overrides: Record<string, unknown> = {}, data: Record<string, unknown> = {}) => ({
    locale: 'fr',
    data: { title: 'Le divorce par consentement mutuel', body: '<p>Contenu</p>', ...data },
    ...overrides,
  });

  it('requires a session for admin routes', async () => {
    const res = await ctx.app.inject({ method: 'GET', url: '/api/admin/entries/article' });
    expect(res.statusCode).toBe(401);
  });

  it('describes the content types for the admin forms', async () => {
    const res = await api('GET', '/api/admin/content-types');
    const article = res.json().contentTypes.find((t: { name: string }) => t.name === 'article');
    expect(article).toMatchObject({ localized: true, schedulable: true, titleField: 'title' });
    expect(article.fields.map((f: { key: string }) => f.key)).toEqual([
      'title', 'subtitle', 'description', 'body', 'tags', 'featuredImage',
    ]);
  });

  it('creates a draft with a slug derived from the title', async () => {
    const res = await api('POST', '/api/admin/entries/article', article());
    expect(res.statusCode).toBe(201);
    expect(res.json().entry).toMatchObject({
      slug: 'le-divorce-par-consentement-mutuel',
      status: 'draft',
      publishAt: null,
      locale: 'fr',
    });
    expect(ctx.events).toEqual([{ type: 'article', action: 'created', id: res.json().entry.id, affectsPublicSite: false }]);
  });

  it('validates fields against the content type', async () => {
    const res = await api('POST', '/api/admin/entries/article', article({}, { title: '' }));
    expect(res.statusCode).toBe(400);
    expect(res.json().error).toBe('validation');

    const noLocale = await api('POST', '/api/admin/entries/article', article({ locale: undefined }));
    expect(noLocale.statusCode).toBe(400);
  });

  it('strips dangerous HTML from rich text', async () => {
    const res = await api(
      'POST',
      '/api/admin/entries/article',
      article({}, { body: '<p onclick="x()">Hi<script>alert(1)</script> <a href="javascript:x()">l</a></p>' }),
    );
    expect(res.json().entry.data.body).toBe('<p>Hi <a rel="noopener noreferrer">l</a></p>');
  });

  it('refuses a slug already used in the same locale but allows it in another', async () => {
    await api('POST', '/api/admin/entries/article', article());
    const duplicate = await api('POST', '/api/admin/entries/article', article());
    expect(duplicate.statusCode).toBe(409);
    const english = await api('POST', '/api/admin/entries/article', article({ locale: 'en' }));
    expect(english.statusCode).toBe(201);
  });

  it('links translations and refuses a second version in the same locale', async () => {
    const fr = (await api('POST', '/api/admin/entries/article', article())).json().entry;
    const en = await api(
      'POST',
      '/api/admin/entries/article',
      article({ locale: 'en', translationOf: fr.id }, { title: 'Divorce by mutual consent' }),
    );
    expect(en.json().entry.translationGroup).toBe(fr.translationGroup);

    const again = await api('POST', '/api/admin/entries/article', article({ locale: 'en', translationOf: fr.id, slug: 'other' }));
    expect(again.statusCode).toBe(409);

    const detail = await api('GET', `/api/admin/entries/article/${fr.id}`);
    expect(detail.json().translations).toEqual([{ id: en.json().entry.id, locale: 'en', slug: 'divorce-by-mutual-consent' }]);
  });

  it('computes scheduled and published statuses from publishAt', async () => {
    const future = new Date(Date.now() + hour).toISOString();
    const past = new Date(Date.now() - hour).toISOString();
    const scheduled = await api('POST', '/api/admin/entries/article', article({ publishAt: future, slug: 'a' }));
    const published = await api('POST', '/api/admin/entries/article', article({ publishAt: past, slug: 'b' }));
    expect(scheduled.json().entry.status).toBe('scheduled');
    expect(published.json().entry.status).toBe('published');

    const list = await api('GET', '/api/admin/entries/article?status=scheduled');
    expect(list.json().entries.map((e: { slug: string }) => e.slug)).toEqual(['a']);
  });

  it('only exposes published entries publicly, newest first', async () => {
    const at = (offset: number) => new Date(Date.now() + offset).toISOString();
    await api('POST', '/api/admin/entries/article', article({ slug: 'draft' }));
    await api('POST', '/api/admin/entries/article', article({ slug: 'future', publishAt: at(hour) }));
    await api('POST', '/api/admin/entries/article', article({ slug: 'old', publishAt: at(-2 * hour) }));
    await api('POST', '/api/admin/entries/article', article({ slug: 'recent', publishAt: at(-hour) }));
    await api('POST', '/api/admin/entries/article', article({ slug: 'english', locale: 'en', publishAt: at(-hour) }));

    const res = await ctx.app.inject({ method: 'GET', url: '/api/public/entries/article?locale=fr' });
    expect(res.statusCode).toBe(200);
    expect(res.json().entries.map((e: { slug: string }) => e.slug)).toEqual(['recent', 'old']);
    expect(res.json().entries[0].status).toBeUndefined();
  });

  it('updates and deletes an entry', async () => {
    const created = (await api('POST', '/api/admin/entries/article', article())).json().entry;
    const updated = await api('PUT', `/api/admin/entries/article/${created.id}`, {
      slug: 'nouveau-slug',
      publishAt: null,
      data: { title: 'Nouveau titre', body: '<p>Nouveau</p>' },
    });
    expect(updated.statusCode).toBe(200);
    expect(updated.json().entry).toMatchObject({ slug: 'nouveau-slug', data: { title: 'Nouveau titre' } });

    const deleted = await api('DELETE', `/api/admin/entries/article/${created.id}`);
    expect(deleted.statusCode).toBe(204);
    const missing = await api('GET', `/api/admin/entries/article/${created.id}`);
    expect(missing.statusCode).toBe(404);
    expect(ctx.events.map((e) => e.action)).toEqual(['created', 'updated', 'deleted']);
  });

  it('flags the changes that alter the public site', async () => {
    const past = new Date(Date.now() - hour).toISOString();
    const future = new Date(Date.now() + hour).toISOString();
    const draft = (await api('POST', '/api/admin/entries/article', article({ slug: 'a' }))).json().entry;
    await api('PUT', `/api/admin/entries/article/${draft.id}`, { publishAt: future, data: draft.data });
    await api('PUT', `/api/admin/entries/article/${draft.id}`, { publishAt: past, data: draft.data });
    await api('PUT', `/api/admin/entries/article/${draft.id}`, { publishAt: null, data: draft.data });
    await api('DELETE', `/api/admin/entries/article/${draft.id}`);
    expect(ctx.events.map((e) => e.affectsPublicSite)).toEqual([false, false, true, true, false]);
  });

  it('returns 404 for an unknown content type', async () => {
    const res = await api('GET', '/api/admin/entries/unknown');
    expect(res.statusCode).toBe(404);
  });
});
