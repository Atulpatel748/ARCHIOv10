// Extra edge-case tests for the contact route and its helpers (from the Testing team's gap review). Run with `npm test`.
// Each test file runs in its own Node process, so the route's in-memory limiter starts empty here; every test still uses its own IP.
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { afterEach, mock, test } from 'node:test';
import { isValidContact, TYPES } from '../../../content/contact.ts';
import { projects, getProject } from '../../../content/projects.ts';
import { mailSettings, mailer, type Mail } from '../../../lib/mailer.ts';
import { pageOpenGraph, shareImage } from '../../../lib/pageMeta.ts';
import { verifyTurnstile } from '../../../lib/turnstile.ts';
import { POST } from './route.ts';

const valid = { name: 'Asha Rao', contact: 'asha@example.com', type: 'Residential', consent: 'yes' };
let n = 0;
const send = (body: unknown, headers: Record<string, string> = {}, raw?: string) =>
  POST(new Request('http://localhost/api/contact', { method: 'POST', headers: { 'content-type': 'application/json', 'x-real-ip': `10.9.${Math.floor(n / 250)}.${(n++ % 250) + 1}`, ...headers }, body: raw ?? JSON.stringify(body) }));

const realSend = mailer.send;
const realFetch = globalThis.fetch;
const realNow = Date.now;
const KEYS = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'CONTACT_TO_EMAIL', 'CONTACT_FROM_EMAIL', 'TURNSTILE_SECRET_KEY', 'CONTACT_AUTOREPLY', 'N8N_CONTACT_WEBHOOK_URL'];
afterEach(() => {
  mailer.send = realSend;
  globalThis.fetch = realFetch;
  Date.now = realNow;
  mock.restoreAll();
  for (const key of KEYS) delete process.env[key];
});
const configure = () => Object.assign(process.env, { SMTP_HOST: 'mail.example.com', SMTP_USER: 'u', SMTP_PASS: 'p', CONTACT_TO_EMAIL: 'to@example.com', CONTACT_FROM_EMAIL: 'from@example.com' });
const capture = () => {
  const sent: Mail[] = [];
  mailer.send = async (_settings, mail) => { sent.push(mail); };
  configure();
  return sent;
};
const siteverify = (answer: object = { success: true }) => {
  const forms: URLSearchParams[] = [];
  globalThis.fetch = async (_url, init) => { forms.push(new URLSearchParams(String(init?.body))); return Response.json(answer); };
  process.env.TURNSTILE_SECRET_KEY = 'secret';
  return forms;
};

// --- phone and email rules ---
test('a phone number needs at least seven digits, not just seven allowed characters', () => {
  for (const bad of ['- - - - - -', '((((((((', '+--------', '123456']) assert.equal(isValidContact(bad), false, bad);
  for (const good of ['+971 55 654 1410', '(04) 123-4567', '0551234']) assert.equal(isValidContact(good), true, good);
});

test('email edge cases', () => {
  for (const bad of [`${'a'.repeat(65)}@c.de`, 'a@b.c1', 'a@localhost', 'a@b.co\n', ' a@b.co']) assert.equal(isValidContact(bad), false, JSON.stringify(bad));
});

// --- what reaches the studio's inbox ---
test('line breaks in the name cannot add a mail header', async () => {
  const sent = capture();
  assert.equal((await send({ ...valid, name: 'Asha\r\nBcc: evil@x.test', message: 'header injection case' })).status, 200);
  assert.doesNotMatch(sent[0].subject, /[\r\n]/);
});

test('the plain-text mail keeps one line per field and clean line breaks in the message', async () => {
  const sent = capture();
  await send({ ...valid, location: 'a\nb', message: 'a\r\nb\rc' });
  assert.match(sent[0].text, /^Location: a b$/m);
  assert.ok(sent[0].text.includes('\na\nb\nc\n'));
});

test('an empty message is shown as "No message"', async () => {
  const sent = capture();
  await send({ ...valid, message: '  ' });
  assert.ok(sent[0].text.includes('No message') && sent[0].html.includes('No message'));
});

test('long fields are cut to their limits', async () => {
  const sent = capture();
  await send({ ...valid, name: 'a'.repeat(150), message: 'm'.repeat(3000) });
  assert.ok(sent[0].subject.endsWith(`from ${'a'.repeat(100)}`));
  assert.ok(sent[0].text.includes('m'.repeat(2000)) && !sent[0].text.includes('m'.repeat(2001)));
});

