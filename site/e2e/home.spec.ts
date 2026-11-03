import { test, expect } from './fixtures';

const hero = (page: import('@playwright/test').Page) => page.getByRole('region', { name: 'Featured projects' });

test.describe('hero slider, reduced motion', () => {
  test('slide buttons change the active slide; no autoplay so no pause button', async ({ page }) => {
    await page.goto('/');
    const dots = hero(page).getByRole('button', { name: /^Show slide \d of 3/ });
    await expect(dots).toHaveCount(3);
    await expect(dots.nth(0)).toHaveAttribute('aria-current', 'true');
    await expect(hero(page).getByRole('button', { name: /slideshow/ })).toHaveCount(0);

    for (const i of [1, 2, 0]) {
      // A change takes 0.7 s and clicks during it are ignored, so retry the click until it lands.
      await expect(async () => {
        await dots.nth(i).click();
        await expect(dots.nth(i)).toHaveAttribute('aria-current', 'true', { timeout: 1000 });
      }).toPass();
      const title = (await dots.nth(i).getAttribute('aria-label'))!.split(': ')[1];
      await expect(hero(page).getByRole('link', { name: `View project : ${title}` })).toBeVisible();
      for (const j of [0, 1, 2].filter((n) => n !== i)) await expect(dots.nth(j)).not.toHaveAttribute('aria-current');
    }
  });
});

test('a slide button works from the keyboard', async ({ page }) => {
  await page.goto('/');
  const dots = hero(page).getByRole('button', { name: /^Show slide \d of 3/ });
  await dots.nth(0).focus();
  await page.keyboard.press('Tab');
  await expect(dots.nth(1)).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(dots.nth(1)).toHaveAttribute('aria-current', 'true');
  await expect(dots.nth(0)).not.toHaveAttribute('aria-current');
});

test.describe('hero slider, normal motion', () => {
  // Phone width: the hero keeps the plain crossfade there and never loads WebGL (ADR-005).
  test.use({ reducedMotion: 'no-preference', viewport: { width: 390, height: 844 } });

  test('has no pause button (removed by the owner, ADR-010); the tracks sit in a centred row above the caption', async ({ page }) => {
    await page.goto('/');
    await expect(hero(page).getByRole('button', { name: /slideshow/ })).toHaveCount(0);
    const dots = hero(page).getByRole('button', { name: /^Show slide \d of 3/ });
    const first = (await dots.nth(0).boundingBox())!;
    const last = (await dots.nth(2).boundingBox())!;
    expect(Math.abs((first.x + last.x + last.width) / 2 - 390 / 2)).toBeLessThan(2);
    const link = (await hero(page).getByRole('link', { name: /^View project/ }).boundingBox())!;
    expect(link.y).toBeGreaterThan(first.y + first.height - 1);
  });
});

test.describe('hero bar on a desktop', () => {
  test.use({ reducedMotion: 'no-preference', viewport: { width: 1280, height: 800 } });

  test('place on the left, slide tracks centred, View project on the right', async ({ page }) => {
    await page.goto('/');
    await expect(hero(page).getByRole('button', { name: /slideshow/ })).toHaveCount(0);
    const dots = hero(page).getByRole('button', { name: /^Show slide \d of 3/ });
    const first = (await dots.nth(0).boundingBox())!;
    const last = (await dots.nth(2).boundingBox())!;
    expect(Math.abs((first.x + last.x + last.width) / 2 - 1280 / 2)).toBeLessThan(2);
    const link = (await hero(page).getByRole('link', { name: /^View project/ }).boundingBox())!;
    expect(link.x).toBeGreaterThan(last.x + last.width);
    expect(1280 - (link.x + link.width)).toBeLessThan(100); // against the right margin
  });
});

test.describe('home with full motion and the preloader', () => {
  test.use({ reducedMotion: 'no-preference', preloader: true });

  test('renders its h1 with no console errors', async ({ page, consoleErrors }) => {
    await page.goto('/');
    await expect(page.locator('[data-preloader]')).toHaveCount(0, { timeout: 15_000 });
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toBeVisible();
    expect(consoleErrors).toEqual([]);
  });

  test('the logo and links over the hero photo are white from the start: during the preloader and after it', async ({ page }) => {
    // Record the header colour on every frame from the first paint, so even a brief switch to oxblood is caught.
    await page.addInitScript(() => {
      const seen = new Set<string>();
      (window as unknown as { headerColours: Set<string> }).headerColours = seen;
      const tick = () => { const h = document.querySelector('header'); if (h) seen.add(getComputedStyle(h).color); requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('[data-preloader]')).toBeVisible();
    await expect(page.locator('[data-preloader]')).toHaveCount(0, { timeout: 15_000 });
    await page.waitForTimeout(1000); // and the checks that follow it
    const colours = await page.evaluate(() => [...(window as unknown as { headerColours: Set<string> }).headerColours]);
    expect(colours).toEqual(['rgb(248, 247, 244)']);
  });
});

test.describe('only one hero wordmark at a time', () => {
  const headerLogo = (page: import('@playwright/test').Page) => page.getByRole('banner').locator('a[href="/"] .logo');

  test.describe('before the page script runs', () => {
    test.use({ javaScriptEnabled: false });

    test('the hero shows its own wordmark and the header copy is hidden', async ({ page }) => {
      await page.goto('/');
      await expect(page.locator('[data-hero-mark]')).toBeVisible();
      await expect(headerLogo(page)).toBeHidden();
    });
  });

  test.describe('normal motion, once the script has placed the header logo', () => {
    test.use({ reducedMotion: 'no-preference' });

    test('the header logo takes over and the hero copy hides', async ({ page }) => {
      await page.goto('/');
      await expect(page.locator('html')).toHaveAttribute('data-hero-brand', '');
      await expect(headerLogo(page)).toBeVisible();
      await expect(page.locator('[data-hero-mark]')).toBeHidden();
    });
  });

  test('reduced motion keeps the hero wordmark and hides the header copy over the hero', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-hero-brand', '');
    await expect(page.locator('[data-hero-mark]')).toBeVisible();
    await expect(headerLogo(page)).toBeHidden();
  });
});

test.describe('preloader', () => {
  // Full motion: the preloader then stays at least 2 s, long enough to observe it.
  test.use({ reducedMotion: 'no-preference', preloader: true });

  test('shows on the first visit in a tab, with the page behind inert, and not on the next load', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const overlay = page.locator('[data-preloader]');
    await expect(overlay).toBeVisible();
    for (const region of ['header', '#main', 'footer']) await expect(page.locator(region).first()).toHaveAttribute('inert', '');
    await expect(overlay).toHaveCount(0, { timeout: 15_000 });
    await expect(page.locator('#main')).not.toHaveAttribute('inert');

    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-no-preloader', '');
    await expect(page.locator('[data-preloader]')).toBeHidden();
    await expect(page.locator('#main')).not.toHaveAttribute('inert');
  });
});
