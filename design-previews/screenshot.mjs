// Capture design-preview screenshots with headless Chrome over the DevTools protocol (no dependencies).
// Usage: node design-previews/screenshot.mjs option-a option-b ...   (preview server must be running on :4173)
// Writes screenshots/<option>-<width>-fold.jpg, -full.jpg and -menu.jpg (phone), and prints layout checks.
import { spawn } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const CHROME = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = process.env.PREVIEW_URL || 'http://localhost:4173';
const OUT = process.env.SHOTS_DIR ? new URL(`file:///${process.env.SHOTS_DIR.replace(/\\/g, '/').replace(/\/?$/, '/')}`) : new URL('./screenshots/', import.meta.url);
const urlFor = (option) => (option === 'home' ? `${BASE}/` : `${BASE}/${option}`);
const fileFor = (option) => option.replace(/\//g, '-');
const VIEWPORTS = [{ w: 1440, h: 900 }, { w: 1024, h: 768 }, { w: 390, h: 844 }];
const options = process.argv.slice(2);
if (!options.length) { console.error('Name at least one option folder, e.g. option-a'); process.exit(1); }

const profile = mkdtempSync(join(tmpdir(), 'archio-shot-'));
const chrome = spawn(CHROME, ['--headless=new', '--remote-debugging-port=9333', `--user-data-dir=${profile}`, '--hide-scrollbars', '--no-first-run', 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function target() {
  for (let i = 0; i < 50; i++) {
    try { return await (await fetch('http://127.0.0.1:9333/json/new?about:blank', { method: 'PUT' })).json(); } catch { await sleep(200); }
  }
  throw new Error('Chrome did not start');
}

const { webSocketDebuggerUrl } = await target();
const ws = new WebSocket(webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r, { once: true }));
let id = 0; const pending = new Map(); const events = [];
ws.addEventListener('message', ({ data }) => {
  const msg = JSON.parse(data);
  if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); } else if (msg.method) events.push(msg);
});
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const n = ++id; pending.set(n, (m) => (m.error ? reject(new Error(`${method}: ${m.error.message}`)) : resolve(m.result)));
  ws.send(JSON.stringify({ id: n, method, params }));
});
const evaluate = async (expression) => (await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })).result.value;
const shot = async (name, clip) => {
  const { data } = await send('Page.captureScreenshot', { format: 'jpeg', quality: 82, captureBeyondViewport: true, clip: { x: 0, y: 0, ...clip, scale: 1 } });
  writeFileSync(new URL(name, OUT), Buffer.from(data, 'base64'));
};

await send('Page.enable'); await send('Runtime.enable');
// REDUCED=1 checks the reduced-motion path: everything visible at once, no WebGL slider.
if (process.env.REDUCED) await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
const report = [];
for (const option of options) {
  for (const { w, h } of VIEWPORTS) {
    events.length = 0;
    await send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: w < 768 });
    await send('Page.navigate', { url: urlFor(option) });
    await sleep(Number(process.env.WAIT_MS || 2500));
    await evaluate('document.fonts.ready.then(() => true)');
    const atLoad = await evaluate(`({ hiddenAtLoad: document.querySelectorAll('.js [data-reveal]:not(.is-in)').length, glSlider: !!document.querySelector('.gl-ready'),
      noMotionClass: document.documentElement.classList.contains('no-motion'), lightSweeps: document.querySelectorAll('.is-gl').length,
      hero3d: !!document.querySelector('.is-3d'), statementWordColor: document.querySelector('.statement-text .w') ? getComputedStyle(document.querySelector('.statement-text .w')).color : null })`);
    if (process.env.REDUCED) { report.push({ option, width: w, reducedMotion: atLoad }); continue; }
    await shot(`${fileFor(option)}-${w}-fold.jpg`, { width: w, height: h });
    // Walk the page so scroll-triggered reveals run, then return to the top for the full-length capture.
    await evaluate(`(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += ${Math.round(h * 0.6)}) { scrollTo({ top: y, behavior: 'instant' }); await new Promise(r => setTimeout(r, 120)); } scrollTo({ top: 0, behavior: 'instant' }); await new Promise(r => setTimeout(r, 1200)); return true; })()`);
    const checks = await evaluate(`({
      height: document.documentElement.scrollHeight,
      overflowX: document.documentElement.scrollWidth > innerWidth,
      brokenImages: [...document.images].filter(i => i.complete && i.naturalWidth === 0).map(i => i.getAttribute('src')),
      hiddenAfterScroll: document.querySelectorAll('.js [data-reveal]:not(.is-in)').length + [...document.querySelectorAll('[data-reveal]')].filter(e => getComputedStyle(e).visibility === 'hidden' || getComputedStyle(e).opacity === '0').length,
      smallTargets: [...document.querySelectorAll('a, button, input, select, textarea')].filter(el => !(el.matches('[type=radio], [type=checkbox]') && el.closest('label'))).filter(el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden' && !el.closest('[aria-hidden="true"]') && (r.height < 24 || r.width < 24); }).map(el => (el.textContent || el.name || el.type).trim().slice(0, 24))
    })`);
    await shot(`${fileFor(option)}-${w}-full.jpg`, { width: w, height: Math.min(checks.height, 16000) });
    // STOPS=sel1,sel2: viewport captures part-way through scroll-driven sections (full-page captures can't show them).
    for (const [n, sel] of (process.env.STOPS || '').split(',').filter(Boolean).entries()) {
      await evaluate(`(async () => { const el = document.querySelector(${JSON.stringify(sel)}); const r = el.getBoundingClientRect(); const travel = Math.max(el.offsetHeight - innerHeight, 0); const target = scrollY + r.top + travel * 0.55 - (travel ? 0 : innerHeight * 0.25); for (let y = scrollY; Math.abs(y - target) > 4; y += (target - y) / 6) { scrollTo(0, y); await new Promise(r => setTimeout(r, 30)); } scrollTo(0, target); await new Promise(r => setTimeout(r, 1500)); return true; })()`);
      const y = await evaluate('scrollY'); // clip is in document coordinates, so start at the current scroll position
      await shot(`${fileFor(option)}-${w}-stop-${n + 1}.jpg`, { y, width: w, height: h });
    }
    if (w < 768) {
      await evaluate(`document.querySelector('[data-menu-toggle], [aria-controls=site-menu]')?.click(), true`);
      await sleep(700);
      await shot(`${fileFor(option)}-${w}-menu.jpg`, { width: w, height: h });
    }
    const errors = events.filter((e) => e.method === 'Runtime.exceptionThrown' || (e.method === 'Runtime.consoleAPICalled' && e.params.type === 'error'))
      .map((e) => e.params.exceptionDetails?.exception?.description?.split('\n')[0] || e.params.args?.map((a) => a.value).join(' '));
    report.push({ option, width: w, ...checks, consoleErrors: errors });
  }
}
console.log(JSON.stringify(report, null, 2));
ws.close(); chrome.kill(); await sleep(300);
try { rmSync(profile, { recursive: true, force: true }); } catch { /* Chrome may still hold the profile briefly */ }
