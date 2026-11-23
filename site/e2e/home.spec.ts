import { test, expect } from './fixtures';

const hero = (page: import('@playwright/test').Page) => page.getByRole('region', { name: 'Featured projects' });

test.describe('hero slider, reduced motion', () => {
  test('slide buttons change the active slide; no autoplay so no pause button', async ({ page }) => {
    await page.goto('/');
    const dots = hero(page).getByRole('button', { name: /^Show slide \d of 3/ });
    await expect(dots).toHaveCount(3);
    await expect(dots.nth(0)).toHaveAttribute('aria-current', 'true');
    await expect(hero(page).getByRole('button', { name: /slideshow/ })).toHaveCount(0);

    for (const i of [1, 2, 0]) {
      // A change takes 0.7 s and clicks during it are ignored, so retry the click until it lands.
      await expect(async () => {
        await dots.nth(i).click();
        await expect(dots.nth(i)).toHaveAttribute('aria-current', 'true', { timeout: 1000 });
      }).toPass();
      const title = (await dots.nth(i).getAttribute('aria-label'))!.split(': ')[1];
      await expect(hero(page).getByRole('link', { name: `View project : ${title}` })).toBeVisible();
      for (const j of [0, 1, 2].filter((n) => n !== i)) await expect(dots.nth(j)).not.toHaveAttribute('aria-current');
    }
  });
});

test('a slide button works from the keyboard', async ({ page }) => {
  await page.goto('/');
  const dots = hero(page).getByRole('button', { name: /^Show slide \d of 3/ });
  await dots.nth(0).focus();
  await page.keyboard.press('Tab');
  await expect(dots.nth(1)).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(dots.nth(1)).toHaveAttribute('aria-current', 'true');
  await expect(dots.nth(0)).not.toHaveAttribute('aria-current');
});

test.describe('hero slider, normal motion', () => {
  // Phone width: the hero keeps the plain crossfade there and never loads WebGL (ADR-005).
  test.use({ reducedMotion: 'no-preference', viewport: { width: 390, height: 844 } });

  test('has a pause button (WCAG 2.2.2, ADR-011); the tracks sit in a centred row above the caption', async ({ page }) => {
    await page.goto('/');
    await expect(hero(page).getByRole('button', { name: 'Pause slideshow' })).toBeVisible();
    const dots = hero(page).getByRole('button', { name: /^Show slide \d of 3/ });
    const first = (await dots.nth(0).boundingBox())!;
    const last = (await dots.nth(2).boundingBox())!;
    expect(Math.abs((first.x + last.x + last.width) / 2 - 390 / 2)).toBeLessThan(2);
    const link = (await hero(page).getByRole('link', { name: /^View project/ }).boundingBox())!;
    expect(link.y).toBeGreaterThan(first.y + first.height - 1);
  });
});

test.describe('pausing the hero slideshow', () => {
  test.use({ reducedMotion: 'no-preference', viewport: { width: 390, height: 844 } });

  test('pause stops the slides for good and play starts them again', async ({ page }) => {
    test.setTimeout(60_000); // the fake clock runs every animation frame it skips, which is slow on a busy machine
    await page.clock.install();
    await page.goto('/');
    const dots = hero(page).getByRole('button', { name: /^Show slide \d of 3/ });
    // The button is in the server HTML, so a click can land before the page script is ready: click until it turns into Play.
    await expect(async () => {
      await hero(page).getByRole('button', { name: 'Pause slideshow' }).click({ timeout: 1000 });
      await expect(hero(page).getByRole('button', { name: 'Play slideshow' })).toBeVisible({ timeout: 500 });
    }).toPass();
    const leaveHero = () => page.getByRole('banner').getByRole('link', { name: /contact us/i }).hover(); // hovering the hero would also pause it
    await leaveHero();
    // The clock keeps running until here, so on a slow machine a slide may already have changed: compare with the one shown now.
    const shown = () => dots.evaluateAll((all) => all.findIndex((d) => d.getAttribute('aria-current') === 'true'));
    const atPause = await shown();
    await page.clock.runFor(9_000); // past one 8 s autoplay step
    expect(await shown()).toBe(atPause);
    await hero(page).getByRole('button', { name: 'Play slideshow' }).click();
    await leaveHero();
    await page.clock.runFor(9_000);
    await expect(dots.nth((atPause + 1) % 3)).toHaveAttribute('aria-current', 'true');
  });
});

