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

      try {
        await opts.mailer.send({
          to: opts.settings.to,
          from: opts.settings.from,
          replyTo: { name: `${body.firstName} ${body.lastName}`, address: body.email },
          subject: `Nouveau message depuis le site : ${body.firstName} ${body.lastName}`,
          text: formatMessage(body, new Date()),
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

export function formatMessage(body: ContactMessage, receivedAt: Date): string {
  const date = new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'Europe/Paris',
  }).format(receivedAt);

  return [
    `Message reçu via le formulaire de contact du site, le ${date}.`,
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
    "Répondre à cet email écrit directement à l'expéditeur. Le visiteur a accepté que ses données soient utilisées pour lui répondre.",
  ].join('\n');
}
