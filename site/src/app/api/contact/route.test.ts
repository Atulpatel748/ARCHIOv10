// Run with `npm test` (plain Node, no test library). The route is loaded as it is; only the mail sender is replaced,
// except in the last tests, which send one real message to a tiny fake mail server that runs inside the test.
import assert from 'node:assert/strict';
import net from 'node:net';
import { afterEach, test } from 'node:test';
import { mailSettings, mailer, type Mail, type MailSettings } from '../../../lib/mailer.ts';
import { POST } from './route.ts';

const valid = { name: 'Asha Rao', contact: 'asha@example.com', type: 'Residential', consent: 'yes' };
let n = 0;
const post = (body: unknown, { ip = `10.0.0.${++n}`, type = 'application/json', raw }: { ip?: string; type?: string; raw?: string } = {}) =>
  POST(new Request('http://localhost/api/contact', { method: 'POST', headers: { 'content-type': type, 'x-real-ip': ip }, body: raw ?? JSON.stringify(body) }));
const status = async (res: Response) => [res.status, await res.json()] as const;

const SETTINGS = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'CONTACT_TO_EMAIL', 'CONTACT_FROM_EMAIL'];
const realSend = mailer.send;
const realFetch = globalThis.fetch;
afterEach(() => {
  mailer.send = realSend;
  globalThis.fetch = realFetch;
  for (const key of [...SETTINGS, 'TURNSTILE_SECRET_KEY']) delete process.env[key];
});
// Stands in for Cloudflare's siteverify: answers with `answer`, or throws it, and keeps every request it gets.
const siteverify = (answer: object | Error) => {
  const calls: { url: string; form: URLSearchParams }[] = [];
  globalThis.fetch = async (url, init) => {
    calls.push({ url: String(url), form: new URLSearchParams(String(init?.body)) });
    if (answer instanceof Error) throw answer;
    return Response.json(answer);
  };
  process.env.TURNSTILE_SECRET_KEY = 'secret';
  return calls;
};
const configure = () => Object.assign(process.env, { SMTP_HOST: 'mail.example.com', SMTP_USER: 'u', SMTP_PASS: 'p', CONTACT_TO_EMAIL: 'to@example.com', CONTACT_FROM_EMAIL: 'from@example.com' });

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
  mailer.send = async () => { called = true; };
  configure();
  assert.deepEqual(await status(await post({ ...valid, company: 'bot inc' })), [200, { ok: true }]);
  assert.equal(called, false);
});

test('lists every invalid field', async () => {
  const [code, body] = await status(await post({ name: 'A', contact: 'nope', type: 'Spaceship', consent: 'no' }));
  assert.equal(code, 422);
  assert.deepEqual(body.fields, ['name', 'contact', 'type', 'consent']);
});

test('refuses an email that would add a second reply-to address', async () => {
  for (const contact of ['asha@example.com,eve@example.net', 'asha@example.com;eve', 'Eve <eve@example.net>']) {
    const [code, body] = await status(await post({ ...valid, contact }));
    assert.equal(code, 422, contact);
    assert.deepEqual(body.fields, ['contact']);
  }
});

test('in production a missing Turnstile secret refuses the request instead of skipping the check', async () => {
  const env = process.env as Record<string, string | undefined>;
  const before = env.NODE_ENV;
  let called = false;
  mailer.send = async () => { called = true; };
  configure();
  env.NODE_ENV = 'production';
  try {
    assert.deepEqual(await status(await post(valid)), [503, { error: 'not_configured' }]);
    assert.equal(called, false);
  } finally {
    if (before === undefined) delete env.NODE_ENV; else env.NODE_ENV = before;
  }
});

test('accepts a phone number as the contact', async () => {
  assert.equal((await post({ ...valid, contact: '+971 55 654 1410' })).status, 503); // valid, but no mail settings set
});

test('says not_configured when the mail settings are missing', async () => {
  assert.deepEqual(await status(await post(valid)), [503, { error: 'not_configured' }]);
});

test('without a Turnstile secret no captcha is asked for and Cloudflare is not called', async () => {
  let called = false;
  globalThis.fetch = async () => { called = true; return Response.json({ success: true }); };
  assert.deepEqual(await status(await post(valid)), [503, { error: 'not_configured' }]);
  assert.equal(called, false);
});

test('with a Turnstile secret, a missing token is refused before Cloudflare is asked', async () => {
  const calls = siteverify({ success: true });
  assert.deepEqual(await status(await post(valid)), [400, { error: 'captcha' }]);
  assert.equal(calls.length, 0);
});

test('a token Cloudflare rejects is refused', async () => {
  siteverify({ success: false, 'error-codes': ['invalid-input-response'] });
  assert.deepEqual(await status(await post({ ...valid, turnstileToken: 'bad' })), [403, { error: 'captcha' }]);
});

test('a token Cloudflare accepts goes on to the mail step, checked with the secret and the visitor address', async () => {
  const calls = siteverify({ success: true });
  assert.deepEqual(await status(await post({ ...valid, turnstileToken: 'good' }, { ip: '198.51.100.7' })), [503, { error: 'not_configured' }]);
  assert.equal(calls[0].url, 'https://challenges.cloudflare.com/turnstile/v0/siteverify');
  assert.deepEqual(Object.fromEntries(calls[0].form), { secret: 'secret', response: 'good', remoteip: '198.51.100.7' });
});

