import { expect, test } from '@playwright/test';
import { unique } from './helpers.js';

test.describe('project inquiry form', () => {
  test('validates each step, then submits a request', async ({ page }) => {
    const name = unique('E2E Visitor');
    // Stands in for Web3Forms, which the tests must not call.
    const sent = [];
    await page.route('https://api.web3forms.com/submit', async (route) => {
      sent.push(route.request().postDataJSON());
      await route.fulfill({ status: 201, json: { success: true } });
    });
    await page.goto('/contact');
    const form = page.getByRole('form', { name: 'Project inquiry' });

    await expect(form.getByLabel('Email')).toHaveAttribute('spellcheck', 'false'); // an address is not a word to check
    await form.getByRole('button', { name: 'Next' }).click();
    await expect(form.getByLabel('Full name')).toHaveAttribute('aria-invalid', 'true');
    await expect(form.getByLabel('Email')).toHaveAttribute('aria-invalid', 'true');

    await form.getByLabel('Full name').fill(name);
    await form.getByLabel('Email').fill('e2e.visitor@example.com');
    await form.getByRole('button', { name: 'Next' }).click();

    await form.getByLabel('What do you need?').selectOption('residential');
    await form.getByLabel('Property type').selectOption('apartment');
    await form.getByLabel('Budget range').selectOption('100k_250k');
    await form.getByLabel('When would you like to start?').selectOption('1_3_months');
    await form.getByRole('button', { name: 'Next' }).click();

    await form.getByRole('button', { name: 'Send me a quote' }).click();
    await expect(form.getByLabel('Tell us about your space')).toHaveAttribute('aria-invalid', 'true');

    await form.getByLabel('Tell us about your space').fill('We want to renovate a two bedroom apartment, including the kitchen and bathrooms.');
    await form.getByRole('checkbox').check();
    await form.getByRole('button', { name: 'Send me a quote' }).click();

    await expect(page.getByRole('heading', { name: 'Thank you' })).toBeVisible();
    expect(sent).toEqual([expect.objectContaining({ name, email: 'e2e.visitor@example.com', needs: 'Residential interior' })]);

    // Once the request is sent there is nothing left to lose, so leaving the page must not prompt.
    let prompted = false;
    page.on('dialog', async (dialog) => { prompted = true; await dialog.dismiss(); });
    await page.getByRole('link', { name: 'Archió, home' }).click();
    await expect(page).toHaveURL(/\/$/);
    expect(prompted).toBe(false);
    test.info().annotations.push({ type: 'inquiry-name', description: name });
  });

  test('warns before leaving a half-filled inquiry, and lets the person stay or leave', async ({ page }) => {
    await page.goto('/contact');
    await page.getByLabel('Full name').fill('Half Filled');
    const messages = [];
    page.once('dialog', async (dialog) => { messages.push(dialog.message()); await dialog.dismiss(); });
    await page.getByRole('link', { name: 'Archió, home' }).click();
    await expect.poll(() => messages.length).toBe(1);
    expect(messages[0]).toMatch(/unsaved changes/i);
    await expect(page).toHaveURL(/\/contact$/);
    await expect(page.getByLabel('Full name')).toHaveValue('Half Filled');

    page.once('dialog', (dialog) => dialog.accept());
    await page.getByRole('link', { name: 'Archió, home' }).click();
    await expect(page).toHaveURL(/\/$/);
  });

  test('does not warn when nothing has been typed', async ({ page }) => {
    let prompted = false;
    page.on('dialog', async (dialog) => { prompted = true; await dialog.dismiss(); });
    await page.goto('/contact');
    await page.getByRole('link', { name: 'Archió, home' }).click();
    await expect(page).toHaveURL(/\/$/);
    expect(prompted).toBe(false);
  });

  test('shows a clear message when the API is unreachable', async ({ page }) => {
    await page.goto('/contact');
    await page.route('https://api.web3forms.com/submit', (route) => route.abort('failed'));
    const form = page.getByRole('form', { name: 'Project inquiry' });
    await form.getByLabel('Full name').fill('Offline Visitor');
    await form.getByLabel('Email').fill('offline@example.com');
    await form.getByRole('button', { name: 'Next' }).click();
    await form.getByLabel('What do you need?').selectOption('consultation');
    await form.getByLabel('Property type').selectOption('house');
    await form.getByLabel('Budget range').selectOption('not_sure');
    await form.getByLabel('When would you like to start?').selectOption('planning');
    await form.getByRole('button', { name: 'Next' }).click();
    await form.getByLabel('Tell us about your space').fill('Our living room never feels finished and we need help with layout and lighting.');
    await form.getByRole('checkbox').check();
    await form.getByRole('button', { name: 'Send me a quote' }).click();
    await expect(page.getByRole('alert')).toContainText(/could not reach the server/i);
    await expect(form.getByLabel('Tell us about your space')).toHaveValue(/living room/);
  });
});
