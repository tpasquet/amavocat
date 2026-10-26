import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createUser } from '../src/auth/users.js';
import { ADMIN_ORIGIN, sessionCookie, setupApp } from './helpers.js';

const credentials = { email: 'aurelie@example.com', password: 'correct horse battery' };

describe('auth', () => {
  let ctx: Awaited<ReturnType<typeof setupApp>>;

  beforeEach(async () => {
    ctx = await setupApp();
    await createUser(ctx.db, { ...credentials, displayName: 'Aurélie Manier', role: 'admin' });
  });

  afterEach(async () => {
    await ctx.teardown();
  });

  const login = (body: object, headers: Record<string, string> = {}) =>
    ctx.app.inject({ method: 'POST', url: '/api/auth/login', payload: body, headers });

  it('logs in with valid credentials and sets a strict httpOnly cookie', async () => {
    const res = await login({ ...credentials, email: '  Aurelie@Example.com ' });
    expect(res.statusCode).toBe(200);
    expect(res.json().user).toMatchObject({ email: credentials.email, role: 'admin' });
    const header = String(res.headers['set-cookie']);
    expect(header).toContain('HttpOnly');
    expect(header).toContain('SameSite=Strict');
    expect(res.json().user.passwordHash).toBeUndefined();
  });

  it('rejects a wrong password and an unknown email with the same error', async () => {
    const wrong = await login({ ...credentials, password: 'nope' });
    const unknown = await login({ email: 'someone@example.com', password: 'nope' });
    expect(wrong.statusCode).toBe(401);
    expect(unknown.statusCode).toBe(401);
    expect(wrong.json()).toEqual(unknown.json());
  });

  it('rejects a malformed body', async () => {
    const res = await login({ email: 'not-an-email' });
    expect(res.statusCode).toBe(400);
  });

  it('returns the current user for a valid session and 401 otherwise', async () => {
    const anonymous = await ctx.app.inject({ method: 'GET', url: '/api/auth/me' });
    expect(anonymous.statusCode).toBe(401);

    const cookie = sessionCookie((await login(credentials)).headers['set-cookie']);
    const me = await ctx.app.inject({ method: 'GET', url: '/api/auth/me', headers: { cookie } });
    expect(me.statusCode).toBe(200);
    expect(me.json().user.email).toBe(credentials.email);
  });

  it('invalidates the session on logout', async () => {
    const cookie = sessionCookie((await login(credentials)).headers['set-cookie']);
    const logout = await ctx.app.inject({ method: 'POST', url: '/api/auth/logout', headers: { cookie } });
    expect(logout.statusCode).toBe(204);

    const me = await ctx.app.inject({ method: 'GET', url: '/api/auth/me', headers: { cookie } });
    expect(me.statusCode).toBe(401);
  });

  it('limits login attempts to 5 per 15 minutes', async () => {
    for (let i = 0; i < 5; i++) {
      await login({ ...credentials, password: 'nope' });
    }
    const blocked = await login(credentials);
    expect(blocked.statusCode).toBe(429);
  });

  it('refuses state-changing requests from unknown origins', async () => {
    const foreign = await login(credentials, { origin: 'https://evil.example' });
    expect(foreign.statusCode).toBe(403);
    const allowed = await login(credentials, { origin: ADMIN_ORIGIN });
    expect(allowed.statusCode).toBe(200);
  });

  it('accepts requests from its own origin (admin app served by the API)', async () => {
    const res = await login(credentials, { origin: 'https://api.example', host: 'api.example' });
    expect(res.statusCode).toBe(200);
  });
});
