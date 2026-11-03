import AxeBuilder from '@axe-core/playwright';
import { test, expect, ROUTES } from './fixtures';

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

for (const route of [...ROUTES, '/no-such-page']) {
  test(`${route} has no axe violations`, async ({ page }) => {
    await page.goto(route);
    await page.waitForLoadState('load');
    const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
    expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
  });
}
