import type { Page } from '@playwright/test';
import { test, expect } from './fixtures';

// Copy from site/src/components/ContactForm.tsx and site/src/content/site.ts.
const FAILED = 'Your enquiry did not send.';
const CAPTCHA = 'The security check did not complete.';
const SENT = 'Thank you. Your enquiry has been sent.';

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
  await expect(contact).toHaveAccessibleDescription(/Enter an email address or phone number we can reply to./);
  await expect(page.getByRole('radio', { name: 'Residential' })).toHaveAccessibleDescription('Choose the type of project closest to yours.');
  const consent = page.getByRole('checkbox', { name: /I agree to Archió/ });
  await expect(consent).toHaveAttribute('aria-invalid', 'true');
  await expect(consent).toHaveAccessibleDescription('Tick the box to confirm, so we can reply to you.');
  // The status line (a live region) says how many fields need attention, so the later errors are not silent for a screen reader.
  await expect(page.getByRole('status').filter({ hasText: '4 fields need attention: Name, Email or phone, Type of project, the consent box.' })).toHaveCount(1);
  expect(posted).toBe(false);
});

test('an error goes as soon as its field is put right, and the summary follows', async ({ page }) => {
  await page.route('**/api/contact', (route) => route.abort());
  await send(page);
  await expect(page.getByText('Please enter your name.')).toBeVisible();
  await page.getByLabel('Name').fill('Asha');
  await expect(page.getByText('Please enter your name.')).toHaveCount(0);
  await expect(page.getByRole('status').filter({ hasText: '3 fields need attention: Email or phone, Type of project, the consent box.' })).toHaveCount(1);
  await page.getByRole('radio', { name: 'Residential' }).check();
  await expect(page.getByText('Choose the type of project closest to yours.')).toHaveCount(0);
  await expect(page.getByLabel('Email or phone')).toHaveAttribute('aria-invalid', 'true'); // still wrong: its message stays
});

test('missing consent alone blocks the send', async ({ page }) => {
  await fillValid(page);
  const consent = page.getByRole('checkbox', { name: /I agree to Archió/ });
  await consent.uncheck();
  await send(page);
  await expect(consent).toBeFocused();
  await expect(consent).toHaveAccessibleDescription('Tick the box to confirm, so we can reply to you.');
  await expect(page.getByLabel('Name')).toHaveAttribute('aria-invalid', 'false');
});

test('an invalid email is refused before sending', async ({ page }) => {
  await fillValid(page);
  await page.getByLabel('Email or phone').fill('not an email');
  await send(page);
  await expect(page.getByLabel('Email or phone')).toBeFocused();
  await expect(page.getByText('Enter an email address or phone number we can reply to.')).toBeVisible();
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
  const CONTACT_ERROR = 'Enter an email address or phone number we can reply to.';

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
        await expect(field).toHaveAccessibleDescription(new RegExp(CONTACT_ERROR.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
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

// The big heading must never split "conversation" or let it run past its column, whatever the window width or the visitor's
// browser text size (a larger text size grows the rem part of the heading's size, which used to push the word out of the column).
test('the Contact heading keeps the word "conversation" whole, at any width and text size', async ({ page }) => {
  await page.goto('/contact');
  for (const base of ['100%', '150%']) {
    await page.evaluate((b) => { document.documentElement.style.fontSize = b; }, base);
    for (const width of [320, 1024, 1280, 1536, 1920]) {
      await page.setViewportSize({ width, height: 800 });
      const result = await page.evaluate(() => {
        const h1 = document.querySelector('h1')!;
        const column = (document.querySelector('[class*="info"]') as HTMLElement).clientWidth;
        const word = [...h1.querySelectorAll('span')].filter((s) => s.children.length === 0 && /conversation/i.test(s.textContent ?? ''));
        const widest = Math.max(0, ...word.map((s) => s.getBoundingClientRect().width));
        const range = document.createRange();
        const split = word.some((s) => { range.selectNodeContents(s); return new Set([...range.getClientRects()].map((r) => Math.round(r.top))).size > 1; });
        return { fits: widest <= column + 1, split };
      });
      expect(result, `text size ${base}, window ${width}px`).toEqual({ fits: true, split: false });
    }
  }
});
