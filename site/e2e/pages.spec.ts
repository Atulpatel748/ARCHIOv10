import { test, expect, ROUTES } from './fixtures';

test.describe('every route', () => {
  for (const route of ROUTES) {
    test(`${route} loads cleanly`, async ({ page, consoleErrors, badResponses }) => {
      const res = await page.goto(route);
      expect(res?.status()).toBe(200);
      await expect(page.locator('html')).toHaveAttribute('lang', 'en');
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('h1')).not.toBeEmpty();

      const title = await page.title();
      expect(title).toMatch(/Archió/);

      // Every image has an alt attribute (empty is fine for decoration).
      const missingAlt = await page.locator('img:not([alt])').evaluateAll((imgs) => imgs.map((i) => (i as HTMLImageElement).src));
      expect(missingAlt).toEqual([]);

      expect(consoleErrors).toEqual([]);
      expect(badResponses).toEqual([]);
    });
  }

  test('titles are unique', async ({ page }) => {
    const seen = new Map<string, string>();
    for (const route of ROUTES) {
      await page.goto(route);
      const title = await page.title();
      expect(seen.get(title), `${route} repeats the title of ${seen.get(title)}`).toBeUndefined();
      seen.set(title, route);
    }
  });
});

test('404 page', async ({ page }) => {
  const res = await page.goto('/no-such-page');
  expect(res?.status()).toBe(404);
  await expect(page).toHaveTitle('Page not found | Archió Interior Design Studio');
  await expect(page.locator('h1')).toHaveCount(1);

  const main = page.locator('#main');
  await main.getByRole('link', { name: 'View projects' }).click();
  await expect(page).toHaveURL('/projects');

  await page.goto('/no-such-page');
  await main.getByRole('link', { name: 'Home' }).click();
  await expect(page).toHaveURL('/');
});
