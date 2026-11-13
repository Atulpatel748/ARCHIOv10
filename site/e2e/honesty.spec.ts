import { test, expect, ROUTES } from './fixtures';

// ADR-004 / ADR-008: the site sells design consultancy. (The "design visualisation" labels were dropped on 13 Nov 2026 at the studio's request: CONSTRAINTS.md, E3.)

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