test.describe('hero bar on a desktop', () => {
  test.use({ reducedMotion: 'no-preference', viewport: { width: 1280, height: 800 } });

  test('place on the left, slide tracks centred, View project on the right', async ({ page }) => {
    await page.goto('/');
    await expect(hero(page).getByRole('button', { name: 'Pause slideshow' })).toBeVisible();
    const dots = hero(page).getByRole('button', { name: /^Show slide \d of 3/ });
    const first = (await dots.nth(0).boundingBox())!;
    const last = (await dots.nth(2).boundingBox())!;
    expect(Math.abs((first.x + last.x + last.width) / 2 - 1280 / 2)).toBeLessThan(2);
    const link = (await hero(page).getByRole('link', { name: /^View project/ }).boundingBox())!;
    expect(link.x).toBeGreaterThan(last.x + last.width);
    expect(1280 - (link.x + link.width)).toBeLessThan(100); // against the right margin
  });
});

test.describe('home with full motion', () => {
  test.use({ reducedMotion: 'no-preference' });

  test('renders its h1 with no console errors, and no loading screen covers it (ADR-012)', async ({ page, consoleErrors }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('[data-preloader]')).toHaveCount(0);
    await expect(page.locator('#main')).not.toHaveAttribute('inert');
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toBeVisible();
    await page.waitForLoadState('load');
    expect(consoleErrors).toEqual([]);
  });

  test('the logo and links over the hero photo are beige from the first paint', async ({ page }) => {
    // Record the header colour on every frame from the first paint, so even a brief switch to oxblood is caught.
    await page.addInitScript(() => {
      const seen = new Set<string>();
      (window as unknown as { headerColours: Set<string> }).headerColours = seen;
      const tick = () => { const h = document.querySelector('header'); if (h) seen.add(getComputedStyle(h).color); requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000); // and the checks that follow the first paint
    const colours = await page.evaluate(() => [...(window as unknown as { headerColours: Set<string> }).headerColours]);
    expect(colours).toEqual(['rgb(218, 207, 186)']); // the brand beige: the client asked for no white
  });

  test('the hero states the proposition and leads to the contact page', async ({ page }) => {
    await page.goto('/');
    await expect(hero(page).getByText("We don't just design spaces")).toBeVisible();
    await hero(page).getByRole('link', { name: 'Start a conversation' }).click();
    await page.waitForURL('**/contact');
  });
});

test.describe('only one hero wordmark at a time', () => {
  const headerLogo = (page: import('@playwright/test').Page) => page.getByRole('banner').locator('a[href="/"] .logo');

  test.describe('before the page script runs', () => {
    test.use({ javaScriptEnabled: false });

    test('the hero shows its own wordmark and the header copy is hidden', async ({ page }) => {
      await page.goto('/');
      await expect(page.locator('[data-hero-mark]')).toBeVisible();
      await expect(headerLogo(page)).toBeHidden();
    });
  });

  test.describe('normal motion, once the script has placed the header logo', () => {
    test.use({ reducedMotion: 'no-preference' });

    test('the header logo takes over and the hero copy hides', async ({ page }) => {
      await page.goto('/');
      await expect(page.locator('html')).toHaveAttribute('data-hero-brand', '');
      await expect(headerLogo(page)).toBeVisible();
      await expect(page.locator('[data-hero-mark]')).toBeHidden();
    });
  });

  test('reduced motion keeps the hero wordmark and hides the header copy over the hero', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-hero-brand', '');
    await expect(page.locator('[data-hero-mark]')).toBeVisible();
    await expect(headerLogo(page)).toBeHidden();
  });
});

test.describe('back button, with motion', () => {
  test.use({ reducedMotion: 'no-preference' });

  // Pinned sections only get their full height once scripts have run, so the browser alone restored the scroll far too high.
  test('going back from a project returns to the same place on the home page', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2500); // smooth scroll and reveals load when the browser is idle
    const top = await page.evaluate(() => (document.querySelector('[class*="factsCard"]')?.getBoundingClientRect().top ?? 3000) + scrollY - 200);
    for (let i = 1; i <= 12; i++) { await page.evaluate((y) => scrollTo(0, y), (top * i) / 12); await page.waitForTimeout(80); }
    await page.waitForTimeout(1200);
    const before = await page.evaluate(() => Math.round(scrollY));
    expect(before).toBeGreaterThan(2000);
    await page.locator('[class*="factsCard"] a[href^="/projects/"]').first().click();
    await page.waitForURL('**/projects/**');
    await page.goBack();
    await page.waitForURL((url) => url.pathname === '/');
    // The browser may put the scroll back first and the page corrects it a moment later: wait for the right place, then check it stays.
    const off = () => page.evaluate((b) => Math.abs(Math.round(scrollY) - b), before);
    await expect.poll(off, { timeout: 5000 }).toBeLessThan(60);
    await page.waitForTimeout(700);
    expect(await off()).toBeLessThan(60);
  });
});
