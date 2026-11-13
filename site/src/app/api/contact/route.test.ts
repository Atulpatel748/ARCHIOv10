// Run with `npm test` (plain Node, no test library). The route is loaded as it is; only the mail sender is replaced,
// except in the last tests, which send one real message to a tiny fake mail server that runs inside the test.
import assert from 'node:assert/strict';
import net from 'node:net';
import { afterEach, test } from 'node:test';
import { AUTOREPLY, isValidContact } from '../../../content/contact.ts';
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
  for (const key of [...SETTINGS, 'TURNSTILE_SECRET_KEY', 'CONTACT_AUTOREPLY']) delete process.env[key];
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

// Keeps every mail the route sends, in order.
const recordSends = () => {
  const sent: Mail[] = [];
  mailer.send = async (_settings, mail) => { sent.push(mail); };
  return sent;
};

test('no confirmation unless CONTACT_AUTOREPLY is exactly "on"', async () => {
  configure();
  for (const value of [undefined, 'ON', 'yes']) {
    if (value === undefined) delete process.env.CONTACT_AUTOREPLY; else process.env.CONTACT_AUTOREPLY = value;
    const sent = recordSends();
    assert.deepEqual(await status(await post(valid)), [200, { ok: true }]);
    assert.equal(sent.length, 1, String(value));
  }
});

test('the visitor gets a fixed confirmation after the studio email', async () => {
  configure();
  process.env.CONTACT_AUTOREPLY = 'on';
  const sent = recordSends();
  const markers = { name: 'Zqxname Marker', location: 'Zqxlocation-marker', message: 'Zqxmessage-marker' };
  assert.deepEqual(await status(await post({ ...valid, ...markers, contact: 'fixed@example.com' })), [200, { ok: true }]);
  assert.equal(sent.length, 2);
  assert.equal(sent[0].to, undefined); // the studio email goes first, to the default address
  const reply = sent[1];
  assert.equal(reply.to, 'fixed@example.com');
  assert.equal(reply.replyTo, 'to@example.com');
  assert.deepEqual(reply.headers, { 'Auto-Submitted': 'auto-generated' });
  assert.equal(reply.subject, AUTOREPLY.subject);
  assert.equal(reply.text, AUTOREPLY.paragraphs.join('\n\n'));
  const everything = JSON.stringify(reply);
  for (const marker of ['Zqxname', 'Zqxlocation', 'Zqxmessage']) assert.ok(!everything.includes(marker), marker);
});

test('no confirmation for a phone contact', async () => {
  configure();
  process.env.CONTACT_AUTOREPLY = 'on';
  const sent = recordSends();
  await post({ ...valid, contact: '+971 55 654 1410' });
  assert.equal(sent.length, 1);
});

test('no confirmation when the studio email fails', async () => {
  configure();
  process.env.CONTACT_AUTOREPLY = 'on';
  let calls = 0;
  mailer.send = async () => { calls++; throw Object.assign(new Error('down'), { code: 'ECONNECTION' }); };
  const realError = console.error;
  console.error = () => {};
  try {
    assert.deepEqual(await status(await post(valid)), [502, { error: 'send_failed' }]);
  } finally {
    console.error = realError;
  }
  assert.equal(calls, 1);
});

test('a failed confirmation still answers ok and logs only the error code', async () => {
  configure();
  process.env.CONTACT_AUTOREPLY = 'on';
  let calls = 0;
  mailer.send = async () => { if (++calls === 2) throw Object.assign(new Error('rejected fail@example.com at mail.example.com'), { code: 'EENVELOPE' }); };
  const logged: unknown[][] = [];
  const realError = console.error;
  console.error = (...args: unknown[]) => { logged.push(args); };
  try {
    assert.deepEqual(await status(await post({ ...valid, contact: 'fail@example.com' })), [200, { ok: true }]);
  } finally {
    console.error = realError;
  }
  assert.equal(calls, 2);
  assert.deepEqual(logged, [['contact form: confirmation failed:', 'EENVELOPE']]);
  const text = JSON.stringify(logged);
  for (const secret of ['fail@example.com', 'to@example.com', 'from@example.com', 'mail.example.com']) assert.ok(!text.includes(secret), secret);
});

