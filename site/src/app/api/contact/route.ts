// Contact enquiries are validated server-side and delivered through Resend only when all production credentials are set.
// The in-memory rate limit is a per-instance best-effort guard; use a shared store for multi-instance deployments.
import { isValidContact, TYPES } from '../../../content/contact.ts';

export const runtime = 'nodejs';

const recent = new Map<string, number[]>();
const LIMIT = 5;
const WINDOW_MS = 10 * 60 * 1000;
const MAX_BODY_BYTES = 16 * 1024;

const clean = (v: unknown, max: number) => (typeof v === 'string' ? v : '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max);
const fail = (code: string, status: number, extra: object = {}) => Response.json({ error: code, ...extra }, { status });
const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

// A request problem that knows its own answer: the JSON error code and the HTTP status.
class HttpError extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string) {
    super(code);
    this.status = status;
    this.code = code;
  }
}

async function readJson(request: Request): Promise<unknown> {
  const contentType = request.headers.get('content-type')?.split(';', 1)[0].trim().toLowerCase();
  if (contentType !== 'application/json') throw new HttpError(415, 'unsupported_media_type');

  // The declared length rejects honest oversized bodies early; counting the bytes as they arrive catches the rest.
  const declaredLength = Number(request.headers.get('content-length') || 0);
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) throw new HttpError(413, 'body_too_large');
  if (!request.body) throw new HttpError(400, 'invalid_json');

  const reader = request.body.getReader();
  const chunks: Uint8Array<ArrayBuffer>[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_BODY_BYTES) {
        await reader.cancel();
        throw new HttpError(413, 'body_too_large');
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  return JSON.parse(await new Blob(chunks).text()) as unknown;
}

export async function POST(request: Request) {
  let parsed: unknown;
  try {
    parsed = await readJson(request);
  } catch (error) {
    if (error instanceof HttpError) return fail(error.code, error.status);
    return fail('invalid_json', 400); // JSON.parse failed
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return fail('invalid_json', 400);
  }
  const body = parsed as Record<string, unknown>;

  // Honeypot: silently discard likely bot submissions.
  if (clean(body.company, 200)) return Response.json({ ok: true });

  // Hosting proxies should overwrite these headers; configure a shared rate-limit store for production.
  const ip = request.headers.get('x-real-ip')?.trim() || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const now = Date.now();
  for (const [key, timestamps] of recent) {
    if (timestamps.every((timestamp) => now - timestamp >= WINDOW_MS)) recent.delete(key);
  }
  const safeIp = ip.slice(0, 100) || 'unknown';
  if (!recent.has(safeIp) && recent.size >= 5000) {
    const oldest = recent.keys().next().value;
    if (oldest) recent.delete(oldest);
  }
  const hits = (recent.get(safeIp) ?? []).filter((timestamp) => now - timestamp < WINDOW_MS);
  if (hits.length >= LIMIT) return fail('rate_limited', 429);
  recent.set(safeIp, [...hits, now]);

  const name = clean(body.name, 100);
  const contact = clean(body.contact, 120);
  const type = clean(body.type, 20);
  const location = clean(body.location, 120);
  const message = (typeof body.message === 'string' ? body.message : '')
    .replace(/\r\n?/g, '\n')
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, ' ')
    .trim()
    .slice(0, 2000);
  const errors: string[] = [];
  if (name.length < 2) errors.push('name');
  if (!isValidContact(contact)) errors.push('contact');
  if (!TYPES.includes(type)) errors.push('type');
  if (body.consent !== 'yes') errors.push('consent');
  if (errors.length) return fail('invalid', 422, { fields: errors });

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL;
  if (!apiKey || !to || !from) {
    return fail('not_configured', 503);
  }

  const html = `<h2>New website enquiry</h2>
    <p><strong>Name:</strong> ${escapeHtml(name)}<br><strong>Reply to:</strong> ${escapeHtml(contact)}<br>
    <strong>Project type:</strong> ${escapeHtml(type)}<br><strong>Location:</strong> ${escapeHtml(location || 'Not given')}</p>
    <p>${escapeHtml(message || 'No message').replace(/\n/g, '<br>')}</p>`;
  let res: Response | null = null;
  try {
    res = await fetch('https://api.resend.com/emails', {
      signal: AbortSignal.timeout(10_000),
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: [to],
        subject: `Website enquiry: ${type} project from ${name}`,
        html,
        ...(contact.includes('@') ? { reply_to: contact } : {}),
      }),
    });
  } catch {
    res = null;
  }
  if (!res?.ok) return fail('send_failed', 502);
  return Response.json({ ok: true });
}
