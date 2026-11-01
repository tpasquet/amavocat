import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import type { Mailer } from './mailer.js';

// Below this delay between displaying the form and submitting it, the sender is assumed to be a bot
export const MIN_FILL_TIME_MS = 2_000;

// Single-line values end up in email headers (subject, Reply-To): no line breaks or control characters
const singleLine = (max: number) =>
  z
    .string()
    .trim()
    .min(1)
    .max(max)
    .regex(/^[^\p{Cc}]*$/u);

const contactBody = z.object({
  firstName: singleLine(80),
  lastName: singleLine(80),
  email: z.string().trim().max(254).pipe(z.email()),
  phone: z
    .string()
    .trim()
    .max(30)
    .regex(/^[0-9+().\s-]*$/)
    .optional()
    .default(''),
  message: z.string().trim().min(1).max(5000),
  // GDPR: the visitor must accept that their data is used to answer them
  consent: z.literal(true),
  locale: z.enum(['fr', 'en']).optional().default('fr'),
  // Anti-spam: hidden field that humans leave empty, and time spent on the form
  website: z.string().max(500).optional().default(''),
  elapsedMs: z.number().int().nonnegative().optional(),
});

export type ContactMessage = z.infer<typeof contactBody>;

export interface ContactSettings {
  to: string;
  from: string;
}

export async function contactRoutes(
  app: FastifyInstance,
  opts: { mailer: Mailer | undefined; settings: ContactSettings | undefined },
) {
  app.post(
    '/api/contact',
    {
      config: {
        rateLimit: { max: 5, timeWindow: '1 hour' },
      },
      bodyLimit: 32 * 1024,
    },
    async (request, reply) => {
      const parsed = contactBody.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({
          error: 'invalid_body',
          fields: [...new Set(parsed.error.issues.map((issue) => String(issue.path[0] ?? '')))].filter(Boolean),
        });
      }
      const body = parsed.data;

      // Bots get the same answer as humans, so they cannot tell they were filtered out
      if (body.website !== '' || (body.elapsedMs !== undefined && body.elapsedMs < MIN_FILL_TIME_MS)) {
        request.log.info({ reason: body.website !== '' ? 'honeypot' : 'too_fast' }, 'contact message discarded as spam');
        return reply.code(202).send({ status: 'sent' });
      }

      if (!opts.mailer || !opts.settings) {
        request.log.error('contact form submitted but SMTP / CONTACT_* settings are missing');
        return reply.code(503).send({ error: 'contact_unavailable' });
      }

      const receivedAt = new Date();
      try {
        await opts.mailer.send({
          to: opts.settings.to,
          from: opts.settings.from,
          replyTo: { name: `${body.firstName} ${body.lastName}`, address: body.email },
          subject: `Nouveau message depuis le site : ${body.firstName} ${body.lastName}`,
          text: formatMessage(body, receivedAt),
          html: formatHtmlMessage(body, receivedAt),
        });
      } catch (error) {
        // The message content is personal data: log the failure, never the content
        request.log.error({ err: error }, 'contact message could not be sent');
        return reply.code(502).send({ error: 'send_failed' });
      }

      request.log.info('contact message sent');
      return reply.code(202).send({ status: 'sent' });
    },
  );
}

function formatDate(receivedAt: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'Europe/Paris',
  }).format(receivedAt);
}

/**
 * Link that opens a reply addressed to the visitor. The Reply-To header is not enough on its own: when the message
 * is sent from the recipient's own address (CONTACT_FROM = CONTACT_TO), mail clients such as Proton treat it as a
 * message the user sent and reply to its recipients instead.
 */
export function replyLink(body: ContactMessage): string {
  const address = encodeURIComponent(body.email).replace(/%40/g, '@');
  const subject = encodeURIComponent(
    body.locale === 'en' ? 'Your message to Aurélie Manier, lawyer' : 'Votre message à Maître Aurélie Manier',
  );
  return `mailto:${address}?subject=${subject}`;
}

export function formatMessage(body: ContactMessage, receivedAt: Date): string {
  return [
    `Message reçu via le formulaire de contact du site, le ${formatDate(receivedAt)}.`,
    '',
    `Nom : ${body.firstName} ${body.lastName}`,
    `Email : ${body.email}`,
    `Téléphone : ${body.phone || 'non renseigné'}`,
    `Langue du site : ${body.locale === 'en' ? 'anglais' : 'français'}`,
    '',
    'Message :',
    body.message,
    '',
    '--',
    `Pour répondre à ${body.firstName} ${body.lastName} : ${replyLink(body)}`,
    "Le visiteur a accepté que ses données soient utilisées pour lui répondre.",
  ].join('\n');
}

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!);

export function formatHtmlMessage(body: ContactMessage, receivedAt: Date): string {
  const name = escapeHtml(`${body.firstName} ${body.lastName}`);
  const link = escapeHtml(replyLink(body));
  const row = (label: string, value: string) =>
    `<tr><th align="left" style="padding:4px 16px 4px 0;color:#555;font-weight:normal">${label}</th><td style="padding:4px 0">${value}</td></tr>`;

  return `<!DOCTYPE html>
<html lang="fr"><body style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#212529;line-height:1.5">
<p>Message reçu via le formulaire de contact du site, le ${escapeHtml(formatDate(receivedAt))}.</p>
<table role="presentation" style="border-collapse:collapse">
${row('Nom', name)}
${row('Email', `<a href="${link}">${escapeHtml(body.email)}</a>`)}
${row('Téléphone', body.phone ? escapeHtml(body.phone) : 'non renseigné')}
${row('Langue du site', body.locale === 'en' ? 'anglais' : 'français')}
</table>
<p style="margin-top:16px"><strong>Message :</strong></p>
<div style="white-space:pre-wrap;padding:12px 16px;background:#f3f5f8;border-radius:6px">${escapeHtml(body.message)}</div>
<p style="margin-top:20px"><a href="${link}" style="display:inline-block;padding:10px 18px;background:#274c77;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:bold">Répondre à ${name}</a></p>
<p style="color:#555;font-size:13px">Le visiteur a accepté que ses données soient utilisées pour lui répondre.</p>
</body></html>`;
}
