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
const KEYS = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'CONTACT_TO_EMAIL', 'CONTACT_FROM_EMAIL', 'TURNSTILE_SECRET_KEY', 'CONTACT_AUTOREPLY'];
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
  assert.equal((await send({ ...valid, name: 'Asha\r\nBcc: evil@x.test' })).status, 200);
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
    assert.equal((await send({ ...valid, turnstileToken: 'tok' })).status, 200);
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
  assert.equal((await send(valid)).status, 502);
  assert.deepEqual(log.mock.calls[0].arguments, ['contact form: sending failed:', 'EAUTH']);
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
