import nodemailer from 'nodemailer';

export interface MailAddress {
  name: string;
  address: string;
}

export interface MailMessage {
  to: string;
  from: string;
  replyTo: MailAddress;
  subject: string;
  text: string;
}

/** Sends an email; implemented over SMTP in production and faked in tests */
export interface Mailer {
  send(message: MailMessage): Promise<void>;
}

export interface SmtpSettings {
  host: string;
  port: number;
  secure: boolean;
  user: string | undefined;
  password: string | undefined;
}

export function smtpMailer(settings: SmtpSettings): Mailer {
  const transport = nodemailer.createTransport({
    host: settings.host,
    port: settings.port,
    // true for implicit TLS (port 465); otherwise STARTTLS is required, never plain text
    secure: settings.secure,
    requireTLS: !settings.secure,
    auth: settings.user ? { user: settings.user, pass: settings.password ?? '' } : undefined,
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });

  return {
    async send(message) {
      await transport.sendMail({
        to: message.to,
        from: message.from,
        replyTo: message.replyTo,
        subject: message.subject,
        text: message.text,
      });
    },
  };
}
