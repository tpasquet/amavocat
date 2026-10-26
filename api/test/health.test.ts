import { expect, it } from 'vitest';
import { setupApp } from './helpers.js';

it('reports health', async () => {
  const ctx = await setupApp();
  const res = await ctx.app.inject({ method: 'GET', url: '/api/health' });
  expect(res.json()).toEqual({ status: 'ok' });
  await ctx.teardown();
});
