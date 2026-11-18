import { createHash } from 'node:crypto';
import { AUTOREPLY, isValidContact, TYPES } from '../../../content/contact.ts';
import { mailSettings, mailer } from '../../../lib/mailer.ts';
import { verifyTurnstile } from '../../../lib/turnstile.ts';

export const runtime = 'nodejs';
export const maxDuration = 60;

const noStore = { 'Cache-Control': 'no-store' };
const MAX_BODY_BYTES = 16 * 1024;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT = 5;
const MAX_REQUEST_IPS = 5_000;
const DUPLICATE_WINDOW_MS = 10 * 60 * 1000;
const MAX_ENQUIRIES = 5_000;
const CONFIRM_WINDOW_MS = 24 * 60 * 60 * 1000;

const requests = new Map<string, number[]>();
const confirmed = new Map<string, number>();
type DeliveryStatus = 'pending' | 'succeeded' | 'failed' | 'skipped';
type EnquiryDelivery = {
  expiresAt: number;
  smtp: DeliveryStatus;
  n8n: DeliveryStatus;
  inFlight: Promise<void> | null;
  generation: number;
};

// This protection is process-local: it resets on restart and is not shared across server instances.
const enquiries = new Map<string, EnquiryDelivery>();

function fail(error: string, status: number, extra: Record<string, unknown> = {}) {
  return Response.json({ error, ...extra }, { status, headers: noStore });
}

