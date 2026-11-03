import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';
import { projects } from '../src/content/projects';
import { test, expect } from './fixtures';

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const total = projects.reduce((n, p) => n + p.gallery.length, 0);
const countFor = (filter: string) => (filter === 'All' ? total : projects.filter((p) => p.category === filter).reduce((n, p) => n + p.gallery.length, 0));
const FILTERS = ['All', ...new Set(projects.map((p) => p.category))];

const filters = (page: Page) => page.getByRole('group', { name: 'Filter images by category' });
const tiles = (page: Page) => page.getByRole('region', { name: 'More of the work, room by room' }).getByRole('button', { name: /^Open image \d+ of \d+:/ });

test.describe('/projects with full motion', () => {
  test.use({ reducedMotion: 'no-preference' });

  for (const width of [390, 1280]) {
    test(`renders cleanly at ${width}px`, async ({ page, consoleErrors, badResponses }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/projects');
      await expect(page.locator('h1')).toHaveText('Selected designs.');
      // Smooth scroll and the scroll effects load when the browser is idle; wait for them so their errors would be caught.
      await expect.poll(() => page.evaluate(() => 'lenis' in window)).toBe(true);
      await expect(tiles(page)).toHaveCount(total);
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
      const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
      expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
      expect(consoleErrors).toEqual([]);
      expect(badResponses).toEqual([]);
    });
  }
});

test('the project links in the tunnel open each project', async ({ page }) => {
  for (const p of projects) {
    await page.goto('/projects');
    await page.locator(`#main a[href="/projects/${p.slug}"]`).filter({ hasText: 'See the project', visible: true }).first().click();
    await expect(page).toHaveURL(`/projects/${p.slug}`);
  }
});

test('category filters show the matching images and announce the count', async ({ page }) => {
  await page.goto('/projects');
  const buttons = filters(page).getByRole('button');
  await expect(buttons).toHaveText(FILTERS);
  await expect(buttons.first()).toHaveAttribute('aria-pressed', 'true');

  for (const f of [...FILTERS.slice(1), 'All']) {
    const button = filters(page).getByRole('button', { name: f, exact: true });
    await button.click();
    await expect(button).toHaveAttribute('aria-pressed', 'true');
    for (const other of FILTERS.filter((o) => o !== f)) {
      await expect(filters(page).getByRole('button', { name: other, exact: true })).toHaveAttribute('aria-pressed', 'false');
    }
    await expect(tiles(page)).toHaveCount(countFor(f));
    await expect(page.getByText(`${countFor(f)} images shown`)).toBeAttached();
  }
});

test('a filtered mosaic tile opens the viewer on that image', async ({ page }) => {
  const project = projects.find((p) => p.category === 'Commercial')!;
  await page.goto('/projects');
  await filters(page).getByRole('button', { name: 'Commercial', exact: true }).click();
  await tiles(page).first().click();
  const fig = page.locator('dialog[open] figure:not([hidden])');
  await expect(fig.locator('img')).toHaveAttribute('alt', project.gallery[0].alt);
  await page.keyboard.press('Escape');
  await expect(page.locator('dialog[open]')).toHaveCount(0);
  await expect(tiles(page).first()).toBeFocused();
});
