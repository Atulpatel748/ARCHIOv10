import type { Page } from '@playwright/test';
import { test, expect } from './fixtures';

// Copy from site/src/components/ContactForm.tsx and site/src/content/site.ts.
const FAILED = 'Sorry, your enquiry could not be sent.';
const CAPTCHA = 'Sorry, the security check did not load or did not pass.';
const SENT = 'Thank you, your enquiry has been sent.';

const form = (page: Page) => page.locator('#main form');

async function fillValid(page: Page) {
  await page.getByLabel('Name').fill('Test Visitor');
  await page.getByLabel('Email or phone').fill('visitor@example.test');
  await page.getByRole('radio', { name: 'Residential' }).check();
  await page.getByRole('checkbox', { name: /I agree to Archió/ }).check();
}

const send = (page: Page) => page.getByRole('button', { name: 'Send enquiry' }).click();

async function expectFallback(page: Page, text: string) {
  const status = form(page).getByRole('status');
  await expect(status).toContainText(text);
  await expect(status.getByRole('link', { name: 'WhatsApp' })).toHaveAttribute('href', /^https:\/\/wa\.me\//);
  await expect(status.getByRole('link', { name: /@/ })).toHaveAttribute('href', /^mailto:/);
}

test.beforeEach(async ({ page }) => {
  await page.goto('/contact');
});

test('empty submit shows every required error and focuses the first field', async ({ page }) => {
  let posted = false;
  await page.route('**/api/contact', (route) => { posted = true; return route.abort(); });
  await send(page);

  const name = page.getByLabel('Name');
  await expect(name).toBeFocused();
  await expect(name).toHaveAttribute('aria-invalid', 'true');
  await expect(name).toHaveAccessibleDescription('Please enter your name.');
  const contact = page.getByLabel('Email or phone');
  await expect(contact).toHaveAttribute('aria-invalid', 'true');
  await expect(contact).toHaveAccessibleDescription('Please enter a valid email address or phone number.');
  await expect(page.getByRole('radio', { name: 'Residential' })).toHaveAccessibleDescription('Please choose a type of project.');
  const consent = page.getByRole('checkbox', { name: /I agree to Archió/ });
  await expect(consent).toHaveAttribute('aria-invalid', 'true');
  await expect(consent).toHaveAccessibleDescription('Please confirm so we can reply to you.');
  expect(posted).toBe(false);
});

test('missing consent alone blocks the send', async ({ page }) => {
  await fillValid(page);
  const consent = page.getByRole('checkbox', { name: /I agree to Archió/ });
  await consent.uncheck();
  await send(page);
  await expect(consent).toBeFocused();
  await expect(consent).toHaveAccessibleDescription('Please confirm so we can reply to you.');
  await expect(page.getByLabel('Name')).toHaveAttribute('aria-invalid', 'false');
});

test('an invalid email is refused before sending', async ({ page }) => {
  await fillValid(page);
  await page.getByLabel('Email or phone').fill('not an email');
  await send(page);
  await expect(page.getByLabel('Email or phone')).toBeFocused();
  await expect(page.getByText('Please enter a valid email address or phone number.')).toBeVisible();
});

test('the honeypot is off-screen, hidden from assistive tech and never focused by Tab', async ({ page }) => {
  const trap = page.locator('#company');
  await expect(trap).not.toBeInViewport();
  await expect(trap).toHaveAttribute('tabindex', '-1');
  await expect(page.locator('div[aria-hidden="true"]').filter({ has: trap })).toHaveCount(1);
  await expect(page.getByRole('textbox', { name: 'Leave this empty' })).toHaveCount(0);

  await page.getByLabel('Name').focus();
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press('Tab');
    await expect(trap).not.toBeFocused();
  }
});

