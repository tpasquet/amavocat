import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { loginAs, setupApp } from './helpers.js';

const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);

function multipart(filename: string, content: Buffer) {
  const boundary = '----amavocat-test';
  const body = Buffer.concat([
    Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${filename}"\r\nContent-Type: image/png\r\n\r\n`),
    content,
    Buffer.from(`\r\n--${boundary}--\r\n`),
  ]);
  return { body, contentType: `multipart/form-data; boundary=${boundary}` };
}

describe('media', () => {
  let ctx: Awaited<ReturnType<typeof setupApp>>;
  let cookie: string;

  beforeEach(async () => {
    ctx = await setupApp();
    cookie = await loginAs(ctx);
  });

  afterEach(async () => {
    await ctx.teardown();
  });

  const upload = (filename: string, content: Buffer, withCookie = true) => {
    const { body, contentType } = multipart(filename, content);
    return ctx.app.inject({
      method: 'POST',
      url: '/api/admin/media',
      payload: body,
      headers: { 'content-type': contentType, ...(withCookie ? { cookie } : {}) },
    });
  };

  it('stores an image and serves it under /media/', async () => {
    const res = await upload('photo.png', png);
    expect(res.statusCode).toBe(201);
    const url: string = res.json().url;
    expect(url).toMatch(/^https:\/\/api\.test\/media\/[0-9a-f-]+\.png$/);

    const served = await ctx.app.inject({ method: 'GET', url: new URL(url).pathname });
    expect(served.statusCode).toBe(200);
    expect(served.rawPayload.equals(png)).toBe(true);
  });

  it('rejects files that are not images, whatever their name', async () => {
    const res = await upload('evil.png', Buffer.from('<script>alert(1)</script>'));
    expect(res.statusCode).toBe(415);
  });

  it('requires a session', async () => {
    const res = await upload('photo.png', png, false);
    expect(res.statusCode).toBe(401);
  });
});
