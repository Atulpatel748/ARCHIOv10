import { test, expect } from './fixtures';

test.describe('desktop header and footer', () => {
  for (const [name, path] of [['Projects', '/projects'], ['Services', '/services'], ['About', '/about']] as const) {
    test(`header link ${name} opens ${path}`, async ({ page }) => {
      await page.goto('/privacy');
      const link = page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name });
      await link.click();
      await expect(page).toHaveURL(path);
      await expect(link).toHaveAttribute('aria-current', 'page');
    });
  }

  test("header Let's talk opens /contact and the logo goes home", async ({ page }) => {
    await page.goto('/about');
    await page.getByRole('banner').getByRole('link', { name: "Let's talk" }).click();
    await expect(page).toHaveURL('/contact');
    await page.getByRole('link', { name: 'Archió, home' }).click();
    await expect(page).toHaveURL('/');
  });

  for (const [name, path] of [['Projects', '/projects'], ['Services', '/services'], ['About', '/about'], ['Contact', '/contact']] as const) {
    test(`footer link ${name} opens ${path}`, async ({ page }) => {
      await page.goto('/privacy');
      await page.getByRole('navigation', { name: 'Footer' }).getByRole('link', { name, exact: true }).click();
      await expect(page).toHaveURL(path);
    });
  }

  test('footer Privacy notice opens /privacy', async ({ page }) => {
    await page.goto('/about');
    await page.getByRole('contentinfo').getByRole('link', { name: 'Privacy notice' }).click();
    await expect(page).toHaveURL('/privacy');
  });

  test('skip link is the first Tab stop and moves to main', async ({ page }) => {
    await page.goto('/about');
    await page.keyboard.press('Tab');
    const skip = page.getByRole('link', { name: 'Skip to content' });
    await expect(skip).toBeFocused();
    await expect(skip).toBeInViewport();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#main$/);
  });

  test("Tab reaches Let's talk with a visible focus outline", async ({ page }) => {
    await page.goto('/about');
    const cta = page.getByRole('banner').getByRole('link', { name: "Let's talk" });
    // The logo is the Tab stop just before it; one Tab from there, so the press is a keyboard one and :focus-visible applies.
    await page.getByRole('link', { name: 'Archió, home' }).focus();
    await page.keyboard.press('Tab');
    await expect(cta).toBeFocused();
    const outline = await cta.evaluate((el) => {
      const s = getComputedStyle(el);
      return { style: s.outlineStyle, width: parseFloat(s.outlineWidth) };
    });
    expect(outline.style).not.toBe('none');
    expect(outline.width).toBeGreaterThan(0);
  });
});

test.describe('mobile menu at 390px', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('with reduced motion, opening the menu moves focus to its first link', async ({ page }) => {
    await page.goto('/about');
    await page.getByRole('button', { name: 'Open the menu' }).click();
    await expect(page.getByRole('dialog', { name: 'Menu' }).getByRole('link', { name: 'Home' })).toBeFocused();
  });

  test('opens, closes on Escape and returns focus to the toggle', async ({ page }) => {
    await page.goto('/about');
    const toggle = page.getByRole('button', { name: 'Open the menu' });
    await toggle.click();
    const menu = page.getByRole('dialog', { name: 'Menu' });
    await expect(menu).toBeVisible();
    await expect(page.getByRole('button', { name: 'Close the menu' })).toHaveAttribute('aria-expanded', 'true');
    // The page behind is inert, so focus cannot wander into it.
    await expect(page.locator('#main')).toHaveJSProperty('inert', true);

    await page.keyboard.press('Escape');
    await expect(menu).toBeHidden();
    await expect(page.getByRole('button', { name: 'Open the menu' })).toBeFocused();
    await expect(page.locator('#main')).toHaveJSProperty('inert', false);
  });

  test.describe('normal motion', () => {
    test.use({ reducedMotion: 'no-preference' });

    test('opening the menu moves focus to its first link', async ({ page }) => {
      await page.goto('/about');
      await page.getByRole('button', { name: 'Open the menu' }).click();
      await expect(page.getByRole('dialog', { name: 'Menu' }).getByRole('link', { name: 'Home' })).toBeFocused();
    });

    test('on the home page the big hero logo is white, and moves small into the header when the menu opens', async ({ page }) => {
      await page.goto('/');
      const brand = page.getByRole('banner').locator('a[href="/"]');
      // White (paper) over the hero photo, never oxblood.
      await expect(page.getByRole('banner')).toHaveCSS('color', 'rgb(248, 247, 244)');
      await page.getByRole('button', { name: 'Open the menu' }).click();
      const contact = page.getByRole('dialog', { name: 'Menu' }).getByRole('link', { name: 'Contact' });
      await expect(contact).toBeVisible();
      await expect(async () => {
        const logo = (await brand.boundingBox())!;
        const link = (await contact.boundingBox())!;
        expect(logo.y + logo.height).toBeLessThanOrEqual(link.y); // above the links, not across them
        expect(logo.height).toBeLessThan(80);
      }).toPass();
    });
  });

  test('the menu labels the call link, so the phone number does not look repeated', async ({ page }) => {
    await page.goto('/about');
    await page.getByRole('button', { name: 'Open the menu' }).click();
    const menu = page.getByRole('dialog', { name: 'Menu' });
    await expect(menu.getByRole('link', { name: /^WhatsApp \+/ })).toHaveAttribute('href', /^https:\/\/wa\.me\//);
    await expect(menu.getByRole('link', { name: /^Call \+/ })).toHaveAttribute('href', /^tel:/);
  });

  test('closes after choosing a link', async ({ page }) => {
    await page.goto('/about');
    await page.getByRole('button', { name: 'Open the menu' }).click();
    const menu = page.getByRole('dialog', { name: 'Menu' });
    await menu.getByRole('link', { name: 'Services' }).click();
    await expect(page).toHaveURL('/services');
    await expect(menu).toBeHidden();
    await expect(page.getByRole('button', { name: 'Open the menu' })).toHaveAttribute('aria-expanded', 'false');
  });
});

test.describe('back to top', () => {
  test('is hidden at the top, reachable after scrolling, and returns to the top', async ({ page }) => {
    await page.goto('/about');
    const button = page.locator('button[aria-label="Back to top"]');
    await expect(button).toHaveAttribute('aria-hidden', 'true');
    await expect(button).toHaveAttribute('tabindex', '-1');
    await expect(page.getByRole('button', { name: 'Back to top' })).toHaveCount(0);

    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    const shown = page.getByRole('button', { name: 'Back to top' });
    await expect(shown).toHaveAttribute('tabindex', '0');
    await expect(shown).toBeVisible();
    await shown.focus();
    await page.keyboard.press('Enter');
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  });
});