test('quotes, ampersands and tags in every field are escaped in the HTML mail', async () => {
  const sent = capture();
  await send({ ...valid, name: `a"b'c&d`, location: '<b>', message: 'x\n<y>' });
  const html = sent[0].html;
  for (const part of ['a&quot;b&#39;c&amp;d', '&lt;b&gt;', 'x<br>&lt;y&gt;']) assert.ok(html.includes(part), part);
  assert.doesNotMatch(html, /<b>|<y>/);
});

test('wrong field types and a wrong-case project type are refused', async () => {
  const res = await send({ name: 123, contact: 'asha@example.com', type: 'residential', consent: true });
  assert.equal(res.status, 422);
  assert.deepEqual((await res.json()).fields, ['name', 'type', 'consent']);
});

test('the declared length, content-type spelling and odd JSON bodies', async () => {
  assert.equal((await send(valid, { 'content-length': '99999' })).status, 413);
  for (const type of ['application/json; charset=utf-8', 'APPLICATION/JSON']) assert.notEqual((await send(valid, { 'content-type': type })).status, 415, type);
  for (const raw of ['', 'null', '"text"', '5', '{']) assert.equal((await send(null, {}, raw)).status, 400, JSON.stringify(raw));
});

test('every answer is marked no-store', async () => {
  for (const res of [await send(valid, { origin: 'https://evil.test' }), await send({}), await send(null, {}, 'null')]) assert.equal(res.headers.get('cache-control'), 'no-store');
});

// --- the rate limit ---
test('a request that fails validation still uses a slot', async () => {
  const ip = { 'x-real-ip': '10.77.0.1' };
  for (let i = 0; i < 5; i++) assert.equal((await send({}, ip)).status, 422);
  assert.equal((await send(valid, ip)).status, 429);
});

test('the window ends after ten minutes', async () => {
  const ip = { 'x-real-ip': '10.77.0.2' };
  let now = 1_000_000_000_000;
  Date.now = () => now;
  for (let i = 0; i < 5; i++) await send({}, ip);
  now += 10 * 60 * 1000 - 1;
  assert.equal((await send({}, ip)).status, 429);
  now += 1;
  assert.equal((await send({}, ip)).status, 422);
});

test('x-real-ip wins over x-forwarded-for, and the first forwarded address is used', async () => {
  for (let i = 0; i < 5; i++) await send({}, { 'x-real-ip': '10.77.0.3', 'x-forwarded-for': `9.9.9.${i}` });
  assert.equal((await send({}, { 'x-real-ip': '10.77.0.3', 'x-forwarded-for': '8.8.8.8' })).status, 429);
  const headers = { 'x-real-ip': '', 'x-forwarded-for': '1.1.1.1, 2.2.2.2' };
  for (let i = 0; i < 5; i++) await send({}, headers);
  assert.equal((await send({}, { 'x-real-ip': '', 'x-forwarded-for': '1.1.1.1, 3.3.3.3' })).status, 429);
});

// --- the captcha ---
test('a bad body is refused before Cloudflare is asked', async () => {
  const forms = siteverify();
  assert.equal((await send({})).status, 422);
  assert.equal(forms.length, 0);
});

test('the captcha token is checked, trimmed and capped', async () => {
  const forms = siteverify();
  assert.equal((await send({ ...valid, turnstileToken: 123 })).status, 400);
  assert.equal((await send({ ...valid, turnstileToken: '   ' })).status, 400);
  assert.equal(forms.length, 0);
  await send({ ...valid, turnstileToken: ' tok ' });
  await send({ ...valid, turnstileToken: 't'.repeat(5000) });
  assert.equal(forms[0].get('response'), 'tok');
  assert.equal(forms[1].get('response')?.length, 2048);
});

test('verifyTurnstile on its own', async () => {
  const answer = (body: BodyInit | null, status = 200) => { globalThis.fetch = async () => new Response(body, { status }); };
  answer('{}', 500);
  await assert.rejects(verifyTurnstile('s', 't', '1.2.3.4'));
  answer(JSON.stringify({ success: 'true' }));
  assert.equal(await verifyTurnstile('s', 't', '1.2.3.4'), false);
  answer('not json');
  await assert.rejects(verifyTurnstile('s', 't', '1.2.3.4'));
  const forms = siteverify();
  assert.equal(await verifyTurnstile('s', 't', 'unknown'), true);
  assert.equal(forms[0].has('remoteip'), false);
  await verifyTurnstile('s', 't', '1.2.3.4');
  assert.equal(forms[1].get('remoteip'), '1.2.3.4');
});

