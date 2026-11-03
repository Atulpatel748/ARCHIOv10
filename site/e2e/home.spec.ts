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

  test('pause button toggles its name', async ({ page }) => {
    await page.goto('/');
    const pause = hero(page).getByRole('button', { name: 'Pause slideshow' });
    await pause.click();
    const play = hero(page).getByRole('button', { name: 'Play slideshow' });
    await expect(play).toBeVisible();
    await play.click();
    await expect(hero(page).getByRole('button', { name: 'Pause slideshow' })).toBeVisible();
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
