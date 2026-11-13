import { test, expect, ROUTES } from './fixtures';

// CONSTRAINTS.md: no sideways scroll at any of these widths.
const WIDTHS = [320, 360, 375, 390, 414, 768, 1024, 1280, 1440, 1920];

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

// The narrowest phones: the centred logo's tap area must stay clear of the "Let's talk" pill.
test.describe('header at 320px', () => {
  test.use({ viewport: { width: 320, height: 700 } });
  test('the logo and the Let\'s talk pill do not overlap', async ({ page }) => {
    await page.goto('/about');
    const brand = (await page.getByRole('banner').getByRole('link', { name: 'Archió, home' }).boundingBox())!;
    const talk = (await page.getByRole('banner').getByRole('link', { name: /Let's talk/ }).boundingBox())!;
    expect(brand.x + brand.width).toBeLessThanOrEqual(talk.x);
  });
});

// 200% zoom on a 1280px screen: the page lays out at 640 CSS px with two device pixels per CSS pixel.
test.describe('200% zoom (1280px screen)', () => {
  test.use({ viewport: { width: 640, height: 400 }, deviceScaleFactor: 2 });
  for (const route of ROUTES) {
    test(`${route} has no horizontal overflow`, async ({ page, browserName }) => {
      await page.goto(route);
      // Playwright's Firefox cannot emulate a pixel ratio; the 640px layout width is what the overflow check needs.
      if (browserName !== 'firefox') expect(await page.evaluate(() => devicePixelRatio)).toBe(2);
      await expect.poll(() => overflow(page)).toBeLessThanOrEqual(0);
    });
  }
});
