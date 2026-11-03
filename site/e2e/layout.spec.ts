import { test, expect, ROUTES } from './fixtures';

// CONSTRAINTS.md: no sideways scroll at any of these widths.
const WIDTHS = [320, 390, 768, 1280, 1920];

const overflow = (page: import('@playwright/test').Page) =>
  page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

for (const width of WIDTHS) {
  test.describe(`${width}px wide`, () => {
    test.use({ viewport: { width, height: 900 } });
    for (const route of ROUTES) {
      test(`${route} has no horizontal overflow`, async ({ page }) => {
        await page.goto(route);
        await expect.poll(() => overflow(page)).toBeLessThanOrEqual(0);
      });
    }
  });
}

// 200% zoom on a 1280px screen: the page lays out at 640 CSS px with two device pixels per CSS pixel.
test.describe('200% zoom (1280px screen)', () => {
  test.use({ viewport: { width: 640, height: 400 }, deviceScaleFactor: 2 });
  for (const route of ROUTES) {
    test(`${route} has no horizontal overflow`, async ({ page }) => {
      await page.goto(route);
      expect(await page.evaluate(() => devicePixelRatio)).toBe(2);
      await expect.poll(() => overflow(page)).toBeLessThanOrEqual(0);
    });
  }
});