test('in production, a configured site with a passed captcha sends the mail', async () => {
  const env = process.env as Record<string, string | undefined>;
  const before = env.NODE_ENV;
  env.NODE_ENV = 'production';
  try {
    const sent = capture();
    siteverify();
    assert.equal((await send({ ...valid, message: 'production captcha case', turnstileToken: 'tok' })).status, 200);
    assert.equal(sent.length, 1);
  } finally {
    env.NODE_ENV = before;
  }
});

// --- failures and the confirmation email ---
test('a failed send logs only the error code, never the settings', async () => {
  configure();
  mailer.send = async () => { throw Object.assign(new Error('bad pass hunter2 at mail.example.com'), { code: 'EAUTH' }); };
  const log = mock.method(console, 'error', () => {});
  assert.equal((await send({ ...valid, message: 'failed SMTP case' })).status, 502);
  assert.deepEqual(log.mock.calls[0].arguments, ['contact form: sending failed:', 'EAUTH']);
});

test('n8n payload splits email and phone and retries only a failed destination', async () => {
  const sent = capture();
  process.env.N8N_CONTACT_WEBHOOK_URL = 'https://n8n.example/webhook/contact';
  const payloads: Record<string, unknown>[] = [];
  let webhookCalls = 0;
  globalThis.fetch = async (_url, init) => {
    webhookCalls++;
    payloads.push(JSON.parse(String(init?.body)) as Record<string, unknown>);
    return Response.json({}, { status: webhookCalls === 1 ? 500 : 200 });
  };

  assert.equal((await send({ ...valid, contact: 'Lead@Example.com', message: 'living\nspace' })).status, 200);
  assert.deepEqual(payloads[0], {
    name: 'Asha Rao',
    contact: 'Lead@Example.com',
    email: 'Lead@Example.com',
    phone: '',
    type: 'Residential',
    location: '',
    message: 'living\nspace',
    follow_up_eligible: true,
    submitted_at: payloads[0].submitted_at,
    source: 'website',
  });
  assert.equal(typeof payloads[0].submitted_at, 'string');

  const retry = await send({ ...valid, contact: 'lead@example.com', message: 'living   space' });
  assert.deepEqual(await retry.json(), { ok: true, duplicate: true });
  assert.equal(sent.length, 1);
  assert.equal(webhookCalls, 2);

  const duplicate = await send({ ...valid, contact: 'LEAD@example.com', message: 'living space' });
  assert.deepEqual(await duplicate.json(), { ok: true, duplicate: true });
  assert.equal(sent.length, 1);
  assert.equal(webhookCalls, 2);

  await send({ ...valid, contact: '+971 50 123 4567', message: 'phone lead case' });
  assert.equal(payloads[2].email, '');
  assert.equal(payloads[2].phone, '+971 50 123 4567');
  assert.equal(payloads[2].follow_up_eligible, false);
  assert.equal(sent.length, 2);
});

test('a webhook answering 200 with success: false counts as failed', async () => {
  capture();
  mailer.send = async () => { throw Object.assign(new Error('down'), { code: 'ECONNECTION' }); };
  process.env.N8N_CONTACT_WEBHOOK_URL = 'https://script.example/macros/s/x/exec';
  globalThis.fetch = async () => Response.json({ success: false, error: 'Inquiry could not be saved.' });
  const log = mock.method(console, 'error', () => {});
  assert.equal((await send({ ...valid, contact: 'apps-script@example.com', message: 'success false case' })).status, 502);
  assert.ok(log.mock.calls.some((call) => call.arguments[0] === 'contact form: n8n webhook reported success: false'));
});

test('simultaneous duplicate submissions share the same in-flight deliveries', async () => {
  capture();
  process.env.N8N_CONTACT_WEBHOOK_URL = 'https://n8n.example/webhook/contact';
  let release!: () => void;
  const held = new Promise<void>((resolve) => { release = resolve; });
  let smtpCalls = 0;
  let webhookCalls = 0;
  mailer.send = async () => { smtpCalls++; await held; };
  globalThis.fetch = async () => { webhookCalls++; await held; return Response.json({}); };

  const first = send({ ...valid, contact: 'parallel@example.com', message: 'parallel duplicate case' });
  const second = send({ ...valid, contact: 'PARALLEL@example.com', message: 'parallel   duplicate case' });
  try {
    await new Promise((resolve) => setTimeout(resolve, 0));
    assert.equal(smtpCalls, 1);
    assert.equal(webhookCalls, 1);
  } finally {
    release();
  }
  const responses = await Promise.all([first, second]);
  assert.deepEqual(responses.map((response) => response.status), [200, 200]);
  assert.equal(smtpCalls, 1);
  assert.equal(webhookCalls, 1);
});