test('when Cloudflare cannot be reached the enquiry is refused, not let through', async () => {
  configure();
  let called = false;
  mailer.send = async () => { called = true; };
  siteverify(new Error('fetch failed'));
  assert.deepEqual(await status(await post({ ...valid, turnstileToken: 'good' })), [503, { error: 'captcha_unavailable' }]);
  assert.equal(called, false);
});

test('sends the enquiry by email and escapes the text in the HTML part', async () => {
  configure();
  let sent: { settings: MailSettings; mail: Mail } | undefined;
  mailer.send = async (settings, mail) => { sent = { settings, mail }; };
  assert.deepEqual(await status(await post({ ...valid, message: '<script>alert(1)</script>' })), [200, { ok: true }]);
  assert.equal(sent?.settings.to, 'to@example.com');
  assert.equal(sent?.mail.replyTo, 'asha@example.com');
  assert.equal(sent?.mail.subject, 'Website enquiry: Residential project from Asha Rao');
  assert.ok(!sent?.mail.html.includes('<script>'));
  assert.ok(sent?.mail.text.includes('<script>alert(1)</script>')); // plain text needs no escaping
});

test('no reply-to when the contact is a phone number', async () => {
  configure();
  let mail: Mail | undefined;
  mailer.send = async (_settings, m) => { mail = m; };
  await post({ ...valid, contact: '+971 55 654 1410' });
  assert.equal(mail?.replyTo, undefined);
});

test('reports send_failed when the mail server cannot be reached', async () => {
  configure();
  mailer.send = async () => { throw Object.assign(new Error('connect ECONNREFUSED'), { code: 'ECONNECTION' }); };
  assert.deepEqual(await status(await post(valid)), [502, { error: 'send_failed' }]);
});

test('limits one address to 5 enquiries per 10 minutes', async () => {
  const ip = '203.0.113.9';
  for (let i = 0; i < 5; i++) assert.notEqual((await post(valid, { ip })).status, 429);
  assert.equal((await post(valid, { ip })).status, 429);
  assert.notEqual((await post(valid, { ip: '203.0.113.10' })).status, 429);
});

test('mail settings: all five are needed, the port defaults to 587 and must be a real port', () => {
  const full = { SMTP_HOST: 'h', SMTP_USER: 'u', SMTP_PASS: 'p', CONTACT_TO_EMAIL: 't@x.com', CONTACT_FROM_EMAIL: 'f@x.com' };
  assert.equal(mailSettings(full)?.port, 587);
  assert.equal(mailSettings({ ...full, SMTP_PORT: '465' })?.port, 465);
  for (const key of Object.keys(full)) assert.equal(mailSettings({ ...full, [key]: '' }), null, `${key} missing`);
  for (const bad of ['0', '70000', 'abc', '25.5']) assert.equal(mailSettings({ ...full, SMTP_PORT: bad }), null, `port ${bad}`);
});

// A minimal mail server: says hello, accepts the login and the message, and keeps every line it receives.
function fakeMailServer() {
  const received: string[] = [];
  const server = net.createServer((socket) => {
    let inMessage = false;
    let buffer = '';
    const reply = (line: string) => socket.write(line + '\r\n');
    reply('220 fake ESMTP');
    socket.on('data', (chunk) => {
      buffer += chunk.toString();
      let end: number;
      while ((end = buffer.indexOf('\r\n')) >= 0) {
        const line = buffer.slice(0, end);
        buffer = buffer.slice(end + 2);
        if (inMessage) {
          if (line === '.') { inMessage = false; reply('250 queued'); } else received.push(line);
          continue;
        }
        const command = line.toUpperCase();
        if (command.startsWith('EHLO') || command.startsWith('HELO')) socket.write('250-fake\r\n250 AUTH PLAIN\r\n');
        else if (command.startsWith('AUTH')) reply('235 logged in');
        else if (command === 'DATA') { inMessage = true; reply('354 go ahead'); }
        else if (command === 'QUIT') { reply('221 bye'); socket.end(); }
        else reply('250 ok');
      }
    });
  });
  return new Promise<{ port: number; received: string[]; close: () => void }>((resolve) =>
    server.listen(0, '127.0.0.1', () => resolve({ port: (server.address() as net.AddressInfo).port, received, close: () => server.close() })));
}

test('the real sender delivers a message to a mail server', async () => {
  const server = await fakeMailServer();
  try {
    await realSend(
      { host: '127.0.0.1', port: server.port, user: 'u', pass: 'p', to: 'to@example.com', from: 'Archio site <from@example.com>' },
      { replyTo: 'asha@example.com', subject: 'Website enquiry: Residential project from Asha Rao', text: 'Location: Dubai Marina', html: '<p>Location: Dubai Marina</p>' },
    );
    const message = server.received.join('\n');
    assert.match(message, /^Subject: Website enquiry: Residential project from Asha Rao$/m);
    assert.match(message, /^Reply-To: asha@example\.com$/m);
    assert.match(message, /^To: to@example\.com$/m);
    assert.match(message, /Location: Dubai Marina/);
  } finally {
    server.close();
  }
});

test('the real sender fails cleanly when nothing is listening', async () => {
  const server = await fakeMailServer();
  const { port } = server;
  server.close();
  await new Promise((done) => setTimeout(done, 50));
  await assert.rejects(realSend({ host: '127.0.0.1', port, user: 'u', pass: 'p', to: 'to@example.com', from: 'from@example.com' }, { subject: 's', text: 't', html: 'h' }));
});
