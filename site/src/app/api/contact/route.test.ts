// Run with `npm test` (plain Node, no test library). The route is loaded as it is; only fetch (Resend) is replaced.
import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { POST } from './route.ts';

const valid = { name: 'Asha Rao', contact: 'asha@example.com', type: 'Residential', consent: 'yes' };
let n = 0;
const post = (body: unknown, { ip = `10.0.0.${++n}`, type = 'application/json', raw }: { ip?: string; type?: string; raw?: string } = {}) =>
  POST(new Request('http://localhost/api/contact', { method: 'POST', headers: { 'content-type': type, 'x-real-ip': ip }, body: raw ?? JSON.stringify(body) }));
const status = async (res: Response) => [res.status, await res.json()] as const;

const realFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = realFetch;
  delete process.env.RESEND_API_KEY;
  delete process.env.CONTACT_TO_EMAIL;
  delete process.env.CONTACT_FROM_EMAIL;
});
const configure = () => Object.assign(process.env, { RESEND_API_KEY: 'k', CONTACT_TO_EMAIL: 'to@example.com', CONTACT_FROM_EMAIL: 'from@example.com' });

test('rejects a body that is not JSON', async () => {
  assert.equal((await post(null, { type: 'text/plain' })).status, 415);
  assert.equal((await post(null, { raw: '{oops' })).status, 400);
  assert.equal((await post([1, 2])).status, 400);
});

test('rejects a body over 16 KB', async () => {
  assert.equal((await post({ ...valid, message: 'x'.repeat(20_000) })).status, 413);
});

test('a filled honeypot gets a quiet ok and nothing is sent', async () => {
  let called = false;
  globalThis.fetch = (async () => { called = true; return new Response('{}'); }) as typeof fetch;
  configure();
  assert.deepEqual(await status(await post({ ...valid, company: 'bot inc' })), [200, { ok: true }]);
  assert.equal(called, false);
});

test('lists every invalid field', async () => {
  const [code, body] = await status(await post({ name: 'A', contact: 'nope', type: 'Spaceship', consent: 'no' }));
  assert.equal(code, 422);
  assert.deepEqual(body.fields, ['name', 'contact', 'type', 'consent']);
});

test('accepts a phone number as the contact', async () => {
  assert.equal((await post({ ...valid, contact: '+971 55 654 1410' })).status, 503); // valid, but no credentials set
});

test('says not_configured when the Resend settings are missing', async () => {
  assert.deepEqual(await status(await post(valid)), [503, { error: 'not_configured' }]);
});

test('sends the enquiry through Resend and escapes the text', async () => {
  configure();
  let sent: { html: string; reply_to?: string } | undefined;
  globalThis.fetch = (async (_url: unknown, init?: RequestInit) => { sent = JSON.parse(String(init?.body)); return new Response('{}'); }) as typeof fetch;
  assert.deepEqual(await status(await post({ ...valid, message: '<script>alert(1)</script>' })), [200, { ok: true }]);
  assert.equal(sent?.reply_to, 'asha@example.com');
  assert.ok(!sent?.html.includes('<script>'));
});

test('reports send_failed when Resend errors or times out', async () => {
  configure();
  globalThis.fetch = (async () => new Response('{}', { status: 500 })) as typeof fetch;
  assert.deepEqual(await status(await post(valid)), [502, { error: 'send_failed' }]);
  globalThis.fetch = (async () => { throw new Error('network'); }) as typeof fetch;
  assert.deepEqual(await status(await post(valid)), [502, { error: 'send_failed' }]);
});

test('limits one address to 5 enquiries per 10 minutes', async () => {
  const ip = '203.0.113.9';
  for (let i = 0; i < 5; i++) assert.notEqual((await post(valid, { ip })).status, 429);
  assert.equal((await post(valid, { ip })).status, 429);
  assert.notEqual((await post(valid, { ip: '203.0.113.10' })).status, 429);
});