test.describe('with /api/contact mocked', () => {
  test('success shows the thank-you note and moves focus to it', async ({ page }) => {
    await page.route('**/api/contact', (route) => route.fulfill({ status: 200, json: { ok: true } }));
    await fillValid(page);
    const request = page.waitForRequest('**/api/contact');
    await send(page);
    const body = (await request).postDataJSON() as Record<string, string>;
    expect(body).toMatchObject({ name: 'Test Visitor', contact: 'visitor@example.test', type: 'Residential', consent: 'yes', company: '' });

    const done = page.getByRole('status').filter({ hasText: SENT });
    await expect(done).toBeVisible();
    await expect(done).toBeFocused();
    await expect(form(page)).toHaveCount(0);
  });

  const failures: [string, number, object][] = [
    ['server validation error', 422, { error: 'invalid', fields: ['name'] }],
    ['rate limit', 429, { error: 'rate_limited' }],
    ['not configured', 503, { error: 'not_configured' }],
  ];
  for (const [label, status, json] of failures) {
    test(`${label} (${status}) shows the WhatsApp and email fallback`, async ({ page }) => {
      await page.route('**/api/contact', (route) => route.fulfill({ status, json }));
      await fillValid(page);
      await send(page);
      await expectFallback(page, FAILED);
      await expect(page.getByLabel('Name')).toHaveValue('Test Visitor'); // nothing typed is lost
    });
  }

  test('a failed security check shows its own message', async ({ page }) => {
    await page.route('**/api/contact', (route) => route.fulfill({ status: 403, json: { error: 'captcha' } }));
    await fillValid(page);
    await send(page);
    await expectFallback(page, CAPTCHA);
  });

  test('a network failure shows the fallback', async ({ page }) => {
    await page.route('**/api/contact', (route) => route.abort('internetdisconnected'));
    await fillValid(page);
    await send(page);
    await expectFallback(page, FAILED);
  });
});

test('the real server without mail settings answers 503 not_configured and the form falls back', async ({ page }, testInfo) => {
  // The route rate-limits by x-real-ip, so each run claims its own address instead of sharing 127.0.0.1 with its siblings.
  const ip = `e2e-${testInfo.testId}-${testInfo.repeatEachIndex}-${Date.now()}`;
  await page.route('**/api/contact', (route) => route.continue({ headers: { ...route.request().headers(), 'x-real-ip': ip } }));
  await fillValid(page);
  const response = page.waitForResponse('**/api/contact');
  await send(page);
  const res = await response;
  expect(res.status()).toBe(503);
  expect(await res.json()).toEqual({ error: 'not_configured' });
  await expectFallback(page, FAILED);
});

test.describe('in flight', () => {
  test('shows the sending state and ignores a second click', async ({ page }) => {
    let calls = 0;
    let release!: () => void;
    const held = new Promise<void>((resolve) => { release = resolve; });
    await page.route('**/api/contact', async (route) => {
      calls++;
      await held;
      await route.fulfill({ status: 200, json: { ok: true } });
    });
    await fillValid(page);
    await send(page);
    const button = page.getByRole('button', { name: 'Sending…' });
    await expect(button).toHaveAttribute('aria-disabled', 'true');
    await expect(button).toBeFocused(); // aria-disabled, not disabled, so focus stays on it
    // Try again by mouse and by keyboard. Playwright's click() waits for aria-disabled to clear, so press at the button's spot.
    const box = (await button.boundingBox())!;
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    await page.keyboard.press('Enter');
    await expect.poll(() => calls).toBe(1);
    release();
    await expect(page.getByRole('status').filter({ hasText: SENT })).toBeVisible();
    expect(calls).toBe(1);
  });
});

