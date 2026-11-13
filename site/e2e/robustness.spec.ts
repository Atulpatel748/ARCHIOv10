// Edge cases the Testing team found missing: the real contact API's guards, odd addresses, structured data and dead links.
import { test, expect, ROUTES } from './fixtures';

test.describe('the real /api/contact guards', () => {
  const valid = { name: 'Test Visitor', contact: 'visitor@example.test', type: 'Residential', consent: 'yes', company: '' };
  // A unique address per test and repeat, so the 5-per-10-minutes limit never leaks between tests or runs.
  const ip = (id: string) => `e2e-guard-${id}-${Date.now()}`;

  test('the sixth post from one address is refused with 429, and another address is not', async ({ request }, testInfo) => {
    const id = `${testInfo.testId}-${testInfo.repeatEachIndex}`;
    const post = (address: string) => request.post('/api/contact', { headers: { 'x-real-ip': address }, data: valid });
    const address = ip(`${id}-a`);
    for (let i = 0; i < 5; i++) expect((await post(address)).status()).toBe(503); // validation passes; no mail is configured
    const sixth = await post(address);
    expect(sixth.status()).toBe(429);
    expect(await sixth.json()).toEqual({ error: 'rate_limited' });
    expect((await post(ip(`${id}-b`))).status()).toBe(503);
  });

  test('a post that names another site as its origin is refused; this site is accepted', async ({ request }, testInfo) => {
    const id = `${testInfo.testId}-${testInfo.repeatEachIndex}`;
    const evil = await request.post('/api/contact', { headers: { 'x-real-ip': ip(`${id}-e`), origin: 'https://evil.example' }, data: valid });
    expect(evil.status()).toBe(403);
    expect(await evil.json()).toEqual({ error: 'forbidden' });
    const same = await request.post('/api/contact', { headers: { 'x-real-ip': ip(`${id}-s`), origin: new URL(testInfo.project.use.baseURL ?? 'http://localhost:3100').origin }, data: valid });
    expect(same.status()).toBe(503);
  });

  test('bad bodies get 400 or 415, and every answer is no-store', async ({ request }, testInfo) => {
    const id = `${testInfo.testId}-${testInfo.repeatEachIndex}`;
    const answers = [
      await request.post('/api/contact', { headers: { 'x-real-ip': ip(`${id}-1`), 'content-type': 'application/json' }, data: '[]' }),
      await request.post('/api/contact', { headers: { 'x-real-ip': ip(`${id}-2`), 'content-type': 'application/json' }, data: 'null' }),
      await request.post('/api/contact', { headers: { 'x-real-ip': ip(`${id}-3`), 'content-type': 'application/json' }, data: '{oops' }),
      await request.post('/api/contact', { headers: { 'x-real-ip': ip(`${id}-4`), 'content-type': 'text/plain' }, data: 'hello' }),
    ];
    expect(answers.map((a) => a.status())).toEqual([400, 400, 400, 415]);
    for (const answer of answers) expect(answer.headers()['cache-control']).toContain('no-store');
    expect((await request.get('/api/contact')).headers()['cache-control']).toContain('no-store');
  });
});

test('an unknown project is a real 404', async ({ page }) => {
  const res = await page.goto('/projects/no-such-project');
  expect(res?.status()).toBe(404);
  await expect(page).toHaveTitle('Page not found | Archió Interior Design Studio');
  await expect(page.locator('h1')).toHaveCount(1);
});

test.describe('a broken or missing # in the address', () => {
  // The hash is read by a timer (300 ms after the scroll library loads) that only runs with full motion, so this needs it on.
  test.use({ reducedMotion: 'no-preference' });
  for (const route of ['/', '/about']) {
    for (const hash of ['#', '#nope', '#%E0%A4%A', '#%']) {
      test(`${route}${hash} still opens the page without an error`, async ({ page }) => {
        const errors: string[] = [];
        page.on('pageerror', (e) => errors.push(e.message));
        const res = await page.goto(route + hash);
        expect(res?.status()).toBe(200);
        await expect(page.locator('h1')).toBeVisible();
        await page.waitForLoadState('load');
        await page.waitForTimeout(1200); // the thing under test is that timer; there is nothing on the page to wait for
        expect(errors).toEqual([]);
      });
    }
  }
});

test.describe('structured data', () => {
  for (const route of ROUTES) {
    test(`${route} has valid JSON-LD that cannot close its own script tag`, async ({ page }) => {
      await page.goto(route);
      const blocks = await page.locator('script[type="application/ld+json"]').evaluateAll((nodes) => nodes.map((n) => n.textContent ?? ''));
      expect(blocks.length).toBeGreaterThan(0);
      for (const block of blocks) {
        expect(() => JSON.parse(block)).not.toThrow();
        expect(block).not.toContain('<');
      }
    });
  }
});

test('every internal link on every page leads somewhere that exists', async ({ page, request }) => {
  test.slow(); // nine pages plus every distinct link
  const checked = new Map<string, number>();
  for (const route of ROUTES) {
    await page.goto(route);
    const hrefs = await page.locator('a[href^="/"]').evaluateAll((links) => links.map((a) => (a as HTMLAnchorElement).getAttribute('href') ?? ''));
    for (const href of hrefs) {
      const path = href.split('#')[0] || '/';
      if (checked.has(path)) continue;
      checked.set(path, (await request.get(path)).status());
    }
  }
  const dead = [...checked].filter(([, status]) => status >= 400);
  expect(dead).toEqual([]);
  expect(checked.size).toBeGreaterThanOrEqual(ROUTES.length);
});

test('robots.txt points crawlers at the sitemap', async ({ request }) => {
  expect(await (await request.get('/robots.txt')).text()).toMatch(/^Sitemap: https?:\/\/\S+\/sitemap\.xml$/m);
});