test('an email with ( ) or \\ is refused', async () => {
  for (const contact of ['a(b)@c.d', 'asha@example.com(eve)', 'a\\b@c.d']) {
    const [code, body] = await status(await post({ ...valid, contact }));
    assert.equal(code, 422, contact);
    assert.deepEqual(body.fields, ['contact']);
  }
});

test('an email with : [ or ] is refused (an address group or a raw IP address)', async () => {
  for (const contact of ['x:victim@evil.com', 'a:b:c@d.e', 'a@[127.0.0.1]']) {
    const [code, body] = await status(await post({ ...valid, contact }));
    assert.equal(code, 422, contact);
    assert.deepEqual(body.fields, ['contact']);
  }
});

test('contact rule: plain ASCII emails only (no look-alike letters, no odd characters)', () => {
  for (const bad of ['a|b@c.test', 'a%40b@c.test', 'a!b@c.test', "a'b@c.test", 'victim@ｃ.test', 'victim@с.test', 'a@b..test', 'a@-b.test']) assert.equal(isValidContact(bad), false, bad);
  for (const good of ['victim+x@c.test', 'first.last@sub.example.co.uk', 'a_b-c@d-e.ae']) assert.equal(isValidContact(good), true, good);
});

test('a post from another origin is refused; the same origin and no origin are not', async () => {
  const send = (origin?: string) => POST(new Request('http://localhost/api/contact', { method: 'POST', headers: { 'content-type': 'application/json', 'x-real-ip': `10.8.0.${++n}`, ...(origin ? { origin } : {}) }, body: JSON.stringify({}) }));
  assert.equal((await send('https://evil.test')).status, 403);
  assert.equal((await send('not a url')).status, 403);
  assert.notEqual((await send('http://localhost')).status, 403);
  assert.notEqual((await send()).status, 403);
});

test('contact rule: refuses ( ) \\ : [ ] in an email, still accepts a normal email and a phone', () => {
  for (const bad of ['a(b)@c.d', 'a\\b@c.d', 'x:victim@evil.com', 'a:b:c@d.e', 'a@[127.0.0.1]', 'x@y.c']) assert.equal(isValidContact(bad), false, bad);
  assert.equal(isValidContact('asha@example.com'), true);
  assert.equal(isValidContact('x@y.co'), true);
  assert.equal(isValidContact('+971 55 654 1410'), true);
});

test('one confirmation per address per 24 hours; the studio still gets every enquiry', async () => {
  configure();
  process.env.CONTACT_AUTOREPLY = 'on';
  const sent = recordSends();
  const realNow = Date.now;
  const start = realNow();
  try {
    Date.now = () => start;
    await post({ ...valid, contact: 'once@example.com' });
    assert.equal(sent.length, 2);
    Date.now = () => start + 23 * 60 * 60 * 1000;
    assert.deepEqual(await status(await post({ ...valid, contact: 'ONCE@Example.com' })), [200, { ok: true }]);
    assert.equal(sent.length, 3); // studio email only: same address in another case, from another IP
    Date.now = () => start + 24 * 60 * 60 * 1000;
    await post({ ...valid, contact: 'once@example.com' });
    assert.equal(sent.length, 5);
    assert.equal(sent[4].to, 'once@example.com');
  } finally {
    Date.now = realNow;
  }
});

test('confirmation wording makes no promises', () => {
  const words = [AUTOREPLY.subject, ...AUTOREPLY.paragraphs].join(' ');
  assert.doesNotMatch(words, /\d/);
  for (const promise of ['within', 'hour', 'day', 'guarantee', 'years', 'always']) assert.ok(!words.toLowerCase().includes(promise), promise);
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

test('the real sender uses Mail.to when given', async () => {
  const server = await fakeMailServer();
  try {
    await realSend(
      { host: '127.0.0.1', port: server.port, user: 'u', pass: 'p', to: 'to@example.com', from: 'from@example.com' },
      { to: 'asha@example.com', replyTo: 'to@example.com', subject: 's', text: 't', html: 'h', headers: { 'Auto-Submitted': 'auto-generated' } },
    );
    const message = server.received.join('\n');
    assert.match(message, /^To: asha@example\.com$/m);
    assert.match(message, /^Reply-To: to@example\.com$/m);
    assert.match(message, /^From: from@example\.com$/m);
    assert.match(message, /^Auto-Submitted: auto-generated$/m);
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
