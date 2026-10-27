// Contact enquiries. Validates on the server, drops bot submissions (honeypot), rate-limits by IP, and emails the
// studio through Resend when RESEND_API_KEY and CONTACT_TO_EMAIL are set. Without them it answers 503 so the form
// shows the WhatsApp/email fallback instead of pretending the enquiry was sent.
import { NextResponse } from 'next/server';

const TYPES = new Set(['Residential', 'Commercial', 'Mixed-use', 'Landscape']);
const recent = new Map<string, number[]>(); // shortcut: per-instance memory; use a shared store (e.g. Upstash) if deployed on many instances
const LIMIT = 5, WINDOW_MS = 10 * 60 * 1000;

const clean = (v: unknown, max: number) => String(v ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max);
const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'invalid_json' }, { status: 400 }); }
  if (!body || typeof body !== 'object' || Array.isArray(body)) return NextResponse.json({ error: 'invalid_json' }, { status: 400 });

  if (clean(body.company, 200)) return NextResponse.json({ ok: true }); // honeypot filled: pretend success, send nothing

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const now = Date.now();
  for (const [k, ts] of recent) if (ts.every((t) => now - t >= WINDOW_MS)) recent.delete(k); // keep the map from growing without bound
  const hits = (recent.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (hits.length >= LIMIT) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  recent.set(ip, [...hits, now]);

  const name = clean(body.name, 100);
  const contact = clean(body.contact, 120);
  const type = clean(body.type, 20);
  const location = clean(body.location, 120);
  const message = String(body.message ?? '').trim().slice(0, 2000);
  const errors: string[] = [];
  if (name.length < 2) errors.push('name');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact) && !/^\+?[\d\s()-]{7,20}$/.test(contact)) errors.push('contact');
  if (!TYPES.has(type)) errors.push('type');
  if (body.consent !== 'yes') errors.push('consent');
  if (errors.length) return NextResponse.json({ error: 'invalid', fields: errors }, { status: 422 });

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  if (!apiKey || !to) return NextResponse.json({ error: 'not_configured' }, { status: 503 });

  const html = `<h2>New website enquiry</h2>
    <p><strong>Name:</strong> ${escapeHtml(name)}<br><strong>Reply to:</strong> ${escapeHtml(contact)}<br>
    <strong>Project type:</strong> ${escapeHtml(type)}<br><strong>Location:</strong> ${escapeHtml(location || 'Not given')}</p>
    <p>${escapeHtml(message || 'No message').replace(/\n/g, '<br>')}</p>`;
  const res = await fetch('https://api.resend.com/emails', {
    signal: AbortSignal.timeout(10_000),
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM_EMAIL ?? 'Archió website <onboarding@resend.dev>',
      to: [to],
      subject: `Website enquiry: ${type} project from ${name}`,
      html,
      ...(contact.includes('@') ? { reply_to: contact } : {}),
    }),
  }).catch(() => null);
  if (!res?.ok) return NextResponse.json({ error: 'send_failed' }, { status: 502 });
  return NextResponse.json({ ok: true });
}
