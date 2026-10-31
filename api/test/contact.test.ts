import { afterEach, describe, expect, it } from 'vitest';
import { loadConfig } from '../src/config.js';
import { formatMessage } from '../src/contact/routes.js';
import { SITE_ORIGIN, setupApp } from './helpers.js';

const valid = {
  firstName: 'Jeanne',
  lastName: 'Martin',
  email: 'jeanne.martin@example.com',
  phone: '06 12 34 56 78',
  message: 'Bonjour, je souhaite prendre rendez-vous au sujet de mon licenciement.',
  consent: true,
  locale: 'fr',
  website: '',
  elapsedMs: 45_000,
};

describe('contact form', () => {
  let ctx: Awaited<ReturnType<typeof setupApp>> | undefined;

  afterEach(async () => {
    await ctx?.teardown();
    ctx = undefined;
  });

  const send = (payload: object, headers: Record<string, string> = { origin: SITE_ORIGIN }) =>
    ctx!.app.inject({ method: 'POST', url: '/api/contact', payload, headers });

  it('emails a valid message to the configured recipient, with the visitor as Reply-To', async () => {
    ctx = await setupApp();
    const res = await send(valid);
    expect(res.statusCode).toBe(202);
    expect(res.json()).toEqual({ status: 'sent' });
    expect(res.headers['access-control-allow-origin']).toBe(SITE_ORIGIN);
    expect(ctx.mails).toHaveLength(1);
    const [mail] = ctx.mails;
    expect(mail).toMatchObject({
      to: 'contact@example.com',
      from: 'Site <site@example.com>',
      replyTo: { name: 'Jeanne Martin', address: 'jeanne.martin@example.com' },
      subject: 'Nouveau message depuis le site : Jeanne Martin',
    });
    expect(mail!.text).toContain('Téléphone : 06 12 34 56 78');
    expect(mail!.text).toContain(valid.message);
  });

  it('accepts a message without phone', async () => {
    ctx = await setupApp();
    const { phone: _phone, ...withoutPhone } = valid;
    const res = await send(withoutPhone);
    expect(res.statusCode).toBe(202);
    expect(ctx.mails[0]!.text).toContain('Téléphone : non renseigné');
  });

  it('rejects invalid fields and lists them', async () => {
    ctx = await setupApp();
    const res = await send({ ...valid, email: 'not-an-email', message: '   ', consent: false });
    expect(res.statusCode).toBe(400);
    expect(res.json().fields).toEqual(expect.arrayContaining(['email', 'message', 'consent']));
    expect(ctx.mails).toHaveLength(0);
  });

  it('refuses line breaks in values that end up in email headers', async () => {
    ctx = await setupApp();
    const res = await send({ ...valid, lastName: 'Martin\r\nBcc: victim@example.com' });
    expect(res.statusCode).toBe(400);
    expect(ctx.mails).toHaveLength(0);
  });

  it('silently drops messages that fill the honeypot or are submitted too fast', async () => {
    ctx = await setupApp();
    const honeypot = await send({ ...valid, website: 'https://spam.example' });
    const tooFast = await send({ ...valid, elapsedMs: 300 });
    expect(honeypot.statusCode).toBe(202);
    expect(tooFast.statusCode).toBe(202);
    expect(ctx.mails).toHaveLength(0);
  });

  it('refuses requests from an unknown origin', async () => {
    ctx = await setupApp();
    const res = await send(valid, { origin: 'https://evil.example' });
    expect(res.statusCode).toBe(403);
    expect(ctx.mails).toHaveLength(0);
  });

  it('limits submissions to 5 per hour per IP', async () => {
    ctx = await setupApp();
    for (let i = 0; i < 5; i++) {
      expect((await send(valid)).statusCode).toBe(202);
    }
    expect((await send(valid)).statusCode).toBe(429);
  });

  it('answers 502 when the email cannot be sent', async () => {
    ctx = await setupApp({ failMail: true });
    expect((await send(valid)).statusCode).toBe(502);
  });

  it('answers 503 when SMTP is not configured', async () => {
    ctx = await setupApp({ env: { SMTP_HOST: '' } });
    // The test helper always injects a fake mailer: the settings alone decide
    expect((await send(valid)).statusCode).toBe(503);
  });
});

describe('contact config', () => {
  it('stays disabled until host, recipient and sender are set', () => {
    expect(loadConfig({ SMTP_HOST: 'smtp.example' }).contact).toBeUndefined();
    const config = loadConfig({
      SMTP_HOST: 'smtp-site.alwaysdata.net',
      SMTP_USER: 'site@example.com',
      SMTP_PASSWORD: 'secret',
      CONTACT_TO: 'contact@example.com',
      CONTACT_FROM: 'site@example.com',
    });
    expect(config.contact).toMatchObject({ smtp: { host: 'smtp-site.alwaysdata.net', port: 587, secure: false } });
  });
});

describe('formatMessage', () => {
  it('formats the date in the Paris time zone', () => {
    const text = formatMessage(
      { ...valid, locale: 'en', phone: '', website: '', consent: true },
      new Date('2026-10-31T09:30:00Z'),
    );
    expect(text).toContain('10:30');
    expect(text).toContain('Langue du site : anglais');
  });
});
