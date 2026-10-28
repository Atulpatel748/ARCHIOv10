// Contact enquiries are validated server-side and delivered through Resend only when all production credentials are set.
// The in-memory rate limit is a per-instance best-effort guard; use a shared store for multi-instance deployments.
import { isValidContact, TYPES } from '../../../content/contact.ts';

export const runtime = 'nodejs';

const recent = new Map<string, number[]>();
const LIMIT = 5;
const WINDOW_MS = 10 * 60 * 1000;
const MAX_BODY_BYTES = 16 * 1024;

const clean = (v: unknown, max: number) => (typeof v === 'string' ? v : '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max);
const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

class BodyTooLargeError extends Error {}

async function readJson(request: Request): Promise<unknown> {
  const contentType = request.headers.get('content-type')?.split(';', 1)[0].trim().toLowerCase();
  if (contentType !== 'application/json') throw new TypeError('unsupported_content_type');

  const declaredLength = Number(request.headers.get('content-length') || 0);
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) throw new BodyTooLargeError();
  if (!request.body) throw new SyntaxError('empty_body');

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_BODY_BYTES) {
        await reader.cancel();
        throw new BodyTooLargeError();
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return JSON.parse(new TextDecoder().decode(bytes)) as unknown;
}

export async function POST(request: Request) {
  let parsed: unknown;
  try {
    parsed = await readJson(request);
  } catch (error) {
    if (error instanceof BodyTooLargeError) return Response.json({ error: 'body_too_large' }, { status: 413 });
    if (error instanceof TypeError && error.message === 'unsupported_content_type') {
      return Response.json({ error: 'unsupported_media_type' }, { status: 415 });
    }
    return Response.json({ error: 'invalid_json' }, { status: 400 });
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return Response.json({ error: 'invalid_json' }, { status: 400 });
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
  if (hits.length >= LIMIT) return Response.json({ error: 'rate_limited' }, { status: 429 });
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
  if (errors.length) return Response.json({ error: 'invalid', fields: errors }, { status: 422 });

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL;
  if (!apiKey || !to || !from) {
    return Response.json({ error: 'not_configured' }, { status: 503 });
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
  if (!res?.ok) return Response.json({ error: 'send_failed' }, { status: 502 });
  return Response.json({ ok: true });
}
