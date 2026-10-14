import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { inquiryService } from './services/inquiry.service.js';

const here = dirname(fileURLToPath(import.meta.url));
const read = (relative) => readFileSync(resolve(here, '..', relative), 'utf8');

// The headers the site is served with are the ones in vercel.json (the preview server sends the same, see vite.config.js).
const CONTENT_SECURITY_POLICY = JSON.parse(read('vercel.json')).headers.find(({ source }) => source === '/(.*)').headers
  .find(({ key }) => key === 'Content-Security-Policy').value;

describe('crawler files', () => {
  it('robots.txt points at the sitemap on the real site address, filled in at build time', () => {
    expect(read('public/robots.txt')).toMatch(/^Sitemap: __SITE_URL__\/sitemap\.xml$/m);
  });

  it('llms.txt has a heading and absolute links filled in at build time', () => {
    const llms = read('public/llms.txt');
    expect(llms).toMatch(/^# Archió$/m);
    expect(llms).toMatch(/^- \[Home\]\(__SITE_URL__\/\)$/m);
    expect(llms).toMatch(/^- \[Sitemap\]\(__SITE_URL__\/sitemap\.xml\)$/m);
  });
});

describe('the page shell works under the content security policy', () => {
  it('index.html has no inline <style> or <script>, which style-src and script-src \'self\' would block', () => {
    const html = read('index.html');
    expect(html).not.toMatch(/<style[\s>]/);
    // Both scripts are files from the site itself; neither has inline code.
    expect(html.match(/<script\b[^>]*>[^<]*/g)).toEqual(['<script src="/preloader-gate.js">', '<script type="module" src="/src/main.jsx">']);
  });
});

describe('hosting security headers', () => {
  afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

  it('the policy forbids inline scripts, plugins, framing and foreign form targets', () => {
    expect(CONTENT_SECURITY_POLICY).toContain("script-src 'self'");
    expect(CONTENT_SECURITY_POLICY).not.toMatch(/unsafe-inline|unsafe-eval/);
    expect(CONTENT_SECURITY_POLICY).toContain("object-src 'none'");
    expect(CONTENT_SECURITY_POLICY).toContain("frame-ancestors 'none'");
    expect(CONTENT_SECURITY_POLICY).toContain("form-action 'self'");
  });

  it('lets the contact form reach the address it sends to (connect-src), or the browser would block it silently', async () => {
    vi.stubEnv('WEB3FORMS_ACCESS_KEY', 'test-key');
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true }) });
    vi.stubGlobal('fetch', fetchMock);
    await inquiryService.create({
      name: 'Ada', email: 'ada@example.com', projectType: 'residential', propertyType: 'apartment', budgetRange: '100k_250k', timeline: '1_3_months', message: 'Hello', website: '',
    });
    const origin = new URL(fetchMock.mock.calls[0][0]).origin;
    const connectSrc = CONTENT_SECURITY_POLICY.split(';').map((directive) => directive.trim().split(/\s+/)).find(([name]) => name === 'connect-src').slice(1);
    expect(connectSrc).toContain(origin);
  });

  it('falls back to index.html for every client-side route', () => {
    const { rewrites } = JSON.parse(read('vercel.json'));
    expect(rewrites).toEqual([{ source: '/(.*)', destination: '/index.html' }]);
  });
});
