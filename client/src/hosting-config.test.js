import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { CONTENT_SECURITY_POLICY, SECURITY_HEADERS } from '../security-headers.js';

const here = dirname(fileURLToPath(import.meta.url));
const read = (relative) => readFileSync(resolve(here, '..', relative), 'utf8');

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

describe('hosting security headers stay in sync', () => {
  it('vercel.json sends exactly the headers defined in security-headers.js', () => {
    const vercel = JSON.parse(read('vercel.json'));
    const sent = Object.fromEntries(vercel.headers.find((rule) => rule.source === '/(.*)').headers.map(({ key, value }) => [key, value]));
    expect(sent).toEqual(SECURITY_HEADERS);
  });

  it('the policy forbids inline scripts, plugins, framing and foreign form targets', () => {
    expect(CONTENT_SECURITY_POLICY).toContain("script-src 'self'");
    expect(CONTENT_SECURITY_POLICY).not.toMatch(/unsafe-inline|unsafe-eval/);
    expect(CONTENT_SECURITY_POLICY).toContain("object-src 'none'");
    expect(CONTENT_SECURITY_POLICY).toContain("frame-ancestors 'none'");
    expect(CONTENT_SECURITY_POLICY).toContain("form-action 'self'");
  });

  it('falls back to index.html for client-side routes, but not for the /api functions', () => {
    const { rewrites } = JSON.parse(read('vercel.json'));
    expect(rewrites).toEqual([{ source: '/((?!api/).*)', destination: '/index.html' }]);
  });
});
