import { test, expect, ROUTES } from './fixtures';

test('/favicon.ico redirects to /icon.svg', async ({ request }) => {
  const res = await request.get('/favicon.ico', { maxRedirects: 0 });
  expect(res.status()).toBe(308);
  expect(res.headers()['location']).toMatch(/\/icon\.svg$/);
});

test('robots.txt keeps crawlers out of /api/', async ({ request }) => {
  const res = await request.get('/robots.txt');
  expect(res.status()).toBe(200);
  expect(await res.text()).toMatch(/^Disallow: \/api\/$/m);
});

test('sitemap lists exactly the nine routes', async ({ request }) => {
  const res = await request.get('/sitemap.xml');
  expect(res.status()).toBe(200);
  const paths = [...(await res.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
  expect(paths.sort()).toEqual([...ROUTES].sort());
});

for (const route of ROUTES) {
  test(`${route} has a canonical link and a share image`, async ({ page }) => {
    await page.goto(route);
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(canonical && new URL(canonical).pathname).toBe(route);
    await expect(page.locator('meta[property="og:image"]').first()).toHaveAttribute('content', /^https?:\/\/.+\.(webp|jpe?g|png)/);
  });
}
