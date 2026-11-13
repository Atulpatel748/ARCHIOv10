// Sends the contact form's email over SMTP (the normal way a mailbox such as Gmail or Microsoft 365 sends mail).
// The route calls `mailer.send`; the tests replace it with a fake, so they never send real mail.
import nodemailer from 'nodemailer';

export type MailSettings = { host: string; port: number; user: string; pass: string; to: string; from: string };
export type Mail = { to?: string; replyTo?: string; subject: string; text: string; html: string; headers?: Record<string, string> };

// All five must be set; the port defaults to 587 (the usual "STARTTLS" port). Without them the form says "not configured".
export function mailSettings(env: Record<string, string | undefined> = process.env): MailSettings | null {
  const host = env.SMTP_HOST?.trim(); // a blank host counts as not set
  const { SMTP_USER: user, SMTP_PASS: pass, CONTACT_TO_EMAIL: to, CONTACT_FROM_EMAIL: from } = env;
  const port = Number(env.SMTP_PORT || 587);
  if (!host || !user || !pass || !to || !from || !Number.isInteger(port) || port < 1 || port > 65535) return null;
  return { host, port, user, pass, to, from };
}

async function send(settings: MailSettings, mail: Mail): Promise<void> {
  const { host, port, user, pass, to, from } = settings;
  const onThisComputer = ['localhost', '127.0.0.1', '::1'].includes(host); // a local mail catcher has no TLS
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // port 465 is encrypted from the first byte
    requireTLS: port !== 465 && !onThisComputer, // every other port must upgrade to TLS before the password is sent
    auth: { user, pass },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 10_000,
  });
  try {
    await transporter.sendMail({ ...mail, from, to: mail.to ?? to }); // the studio inbox unless a mail names another; always the configured sender
  } finally {
    transporter.close();
  }
}

export const mailer = { send };