test.describe('contact field rules (site/src/content/contact.ts)', () => {
  const CONTACT_ERROR = 'Please enter a valid email address or phone number.';

  test('a phone number is accepted and sent as typed', async ({ page }) => {
    await page.route('**/api/contact', (route) => route.fulfill({ status: 200, json: { ok: true } }));
    await fillValid(page);
    await page.getByLabel('Email or phone').fill('+971 50 123 4567');
    const request = page.waitForRequest('**/api/contact');
    await send(page);
    expect((await request).postDataJSON()).toMatchObject({ contact: '+971 50 123 4567' });
  });

  const cases: [string, string, boolean][] = [
    ['a 6-digit phone (one short of the minimum)', '123456', false],
    ['a 7-digit phone (the shortest allowed)', '1234567', true],
    ['two emails in one field', 'a@example.test,b@example.test', false],
    ['an email with a display name', 'Visitor <a@example.test>', false],
    ['an email with a mail comment', 'a(b)@example.test', false],
    ['an email that is an address group', 'x:victim@example.test', false],
  ];
  for (const [label, value, ok] of cases) {
    test(`${label} is ${ok ? 'accepted' : 'refused'}`, async ({ page }) => {
      let posted = false;
      await page.route('**/api/contact', (route) => { posted = true; return route.fulfill({ status: 200, json: { ok: true } }); });
      await fillValid(page);
      const field = page.getByLabel('Email or phone');
      await field.fill(value);
      await send(page);
      if (ok) {
        await expect(page.getByRole('status').filter({ hasText: SENT })).toBeVisible();
        expect(posted).toBe(true);
      } else {
        await expect(field).toHaveAccessibleDescription(CONTACT_ERROR);
        await expect(field).toBeFocused();
        expect(posted).toBe(false);
      }
    });
  }

  test('a one-letter name is refused, two letters are accepted', async ({ page }) => {
    await page.route('**/api/contact', (route) => route.fulfill({ status: 200, json: { ok: true } }));
    await fillValid(page);
    const name = page.getByLabel('Name');
    await name.fill('A');
    await send(page);
    await expect(name).toHaveAccessibleDescription('Please enter your name.');
    await name.fill('Al');
    await send(page);
    await expect(page.getByRole('status').filter({ hasText: SENT })).toBeVisible();
  });

  test('each field caps its length to what the server keeps', async ({ page }) => {
    // The same caps as clean() in site/src/app/api/contact/route.ts.
    for (const [label, max] of [['Name', 100], ['Email or phone', 120], ['Community or location', 120], ['About the space', 2000]] as const) {
      await expect(page.getByLabel(label)).toHaveAttribute('maxlength', String(max));
    }
  });
});

test.describe('the real /api/contact', () => {
  const valid = { name: 'Test Visitor', contact: 'visitor@example.test', type: 'Residential', consent: 'yes', company: '' };
  const headers = (id: string) => ({ 'content-type': 'application/json', 'x-real-ip': `e2e-api-${id}-${Date.now()}` });

  test('refuses missing fields with 422 and names them', async ({ request }, testInfo) => {
    const res = await request.post('/api/contact', { headers: headers(`${testInfo.testId}-${testInfo.repeatEachIndex}`), data: { ...valid, name: 'A', consent: 'no' } });
    expect(res.status()).toBe(422);
    expect(await res.json()).toEqual({ error: 'invalid', fields: ['name', 'consent'] });
  });

  test('refuses a body over 16 KB with 413', async ({ request }, testInfo) => {
    const res = await request.post('/api/contact', { headers: headers(`${testInfo.testId}-${testInfo.repeatEachIndex}`), data: { ...valid, message: 'x'.repeat(17_000) } });
    expect(res.status()).toBe(413);
  });

  test('an over-long message is not refused (the route cuts it to 2000 characters)', async ({ request }, testInfo) => {
    // Validation passes, so the answer is the unconfigured-mail 503 (playwright.config.ts pins the settings empty).
    const res = await request.post('/api/contact', { headers: headers(`${testInfo.testId}-${testInfo.repeatEachIndex}`), data: { ...valid, message: 'x'.repeat(2500) } });
    expect(res.status()).toBe(503);
    expect(await res.json()).toEqual({ error: 'not_configured' });
  });
});
