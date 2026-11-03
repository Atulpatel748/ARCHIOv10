import { test, expect, ROUTES } from './fixtures';

// ADR-004 / ADR-008: the site sells design consultancy, and every render says it is a design visualisation.
test('/services labels its three band images as design visualisations', async ({ page }) => {
  await page.goto('/services');
  const labels = page.locator('#main').getByText('Design visualisation', { exact: true });
  await expect(labels).toHaveCount(3);
  // Each label sits beside its own photo.
  for (let i = 0; i < 3; i++) await expect(labels.nth(i).locator('xpath=..').locator('img')).toHaveCount(1);
});

const BANNED = /fit-out|handover|design and build/i;

for (const route of ROUTES) {
  test(`${route} avoids build-and-deliver wording`, async ({ page }) => {
    await page.goto(route);
    expect(await page.locator('body').innerText()).not.toMatch(BANNED);
  });

  test(`${route} has no build-and-deliver wording in its data scripts`, async ({ page }) => {
    await page.goto(route);
    const scripts = await page.locator('script:not([src])').allTextContents();
    expect(scripts.filter((s) => BANNED.test(s)).map((s) => s.slice(0, 120))).toEqual([]);
  });
}
