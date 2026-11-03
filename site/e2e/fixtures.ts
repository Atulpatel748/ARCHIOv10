import { test as base, expect } from '@playwright/test';

export { expect };

export const ROUTES = [
  '/',
  '/projects',
  '/services',
  '/about',
  '/contact',
  '/privacy',
  '/projects/dubai-marina-residence',
  '/projects/jlt-office',
  '/projects/arabian-ranches-garden',
];

const isLocal = (url: string) => {
  try {
    return ['localhost', '127.0.0.1', '[::1]'].includes(new URL(url).hostname);
  } catch {
    return url.startsWith('data:') || url.startsWith('blob:');
  }
};

type Fixtures = {
  /** Show the landing preloader (first visit in a tab). Off by default: tests start on the page itself. */
  preloader: boolean;
  /** Console errors from the page, minus the ones caused by our own blocking of outside requests. */
  consoleErrors: string[];
  /** Same-origin responses with status 400 or more. */
  badResponses: string[];
};

export const test = base.extend<Fixtures>({
  preloader: [false, { option: true }],

  page: async ({ page, preloader }, provide) => {
    // Nothing leaves the machine: Turnstile (challenges.cloudflare.com) and anything else outside is aborted.
    await page.route('**/*', (route) => (isLocal(route.request().url()) ? route.fallback() : route.abort('blockedbyclient')));
    // The layout's head script skips the preloader when this key is set (see app/layout.tsx).
    if (!preloader) await page.addInitScript(() => sessionStorage.setItem('archio-seen', '1'));
    await provide(page);
  },

  consoleErrors: async ({ page }, provide) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() !== 'error') return;
      if (!isLocal(msg.location().url || 'http://localhost/')) return; // a request we aborted on purpose
      errors.push(msg.text());
    });
    page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
    await provide(errors);
  },

  badResponses: async ({ page }, provide) => {
    const bad: string[] = [];
    page.on('response', (res) => {
      if (isLocal(res.url()) && res.status() >= 400) bad.push(`${res.status()} ${res.url()}`);
    });
    page.on('requestfailed', (req) => {
      const why = req.failure()?.errorText ?? '';
      if (isLocal(req.url()) && !why.includes('ERR_ABORTED')) bad.push(`failed ${req.url()} ${why}`);
    });
    await provide(bad);
  },
});
