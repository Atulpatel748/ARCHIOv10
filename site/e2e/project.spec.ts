import type { Page } from '@playwright/test';
import { projects } from '../src/content/projects';
import { test, expect } from './fixtures';

const captionFor = (img: { room?: string; alt: string }) => `${img.room ?? img.alt} · Design visualisation`;

for (const project of projects) {
  const route = `/projects/${project.slug}`;
  const images = project.gallery;
  const last = images.length - 1;

  test.describe(route, () => {
    const viewer = (page: Page) => page.locator('dialog[open]');
    // The figure on show: its caption, and its photo's alt (unique per image, unlike room names).
    async function expectShowing(page: Page, i: number) {
      const fig = viewer(page).locator('figure:not([hidden])');
      await expect(fig).toHaveCount(1);
      await expect(fig.locator('figcaption')).toHaveText(captionFor(images[i]));
      await expect(fig.locator('img')).toHaveAttribute('alt', images[i].alt);
    }

    test('gallery viewer opens, closes on Escape and returns focus', async ({ page }) => {
      await page.goto(route);
      await page.getByRole('button', { name: `Open image 1 of ${images.length}:` }).click();
      await expect(viewer(page)).toBeVisible();
      await expect(viewer(page).getByRole('button', { name: 'Close' })).toBeFocused();
      await expectShowing(page, 0);

      await viewer(page).getByRole('button', { name: 'Next image' }).click();
      await expectShowing(page, 1);

      await page.keyboard.press('Escape');
      await expect(viewer(page)).toHaveCount(0);
      // Focus goes back to the image that is showing; after one Next that is image 2.
      await expect(page.getByRole('button', { name: `Open image 2 of ${images.length}:` })).toBeFocused();
    });

    test('arrow keys step through the images and wrap around', async ({ page }) => {
      await page.goto(route);
      await page.getByRole('button', { name: `Open image 1 of ${images.length}:` }).click();
      await expectShowing(page, 0);
      await page.keyboard.press('ArrowRight');
      await expectShowing(page, 1);
      await page.keyboard.press('ArrowLeft');
      await expectShowing(page, 0);
      await page.keyboard.press('ArrowLeft'); // first to last
      await expectShowing(page, last);
      await page.keyboard.press('ArrowRight'); // last to first
      await expectShowing(page, 0);
    });

    // A native modal <dialog> makes the page inert; Tab past its last button goes to the browser's own toolbar (no element is
    // focused) and comes back into the dialog, never onto the page behind.
    test('focus never leaves the open viewer for the page on Tab and Shift+Tab', async ({ page }) => {
      await page.goto(route);
      await page.getByRole('button', { name: `Open image 1 of ${images.length}:` }).click();
      await expect(viewer(page).getByRole('button', { name: 'Close' })).toBeFocused();
      const insideViewer = () => page.evaluate(() => {
        const el = document.activeElement;
        return !el || el === document.body || !!el.closest('dialog[open]');
      });
      for (const key of ['Tab', 'Shift+Tab']) {
        for (let n = 0; n < 10; n++) {
          await page.keyboard.press(key);
          expect(await insideViewer(), `${key} #${n + 1}`).toBe(true);
        }
      }
      // And the cycle really returns into the viewer.
      await expect(async () => {
        await page.keyboard.press('Tab');
        expect(await page.evaluate(() => !!document.activeElement?.closest('dialog[open]'))).toBe(true);
      }).toPass({ timeout: 5000 });
    });

    test('every gallery caption says Design visualisation, one per image', async ({ page }) => {
      await page.goto(route);
      const captions = page.locator('dialog figcaption');
      await expect(captions).toHaveCount(images.length);
      expect(await captions.allTextContents()).toEqual(images.map(captionFor));
    });
  });
}
