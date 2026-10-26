import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';
import { loadConfig } from '../src/config.js';
import { openDatabase } from '../src/db/client.js';

describe('admin app hosting', () => {
  const adminDir = mkdtempSync(join(tmpdir(), 'amavocat-admin-'));
  const mediaDir = mkdtempSync(join(tmpdir(), 'amavocat-media-'));
  writeFileSync(join(adminDir, 'index.html'), '<app-root></app-root>');
  writeFileSync(join(adminDir, 'main-ABC.js'), 'console.log(1)');
  const { db, close } = openDatabase(':memory:');
  let app: Awaited<ReturnType<typeof buildApp>>;

  beforeAll(async () => {
    const config = loadConfig({ NODE_ENV: 'test', ADMIN_DIR: adminDir, MEDIA_DIR: mediaDir });
    app = await buildApp({ config, db });
  });

  afterAll(async () => {
    await app.close();
    close();
    rmSync(adminDir, { recursive: true, force: true });
    rmSync(mediaDir, { recursive: true, force: true });
  });

  it('serves index.html with protective headers', async () => {
    const res = await app.inject({ method: 'GET', url: '/admin/' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toContain('<app-root>');
    expect(res.headers['x-frame-options']).toBe('DENY');
    expect(res.headers['x-robots-tag']).toBe('noindex, nofollow');
    expect(res.headers['cache-control']).toBe('no-cache');
  });

  it('serves hashed assets with long caching', async () => {
    const res = await app.inject({ method: 'GET', url: '/admin/main-ABC.js' });
    expect(res.statusCode).toBe(200);
    expect(res.headers['cache-control']).toContain('immutable');
  });

  it('falls back to the app shell for client-side routes', async () => {
    const res = await app.inject({ method: 'GET', url: '/admin/content/article/123' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toContain('<app-root>');
  });
});