test('waiting duplicates re-check failures and share a single retry attempt', async () => {
  capture();
  process.env.N8N_CONTACT_WEBHOOK_URL = 'https://n8n.example/webhook/contact';
  let releaseInitial!: () => void;
  let releaseRetry!: () => void;
  const initialAttempt = new Promise<void>((resolve) => { releaseInitial = resolve; });
  const retryAttempt = new Promise<void>((resolve) => { releaseRetry = resolve; });
  let smtpCalls = 0;
  let webhookCalls = 0;
  mailer.send = async () => {
    if (++smtpCalls === 1) {
      await initialAttempt;
      throw Object.assign(new Error('temporary SMTP failure'), { code: 'ECONNECTION' });
    }
    if (smtpCalls === 2) await retryAttempt;
  };
  globalThis.fetch = async () => {
    if (++webhookCalls === 1) {
      await initialAttempt;
      return Response.json({}, { status: 500 });
    }
    if (webhookCalls === 2) await retryAttempt;
    return Response.json({});
  };
  mock.method(console, 'error', () => {});

  const enquiry = { ...valid, contact: 'waiting@example.com', message: 'waiting retry case' };
  const first = send(enquiry);
  for (let i = 0; i < 50 && (smtpCalls < 1 || webhookCalls < 1); i++) {
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
  assert.equal(smtpCalls, 1);
  assert.equal(webhookCalls, 1);
  const duplicateA = send(enquiry);
  const duplicateB = send({ ...enquiry, contact: 'WAITING@example.com' });
  await new Promise((resolve) => setTimeout(resolve, 0));

  releaseInitial();
  for (let i = 0; i < 50 && (smtpCalls < 2 || webhookCalls < 2); i++) {
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
  assert.equal(smtpCalls, 2);
  assert.equal(webhookCalls, 2);
  releaseRetry();

  const responses = await Promise.all([first, duplicateA, duplicateB]);
  assert.deepEqual(responses.map((response) => response.status), [502, 200, 200]);
  assert.deepEqual(await responses[1].json(), { ok: true, duplicate: true });
  assert.deepEqual(await responses[2].json(), { ok: true, duplicate: true });
  assert.equal(smtpCalls, 2);
  assert.equal(webhookCalls, 2);
});

test('SMTP retries after an n8n success without sending the webhook twice', async () => {
  capture();
  process.env.N8N_CONTACT_WEBHOOK_URL = 'https://n8n.example/webhook/contact';
  let smtpCalls = 0;
  let webhookCalls = 0;
  mailer.send = async () => {
    if (++smtpCalls === 1) throw Object.assign(new Error('temporary SMTP failure'), { code: 'ECONNECTION' });
  };
  globalThis.fetch = async () => { webhookCalls++; return Response.json({}); };
  mock.method(console, 'error', () => {});

  const enquiry = { ...valid, contact: 'smtp-retry@example.com', message: 'SMTP retry case' };
  assert.equal((await send(enquiry)).status, 200);
  const retry = await send({ ...enquiry, contact: 'SMTP-RETRY@example.com' });
  assert.deepEqual(await retry.json(), { ok: true, duplicate: true });
  const duplicate = await send(enquiry);
  assert.deepEqual(await duplicate.json(), { ok: true, duplicate: true });
  assert.equal(smtpCalls, 2);
  assert.equal(webhookCalls, 1);
});

test('duplicate tracking expires after ten minutes', async () => {
  const sent = capture();
  let now = 1_000_000_000_000;
  Date.now = () => now;
  const enquiry = { ...valid, contact: 'expiry@example.com', message: 'expiry case' };
  assert.equal((await send(enquiry)).status, 200);
  assert.deepEqual(await (await send(enquiry)).json(), { ok: true, duplicate: true });
  now += 10 * 60 * 1000;
  assert.deepEqual(await (await send(enquiry)).json(), { ok: true });
  assert.equal(sent.length, 2);
});

test('the confirmation: tag dropped, one per address and per visitor, and a failed one is not retried', async () => {
  const sent = capture();
  process.env.CONTACT_AUTOREPLY = 'on';
  const confirmations = () => sent.filter((m) => m.to).length;
  await send({ ...valid, contact: 'dedupe@example.com' });
  await send({ ...valid, contact: 'dedupe+x@example.com' });
  assert.equal(confirmations(), 1);
  const ip = { 'x-real-ip': '10.77.0.9' };
  await send({ ...valid, contact: 'one@example.com' }, ip);
  await send({ ...valid, contact: 'two@example.com' }, ip);
  assert.equal(confirmations(), 2);
  mock.method(console, 'error', () => {});
  mailer.send = async (_s, mail) => { if (mail.to) throw new Error('down'); };
  await send({ ...valid, contact: 'fail@example.com' });
  mailer.send = async (_s, mail) => { sent.push(mail); };
  await send({ ...valid, contact: 'fail@example.com' });
  assert.equal(confirmations(), 2);
});

// --- helpers and content ---
test('mailSettings edge inputs', () => {
  const base = { SMTP_HOST: 'h', SMTP_USER: 'u', SMTP_PASS: 'p', CONTACT_TO_EMAIL: 't@x.co', CONTACT_FROM_EMAIL: 'f@x.co' };
  assert.equal(mailSettings({ ...base, SMTP_PORT: '' })?.port, 587);
  for (const port of ['1', '65535']) assert.equal(mailSettings({ ...base, SMTP_PORT: port })?.port, Number(port));
  for (const port of ['0', '65536', '-1', 'abc', '25.5']) assert.equal(mailSettings({ ...base, SMTP_PORT: port }), null, port);
  assert.equal(mailSettings({ ...base, SMTP_HOST: '  ' }), null);
  assert.equal(mailSettings({}), null);
});

test('pageOpenGraph keeps the site-wide fields and lets a page choose its images', () => {
  assert.deepEqual(pageOpenGraph('T', 'D'), { type: 'website', siteName: 'Archió Interior Design Studio', locale: 'en_AE', images: [shareImage], title: 'T', description: 'D' });
  assert.deepEqual(pageOpenGraph('T', 'D', ['/x.webp'])?.images, ['/x.webp']);
  assert.ok(existsSync(`public${shareImage}`));
});

test('project content is consistent and every image file exists', () => {
  assert.equal(new Set(projects.map((p) => p.slug)).size, projects.length);
  assert.equal(getProject('nope'), undefined);
  for (const p of projects) {
    assert.ok(TYPES.includes(p.category), p.slug);
    for (const image of [p.cover, p.hero, ...p.gallery]) {
      assert.ok(image.alt.trim(), `${p.slug}: empty alt on ${image.src}`);
      assert.ok(existsSync(`public${image.src}`), `missing ${image.src}`);
    }
  }
});

// --- audit fixes, 24 Nov 2026 ---
test('a full rate-limit list forgets its oldest address instead of locking new visitors out', async () => {
  for (let i = 0; i < 5000; i++) await send({}, { 'x-real-ip': `cap-${i}` });
  const fresh = await send({}, { 'x-real-ip': 'cap-new-visitor' });
  assert.equal(fresh.status, 422); // reached validation: not 503 capacity_exceeded
});

test('a full enquiry list forgets its oldest finished enquiry instead of refusing new ones', async () => {
  capture();
  for (let i = 0; i < 5000; i++) assert.equal((await send({ ...valid, message: `bulk enquiry ${i}` })).status, 200);
  const next = await send({ ...valid, message: 'one more after the list is full' });
  assert.equal(next.status, 200);
});

test('a resend that corrects the name or location is delivered, an identical one is not', async () => {
  const sent = capture();
  const enquiry = { ...valid, contact: 'fix@example.com', location: 'Dubai Marinaa', message: 'corrected resend case' };
  assert.equal((await send(enquiry)).status, 200);
  const corrected = await send({ ...enquiry, location: 'Dubai Marina' });
  assert.deepEqual(await corrected.json(), { ok: true });
  const renamed = await send({ ...enquiry, location: 'Dubai Marina', name: 'Asha R. Rao' });
  assert.deepEqual(await renamed.json(), { ok: true });
  assert.equal(sent.length, 3);
  const same = await send({ ...enquiry, location: 'dubai  marina', name: 'asha r. rao' });
  assert.deepEqual(await same.json(), { ok: true, duplicate: true });
  assert.equal(sent.length, 3);
});

test('a body sent without a length is cut off at 16 KB, and a small one still works', { timeout: 5000 }, async () => {
  const post = (body: ReadableStream) => POST(new Request('http://localhost/api/contact', { method: 'POST', headers: { 'content-type': 'application/json', 'x-real-ip': `stream-${n++}` }, body, duplex: 'half' } as RequestInit));
  // A body that never ends: reading it whole would never finish, so this only passes if reading stops at the limit
  const endless = new ReadableStream({ pull(c) { c.enqueue(new Uint8Array(4096).fill(32)); } });
  assert.equal((await post(endless)).status, 413);
  const small = new ReadableStream({ start(c) { c.enqueue(new TextEncoder().encode('{}')); c.close(); } });
  assert.equal((await post(small)).status, 422);
});

test('the contact route answers POST only', async () => {
  assert.equal('GET' in (await import('./route.ts')), false);
});
