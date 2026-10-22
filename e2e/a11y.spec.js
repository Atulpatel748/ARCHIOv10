import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { expect, test } from '@playwright/test';

const axeSource = readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8');
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];

test.use({ bypassCSP: true });

async function violationsOn(page) {
  await page.addScriptTag({ content: axeSource });
  return page.evaluate(async (tags) => {
    const result = await window.axe.run(document, { runOnly: { type: 'tag', values: tags } });
    return result.violations.map((v) => ({ id: v.id, impact: v.impact, help: v.help, targets: v.nodes.slice(0, 3).map((n) => n.target.join(' ')) }));
  }, TAGS);
}

async function expectAccessible(page, label) {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);
  expect(await violationsOn(page), label).toEqual([]);
}

test.describe('accessibility (axe-core, WCAG 2.2 A/AA + best practice)', () => {
  const publicPaths = ['/', '/projects', '/projects/dubai-marina-residence', '/services', '/about', '/contact', '/privacy', '/terms', '/cookies', '/no-such-page'];

  for (const path of publicPaths) {
    test(`public page ${path}`, async ({ page }) => {
      await page.goto(path);
      await expectAccessible(page, path);
    });
  }

  test('contact form steps and validation errors', async ({ page }) => {
    await page.goto('/contact');
    const form = page.getByRole('form', { name: 'Project inquiry' });
    await form.getByRole('button', { name: 'Next' }).click();
    await expectAccessible(page, 'contact step 1 with errors');
    await form.getByLabel('Full name').fill('Ada Lovelace');
    await form.getByLabel('Email').fill('ada@example.com');
    await form.getByRole('button', { name: 'Next' }).click();
    await expectAccessible(page, 'contact step 2');
    await form.getByLabel('What do you need?').selectOption('residential');
    await form.getByLabel('Property type').selectOption('apartment');
    await form.getByLabel('Budget range').selectOption('100k_250k');
    await form.getByLabel('When would you like to start?').selectOption('asap');
    await form.getByRole('button', { name: 'Next' }).click();
    await form.getByRole('button', { name: 'Send me a quote' }).click();
    await expectAccessible(page, 'contact step 3 with errors');
  });

  test('mobile menu dialog', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.getByRole('button', { name: /^menu/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expectAccessible(page, 'mobile menu');
  });
});