function clean(value: unknown, max: number, preserveNewlines = false): string {
  if (typeof value !== 'string') return '';
  const normalized = value.replace(/\r\n?/g, '\n').replace(/\0/g, '');
  const flattened = preserveNewlines ? normalized : normalized.replace(/\s+/g, ' ');
  return flattened.trim().slice(0, max);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function enquiryFingerprint(contact: string, isEmail: boolean, type: string, message: string): string {
  const normalizedContact = isEmail ? contact.toLowerCase() : contact.replace(/\D/g, '');
  const normalizedType = type.toLowerCase().replace(/\s+/g, ' ').trim();
  const normalizedMessage = message.replace(/\s+/g, ' ').trim();
  return createHash('sha256')
    .update(JSON.stringify([normalizedContact, normalizedType, normalizedMessage]))
    .digest('hex');
}

function clientIp(request: Request): string {
  const realIp = request.headers.get('x-real-ip')?.trim();
  if (realIp) return realIp;
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return forwarded || 'unknown';
}

function sameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return true;
  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

function cleanupRequests(now: number): void {
  for (const [ip, timestamps] of requests) {
    const active = timestamps.filter((timestamp) => now - timestamp < RATE_WINDOW_MS);
    if (active.length === 0) requests.delete(ip);
    else if (active.length !== timestamps.length) requests.set(ip, active);
  }
}

export async function GET() {
  return Response.json({ ok: true }, { headers: noStore });
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return fail('forbidden', 403);

  const contentType = request.headers.get('content-type')?.split(';', 1)[0].trim().toLowerCase();
  if (contentType !== 'application/json') return fail('unsupported_media_type', 415);

  const declaredLength = Number(request.headers.get('content-length'));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
    return fail('too_large', 413);
  }

  let raw: string;
  try {
    raw = await request.text();
  } catch {
    return fail('invalid', 400);
  }
  if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) return fail('too_large', 413);

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return fail('invalid', 400);
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return fail('invalid', 400);
  }
  const body = parsed as Record<string, unknown>;

  const now = Date.now();
  const safeIp = clientIp(request);
  cleanupRequests(now);
  let priorRequests = requests.get(safeIp);
  if (!priorRequests && requests.size >= MAX_REQUEST_IPS) {
    return fail('capacity_exceeded', 503);
  }
  if (!priorRequests) priorRequests = [];
  if (priorRequests.length >= RATE_LIMIT) return fail('rate_limited', 429);
  priorRequests.push(now);
  requests.set(safeIp, priorRequests);

  if (typeof body.company === 'string' && body.company.trim()) {
    return Response.json({ ok: true }, { headers: noStore });
  }

  const name = clean(body.name, 100);
  const contact = clean(body.contact, 120);
  const type = clean(body.type, 50);
  const location = clean(body.location, 120);
  const message = clean(body.message, 2000, true);
  const fields: string[] = [];
  if (name.length < 2) fields.push('name');
  if (!isValidContact(contact)) fields.push('contact');
  if (!(TYPES as readonly string[]).includes(type)) fields.push('type');
  if (body.consent !== 'yes') fields.push('consent');
  if (fields.length) return fail('invalid', 422, { fields });

  const settings = mailSettings();
  const webhookUrl = process.env.N8N_CONTACT_WEBHOOK_URL?.trim();
  const turnstileSecret = process.env.TURNSTILE_SECRET_KEY?.trim();

  if (process.env.NODE_ENV === 'production' && !turnstileSecret) {
    return fail('not_configured', 503);
  }

  if (turnstileSecret) {
    if (typeof body.turnstileToken !== 'string') return fail('captcha', 400);
    const token = body.turnstileToken.trim().slice(0, 2048);
    if (!token) return fail('captcha', 400);
    try {
      if (!(await verifyTurnstile(turnstileSecret, token, safeIp))) {
        return fail('captcha', 403);
      }
    } catch {
      return fail('captcha_unavailable', 503);
    }
  }
  if (!settings && !webhookUrl) return fail('not_configured', 503);

  const isEmail = contact.includes('@');
  const fingerprint = enquiryFingerprint(contact, isEmail, type, message);
  for (const [key, enquiry] of enquiries) {
    if (enquiry.expiresAt <= now && !enquiry.inFlight) enquiries.delete(key);
  }

  const text = [
    `Name: ${name}`,
    `Contact: ${contact}`,
    `Type of project: ${type}`,
    `Location: ${location || 'Not provided'}`,
    '',
    'About your space:',
    `${message || 'No message'}\n`,
  ].join('\n');
  const html = [
    `<p><strong>Name:</strong> ${escapeHtml(name)}</p>`,
    `<p><strong>Contact:</strong> ${escapeHtml(contact)}</p>`,
    `<p><strong>Type of project:</strong> ${escapeHtml(type)}</p>`,
    `<p><strong>Location:</strong> ${escapeHtml(location || 'Not provided')}</p>`,
    `<p><strong>About your space:</strong><br>${escapeHtml(message || 'No message').replace(/\n/g, '<br>')}</p>`,
  ].join('\n');
  const n8nPayload = {
    name,
    contact,
    email: isEmail ? contact : '',
    phone: isEmail ? '' : contact,
    type,
    location,
    message,
    follow_up_eligible: isEmail,
    submitted_at: new Date(now).toISOString(),
    source: 'website',
  };

  let enquiry = enquiries.get(fingerprint);
  const wasDuplicate = Boolean(enquiry);
  if (!enquiry) {
    if (enquiries.size >= MAX_ENQUIRIES) {
      return fail('capacity_exceeded', 503);
    }
    enquiry = {
      expiresAt: now + DUPLICATE_WINDOW_MS,
      smtp: settings ? 'failed' : 'skipped',
      n8n: webhookUrl ? 'failed' : 'skipped',
      inFlight: null,
      generation: 0,
    };
    enquiries.set(fingerprint, enquiry);
  }

  let waitedForGeneration: number | undefined;
  while (enquiry.inFlight) {
    const activeAttempt = enquiry.inFlight;
    if (waitedForGeneration === undefined) waitedForGeneration = enquiry.generation;
    await activeAttempt;
  }
  if (
    waitedForGeneration !== undefined &&
    enquiry.generation > waitedForGeneration
  ) {
    if (enquiry.smtp !== 'succeeded' && enquiry.n8n !== 'succeeded') {
      return fail('send_failed', 502);
    }
    return Response.json({ ok: true, duplicate: true }, { headers: noStore });
  }

  const attemptSmtp = Boolean(settings) && enquiry.smtp !== 'succeeded';
  const attemptN8n = Boolean(webhookUrl) && enquiry.n8n !== 'succeeded';
  if (!attemptSmtp && !attemptN8n) {
    if (enquiry.smtp === 'succeeded' || enquiry.n8n === 'succeeded') {
      return Response.json({ ok: true, duplicate: true }, { headers: noStore });
    }
    return fail('send_failed', 502);
  }

  const smtpWasAlreadySent = enquiry.smtp === 'succeeded';
  const delivery = enquiry;
  delivery.generation++;
  if (attemptSmtp) delivery.smtp = 'pending';
  if (attemptN8n) delivery.n8n = 'pending';

  delivery.inFlight = Promise.all([
    (async () => {
      if (!attemptSmtp || !settings) return;
      try {
        await mailer.send(settings, {
          subject: `Website enquiry: ${type} project from ${name}`,
          text,
          html,
          ...(isEmail ? { replyTo: contact } : {}),
        });
        delivery.smtp = 'succeeded';
      } catch (error) {
        delivery.smtp = 'failed';
        console.error(
          'contact form: sending failed:',
          (error as { code?: string }).code ?? (error as Error).name,
        );
      }
    })(),
    (async () => {
      if (!attemptN8n || !webhookUrl) return;
      try {
        const parsedWebhookUrl = new URL(webhookUrl);
        if (!['http:', 'https:'].includes(parsedWebhookUrl.protocol)) {
          delivery.n8n = 'failed';
          console.error('contact form: n8n webhook URL must use HTTP or HTTPS');
          return;
        }

        const response = await fetch(parsedWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(n8nPayload),
          cache: 'no-store',
          signal: AbortSignal.timeout(10000),
        });
        if (!response.ok) {
          delivery.n8n = 'failed';
          console.error('contact form: n8n webhook returned HTTP', response.status);
          return;
        }
        // Google Apps Script always answers HTTP 200, so a failed save shows only as { success: false }.
        const result = (await response.json().catch(() => null)) as { success?: unknown } | null;
        if (result?.success === false) {
          delivery.n8n = 'failed';
          console.error('contact form: n8n webhook reported success: false');
          return;
        }
        delivery.n8n = 'succeeded';
      } catch (error) {
        delivery.n8n = 'failed';
        console.error('contact form: n8n webhook failed:', (error as Error).name);
      }
    })(),
  ]).then(() => undefined);

  await delivery.inFlight;
  delivery.inFlight = null;
  if (delivery.expiresAt <= Date.now() && enquiries.get(fingerprint) === delivery) {
    enquiries.delete(fingerprint);
  }
  if (delivery.smtp !== 'succeeded' && delivery.n8n !== 'succeeded') {
    return fail('send_failed', 502);
  }
  const smtpSucceededNow = !smtpWasAlreadySent && delivery.smtp === 'succeeded';

  if (
    settings &&
    smtpSucceededNow &&
    process.env.CONTACT_AUTOREPLY === 'on' &&
    isEmail
  ) {
    const keys = [
      contact.toLowerCase().replace(/\+[^@]*@/, '@'),
      ...(safeIp === 'unknown' ? [] : [`ip:${safeIp}`]),
    ];
    for (const [key, timestamp] of confirmed) {
      if (now - timestamp >= CONFIRM_WINDOW_MS) confirmed.delete(key);
    }

    const shouldSendAutoReply = keys.every(
      (key) => now - (confirmed.get(key) ?? -Infinity) >= CONFIRM_WINDOW_MS,
    );
    if (shouldSendAutoReply) {
      keys.forEach((key) => confirmed.set(key, now));
      try {
        await mailer.send(settings, {
          to: contact,
          replyTo: settings.to,
          subject: AUTOREPLY.subject,
          text: AUTOREPLY.paragraphs.join('\n\n'),
          html: AUTOREPLY.paragraphs
            .map((paragraph: string) => `<p>${escapeHtml(paragraph)}</p>`)
            .join('\n'),
          headers: { 'Auto-Submitted': 'auto-generated' },
        });
      } catch (error) {
        console.error(
          'contact form: confirmation failed:',
          (error as { code?: string }).code ?? (error as Error).name,
        );
      }
    }
  }

  return Response.json(
    { ok: true, ...(wasDuplicate ? { duplicate: true } : {}) },
    { headers: noStore },
  );
}
