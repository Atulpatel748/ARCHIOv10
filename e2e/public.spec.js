import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';

test.describe('public site', () => {
  test('preloader keeps its existing branding over the architectural background', async ({ page }) => {
    await page.route('**/*.js', (route) => route.abort());
    const imageResponse = page.waitForResponse((response) =>
      new URL(response.url()).pathname === '/images/preloader-architecture.webp');
    await page.goto('/');

    const preloader = page.locator('#app-preloader');
    await expect(preloader).toBeVisible();
    const style = await preloader.evaluate((element) => {
      const computed = getComputedStyle(element);
      return {
        backgroundImage: computed.backgroundImage,
        backgroundSize: computed.backgroundSize,
        backgroundPosition: computed.backgroundPosition,
        transitionProperty: computed.transitionProperty,
        transitionDuration: computed.transitionDuration,
      };
    });
    expect(style.backgroundImage).toContain('/images/preloader-architecture.webp');
    expect(style.backgroundSize).toBe('cover');
    expect(style.backgroundPosition).toBe((page.viewportSize()?.width ?? 0) <= 640 ? '100% 50%' : '50% 50%');
    expect(style.transitionProperty).toContain('opacity');
    expect(style.transitionProperty).not.toContain('transform');
    expect(style.transitionDuration.split(',')[0].trim()).toBe('0.3s');
    await expect(preloader.locator('.app-preloader__mark')).toBeAttached();
    await expect(preloader.locator('.app-preloader__word')).toBeAttached();
    await expect(preloader.locator('.app-preloader__line')).toBeAttached();
    expect((await imageResponse).status()).toBe(200);
  });

  test('without JavaScript the page shows how to reach the studio instead of an endless loading screen', async ({ browser, baseURL }) => {
    const context = await browser.newContext({ baseURL, javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto('/about');
    await expect(page.locator('#app-preloader')).toBeHidden();
    await expect(page.getByText(/needs JavaScript to run/)).toBeVisible();
    await expect(page.getByRole('link', { name: /@/ })).toHaveAttribute('href', /^mailto:/);
    await context.close();
  });

  test('the loading screen plays once per tab: not again on reload, but again in a new tab', async ({ page, context }) => {
    // Without the app bundle the screen stays exactly as first painted; only public/preloader-gate.js decides it.
    await context.route('**/assets/*.js', (route) => route.abort());
    const shown = (tab) => tab.locator('#app-preloader').evaluate((curtain) => getComputedStyle(curtain).display !== 'none');

    await page.goto('/contact');
    expect(await shown(page)).toBe(true);
    await page.reload();
    expect(await shown(page)).toBe(false);
    await page.goto('/'); // another visit in the same tab
    expect(await shown(page)).toBe(false);

    const second = await context.newPage();
    await second.goto('/contact');
    expect(await shown(second)).toBe(true);
  });

  test('home page renders the studio identity and featured work', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Archió/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveAccessibleName(/Archió/);
    await expect(page.getByRole('region', { name: 'ARCHIÓ' })).toBeVisible(); // the hero
    await expect(page.getByRole('heading', { name: 'Selected projects' })).toBeVisible();
    await expect(page.locator('.project-row').first()).toBeVisible();
    expect(await page.locator('.project-row').count()).toBeGreaterThanOrEqual(3);
  });

  test('navigates from home to a project and back to the list', async ({ page }) => {
    await page.goto('/projects');
    await expect(page.locator('.project-grid a').first()).toBeVisible();
    const first = page.locator('.project-grid a').first();
    const title = (await first.locator('h3').textContent()).trim();
    await first.click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveAccessibleName(new RegExp(title, 'i'));
    await expect(page.getByText('Location')).toBeVisible();
    await expect(page.getByRole('link', { name: 'All projects' })).toHaveCount(0);
    await page.goBack();
    await expect(page).toHaveURL(/\/projects$/);
  });

  test('filters and searches projects, reflecting state in the URL', async ({ page }) => {
    await page.goto('/projects');
    await expect(page.getByLabel('Search projects')).toHaveAttribute('placeholder', /\u2026$/); // ends with an ellipsis, as a hint
    await page.getByRole('button', { name: 'Landscape' }).click();
    await expect(page).toHaveURL(/category=landscape/);
    await expect(page.getByRole('link', { name: /arabian ranches 2/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /dubai marina residence/i })).toHaveCount(0);

    await page.getByRole('button', { name: 'All' }).click();
    await page.getByLabel('Search projects').fill('marina');
    await expect(page).toHaveURL(/q=marina/);
    await expect(page.getByRole('link', { name: /dubai marina residence/i })).toBeVisible();
    await expect(page.locator('.project-grid a')).toHaveCount(1);

    await page.getByLabel('Search projects').fill('zzzzzz');
    await expect(page.getByRole('heading', { name: /no projects match/i })).toBeVisible();
    await page.getByRole('button', { name: /clear filters/i }).click();
    await expect(page.locator('.project-grid a').first()).toBeVisible();
  });

  test('a page opened fresh starts at the top, not where the previous page in the tab was scrolled; a reload keeps its place', async ({ page }) => {
    await page.goto('/about');
    await page.evaluate(() => window.scrollTo(0, 1200));
    await page.goto('/services');
    await page.waitForLoadState('networkidle');
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
    await page.evaluate(() => window.scrollTo(0, 400));
    await page.reload();
    await expect.poll(() => page.evaluate(() => Math.round(window.scrollY))).toBe(400);
  });

  test('unknown pages and unknown projects show a helpful not-found page', async ({ page }) => {
    const titleTop = () => page.getByRole('heading', { name: 'Not found' }).evaluate((el) => el.getBoundingClientRect().top);
    await page.goto('/no-such-page');
    await expect(page.getByRole('heading', { name: 'Not found' })).toBeVisible();
    const pageTitleTop = await titleTop();
    await page.goto('/projects/not-a-real-project');
    await expect(page.getByRole('heading', { name: 'Not found' })).toBeVisible();
    // A project address normally opens on a photo behind the header; without one the title sits where it does on any
    // other page instead of sliding up under the header.
    expect(Math.abs((await titleTop()) - pageTitleTop)).toBeLessThan(1);
    await expect(page).toHaveTitle('Project not found | Archió');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
  });

  test('home page reads the h1 first, keeps one call-to-action label and uses a small type scale', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toHaveAttribute('translate', 'no'); // the brand name is not translated

    // The h1 (the big wordmark) carries the studio descriptor shown above it, so a screen reader hears it once.
    await expect(page.getByRole('heading', { level: 1 })).toHaveAccessibleName(/interior design studio/i);

    // Exactly one call-to-action button on the first screen: "Let’s talk" in the header (a round paper-plane icon on
    // phones, the labelled pill with its arrow from 640px up).
    const width = page.viewportSize()?.width ?? 0;
    const firstScreen = await page.evaluate(() => [...document.querySelectorAll('a')]
      .filter((a) => ['Let’s talk'].includes(a.textContent.trim()))
      .filter((a) => { const r = a.getBoundingClientRect(); return r.width > 0 && r.top >= 0 && r.bottom <= innerHeight; }).length);
    expect(firstScreen).toBe(1);
    const header = page.locator('.site-header');
    await expect(header.getByRole('link', { name: 'Let’s talk' })).toBeVisible();
    await expect(header.getByRole('link', { name: /sign in/i })).toHaveCount(0); // there are no accounts
    // The button sits to the right of the centred logo without touching it.
    const [logo, button] = await Promise.all([header.locator('.brand').boundingBox(), header.getByRole('link', { name: 'Let’s talk' }).boundingBox()]);
    expect(button.x).toBeGreaterThanOrEqual(logo.x + logo.width);
    expect(button.x + button.width).toBeLessThanOrEqual(width);

    // No stray label sneaks in: every "Let’s talk" (the header and the closing band) leads to the contact page.
    await expect(page.getByRole('link', { name: /^send a request$/i })).toHaveCount(0);
    const links = page.getByRole('link', { name: 'Let’s talk' });
    for (const href of await links.evaluateAll((els) => els.map((a) => a.getAttribute('href')))) expect(href).toBe('/contact');
    expect(await links.count()).toBeGreaterThanOrEqual(2); // the header and the closing band

    // Few distinct font sizes keep the page cohesive. Counted once the loading screen has gone (it waits for the hero
    // photo, up to 4s, then lifts away): its own lettering is not part of the page.
    await expect(page.locator('#app-preloader')).toHaveCount(0, { timeout: 10_000 });
    const sizes = await page.evaluate(() => {
      const found = new Set();
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) {
        const node = walker.currentNode;
        if (!node.textContent.trim()) continue;
        const style = getComputedStyle(node.parentElement);
        if (style.display !== 'none' && style.visibility !== 'hidden') found.add(Math.round(parseFloat(style.fontSize)));
      }
      return found.size;
    });
    expect(sizes).toBeLessThanOrEqual(10);
  });

  test('"We design" names each category as a link to its projects, with one link to them all', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'We design', exact: true })).toBeVisible();
    const rows = page.locator('.do-row');
    await expect(rows).toHaveText(['Residential', 'Commercial', 'Landscape'], { ignoreCase: true });
    await expect(page.locator('.do-type').getByRole('link', { name: 'View all projects' })).toHaveAttribute('href', '/projects');
    await rows.nth(2).click();
    await expect(page).toHaveURL(/category=landscape/);
  });

  test('"We design" shows its finished screen when a keyboard user tabs into the names, wherever the scroll is', async ({ page }) => {
    await page.goto('/');
    const first = page.locator('.do-type__list li').first();
    await first.getByRole('link').focus();
    await expect(first).toHaveCSS('opacity', '1');
    await expect(page.locator('.do-type').getByRole('link', { name: 'View all projects' })).toHaveCSS('opacity', '1');
  });

  test('home page makes no API request, and downloads the first hero photo exactly once', async ({ page }) => {
    const apiRequests = [];
    const photoRequests = [];
    page.on('request', (request) => {
      const { pathname } = new URL(request.url());
      if (pathname.startsWith('/api/')) apiRequests.push(pathname);
      if (/\/images\/.+\.(avif|jpe?g)$/.test(pathname)) photoRequests.push(pathname);
    });
    await page.goto('/');
    await expect(page.locator('.hero-portal canvas')).toBeAttached();
    await page.waitForLoadState('networkidle');

    // The portfolio is built into the site; only the contact form talks to /api.
    expect(apiRequests).toEqual([]);

    // The preload that public/preloader-gate.js adds names the first photo the hero gallery shows. The gallery reads the AVIF twin of
    // each photo, so that first photo is downloaded once for the preload, the gallery and the project cards together.
    const preloaded = await page.locator('link[rel="preload"][as="image"][type="image/avif"]').getAttribute('href');
    expect(photoRequests.filter((path) => path === preloaded)).toHaveLength(1);
  });

  test('the site has no accounts: former sign-in and admin addresses are simply not found, and nothing is stored in the browser', async ({ page, context }) => {
    for (const path of ['/login', '/register', '/forgot-password', '/dashboard', '/profile', '/admin', '/admin/projects']) {
      await page.goto(path);
      await expect(page.getByRole('heading', { name: 'Not found' }), path).toBeVisible();
    }
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    expect(await context.cookies()).toEqual([]);
    // For this tab only, the router remembers scroll positions for the Back button and the site notes that the
    // loading screen has played (both named in the cookie policy); nothing else is stored.
    expect(await page.evaluate(() => localStorage.length)).toBe(0);
    const stored = await page.evaluate(() => Object.keys(sessionStorage));
    expect(stored.filter((key) => !['react-router-scroll-positions', 'archio-preloader-seen'].includes(key))).toEqual([]);
  });

  test('home hero: the big wordmark travels up and docks into the header, where the header logo waits until it lands', async ({ page }) => {
    await page.goto('/');
    const header = page.locator('.site-header');
    const hero = page.locator('.hero-portal');
    const headerBrand = header.locator('.brand');
    const mark = hero.locator('.hero-portal__mark');
    const base = hero.locator('.hero-portal__base');
    const centre = (box) => ({ x: box.x + box.width / 2, y: box.y + box.height / 2, width: box.width });
    // How far the big logo is from sitting exactly on the header logo (position and size).
    const gap = async () => {
      const [m, h] = (await Promise.all([mark.boundingBox(), headerBrand.boundingBox()])).map(centre);
      return Math.hypot(m.x - h.x, m.y - h.y, m.width - h.width);
    };
    await expect(hero.locator('canvas')).toBeAttached();
    await expect(header).toHaveClass(/site-header--clear/);
    await expect(headerBrand).toHaveCSS('opacity', '0'); // the header's own logo waits for the big one
    await expect(header.getByRole('link', { name: 'Projects' }).or(header.getByRole('button', { name: /menu/i })).first()).toBeVisible(); // nav stays
    if (page.viewportSize().width >= 640) await expect(header.getByRole('link', { name: /let.s talk/i })).toBeVisible();
    expect(await hero.evaluate((el) => Math.round(el.getBoundingClientRect().top))).toBe(0); // the photo starts at the very top
    expect(await header.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe('rgba(0, 0, 0, 0)');
    await expect(mark.locator('img')).toHaveCount(0); // the wordmark alone, without the submark ...
    await expect(mark.locator('.wordmark')).toBeVisible(); // ... in the middle
    await expect(hero.locator('.hero-portal__place')).toBeVisible(); // the featured project's place, bottom left
    await expect(page.locator('#app-preloader')).toHaveCount(0, { timeout: 10_000 });
    // The photos change by themselves, so they can be stopped (WCAG 2.2.2). Clicked once the loading screen has gone,
    // since a covered button makes Playwright scroll the page while it retries.
    await hero.getByRole('button', { name: 'Pause slideshow' }).click();
    await expect(hero.getByRole('button', { name: 'Play slideshow' })).toBeVisible();
    const descriptor = hero.locator('.hero-portal__descriptor');
    expect(await descriptor.evaluate((el) => getComputedStyle(el).opacity)).toBe('1');
    await page.evaluate(() => window.scrollTo(0, 120));
    await expect.poll(() => descriptor.evaluate((el) => Number(getComputedStyle(el).opacity))).toBeLessThan(1);
    expect(await descriptor.evaluate((el) => new DOMMatrixReadOnly(getComputedStyle(el).transform).m42)).toBeLessThan(0);
    await expect(header).toHaveClass(/site-header--clear/);
    await page.evaluate(() => window.scrollTo(0, 300));
    await expect.poll(() => page.locator('#home-featured').evaluate((el) => el.classList.contains('reveal'))).toBe(false);
    await page.evaluate(() => window.scrollTo(0, 0));
    const [nextTop, headerHeight] = await Promise.all([
      page.locator('#home-featured').evaluate((el) => el.getBoundingClientRect().top + window.scrollY),
      header.evaluate((el) => el.getBoundingClientRect().height),
    ]);
    const transitionEnd = nextTop - headerHeight;
    const initialMark = await mark.boundingBox();
    const initialGap = await gap();

    // Part-way up: smaller and higher, not there yet, and still no header.
    await page.evaluate((end) => window.scrollTo(0, end * 0.4), transitionEnd);
    await expect.poll(() => mark.evaluate((el) => new DOMMatrixReadOnly(getComputedStyle(el).transform).a)).toBeLessThan(1);
    expect(await mark.evaluate((el) => el.getBoundingClientRect().top)).toBeLessThan(initialMark.y);
    expect(await gap()).toBeGreaterThan(1);
    expect(await gap()).toBeLessThan(initialGap);
    await expect(headerBrand).toHaveCSS('opacity', '0');

    // Touching the header: it sits exactly on the header logo (the same wordmark), and the header's own logo takes over.
    await page.evaluate((end) => window.scrollTo(0, end * 0.85), transitionEnd);
    await expect.poll(gap).toBeLessThan(1);
    await expect(headerBrand).toHaveCSS('opacity', '1');
    await expect(header).toHaveClass(/site-header--clear/);

    // Once the section after the hero (Selected projects) reaches the header the header turns solid and the big logo has handed over.
    await page.evaluate((end) => window.scrollTo(0, end), transitionEnd);
    await expect.poll(() => mark.evaluate((el) => Number(getComputedStyle(el).opacity))).toBeLessThan(0.000001);
    await expect(header).not.toHaveClass(/site-header--clear/);
    await expect(headerBrand.locator('.wordmark')).toBeVisible();
    // The bottom row (place, View project, pause) has faded out before it could sit on the header links.
    await expect(base).toHaveCSS('opacity', '0');

    // Back at the top the header goes away again and the big logo returns to the middle.
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(headerBrand).toHaveCSS('opacity', '0');
    await expect.poll(() => mark.evaluate((el) => getComputedStyle(el).opacity)).toBe('1');
    expect(await mark.boundingBox()).toEqual(initialMark);
    await expect(base).toHaveCSS('opacity', '1');
    await expect(header).toHaveClass(/site-header--clear/);
  });

  test('project hero: header turns solid when its photo scrolls clear of it', async ({ page }) => {
    await page.goto('/projects/dubai-marina-residence');
    const header = page.locator('.site-header');
    const hero = page.locator('.project-hero-wrap');
    const title = page.locator('.project-hero__title');
    await expect(hero).toBeVisible();
    await expect(page.getByRole('link', { name: 'All projects' })).toHaveCount(0);
    await expect(header).toHaveClass(/site-header--overlay/);
    await expect(header).toHaveClass(/site-header--clear/);
    expect(await header.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe('rgba(0, 0, 0, 0)');
    await expect(title).toHaveCSS('opacity', '1');

    const fadePoints = await page.evaluate(() => {
      const titleBounds = document.querySelector('.project-hero__title').getBoundingClientRect();
      const headerBottom = document.querySelector('.site-header').getBoundingClientRect().bottom;
      return {
        start: Math.round(window.scrollY + titleBounds.top - headerBottom - titleBounds.height),
        end: Math.round(window.scrollY + titleBounds.top - headerBottom),
      };
    });
    await page.evaluate((scrollY) => window.scrollTo(0, scrollY), Math.round((fadePoints.start + fadePoints.end) / 2));
    await expect.poll(() => title.evaluate((el) => Number(getComputedStyle(el).opacity))).toBeGreaterThan(0.35);
    await expect.poll(() => title.evaluate((el) => Number(getComputedStyle(el).opacity))).toBeLessThan(0.65);
    await page.evaluate((scrollY) => window.scrollTo(0, scrollY), fadePoints.end + 1);
    await expect(title).toHaveCSS('opacity', '0');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.evaluate((scrollY) => window.scrollTo(0, scrollY), Math.round((fadePoints.start + fadePoints.end) / 2));
    await expect(title).toHaveCSS('opacity', '1');

    const [heroBottom, headerHeight] = await Promise.all([
      hero.evaluate((el) => el.getBoundingClientRect().bottom + window.scrollY),
      header.evaluate((el) => el.getBoundingClientRect().height),
    ]);
    await page.evaluate(({ bottom, height }) => window.scrollTo(0, bottom - height - 1), { bottom: heroBottom, height: headerHeight });
    await expect(header).toHaveClass(/site-header--clear/);
    await page.evaluate(() => window.scrollBy(0, 2));
    await expect(header).not.toHaveClass(/site-header--clear/);
    await expect(header).toHaveCSS('background-color', 'rgb(218, 207, 186)');
  });

  test('project gallery: photos use varied desktop frames and remain full-width on mobile', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/projects/dubai-marina-residence');
    const gallery = page.locator('.gallery');
    await gallery.scrollIntoViewIfNeeded();
    const frames = await gallery.locator('figure').evaluateAll((figures) =>
      figures.slice(0, 6).map((figure) => {
        const { x, y, width, bottom } = figure.getBoundingClientRect();
        return { x, y, width, bottom };
      }),
    );
    const viewportWidth = page.viewportSize()?.width ?? 0;

    if (viewportWidth >= 1024) {
      expect(frames[0].width).toBeGreaterThan(frames[1].width);
      expect(frames[2].width).toBeLessThan(frames[3].width);
      expect(frames[4].width).toBeGreaterThan(frames[5].width);
      expect(Math.abs(frames[0].y - frames[1].y)).toBeLessThan(1);
      expect(Math.abs(frames[2].y - frames[3].y)).toBeLessThan(1);
      expect(Math.abs(frames[4].y - frames[5].y)).toBeLessThan(1);
      expect(Math.abs(frames[0].bottom - frames[1].bottom)).toBeLessThan(16);
      expect(Math.abs(frames[2].bottom - frames[3].bottom)).toBeLessThan(16);
      expect(Math.abs(frames[4].bottom - frames[5].bottom)).toBeLessThan(16);
    } else {
      expect(Math.abs(frames[1].width - frames[2].width)).toBeLessThan(1);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(viewportWidth);
    }
  });

  test('header: menu on the left, logo in the centre, "Let’s talk" with an arrow on the right', async ({ page }) => {
    test.skip((page.viewportSize()?.width ?? 0) < 1024, 'the full menu shows from 1024px up');
    await page.goto('/projects');
    const header = page.locator('.site-header');
    const brand = header.locator('.brand');
    await expect(brand.locator('.wordmark')).toBeVisible();
    const [logo, nav, cta] = await Promise.all([
      brand.boundingBox(),
      header.getByRole('navigation', { name: 'Primary' }).boundingBox(),
      header.getByRole('link', { name: 'Let’s talk' }).boundingBox(),
    ]);
    expect(nav.x + nav.width).toBeLessThan(logo.x);
    expect(logo.x + logo.width).toBeLessThan(cta.x);
    await expect(header.getByRole('link', { name: 'Let’s talk' }).locator('.icon-arrow')).toBeVisible();
  });

  test('header on small screens: Menu on the left, logo centred, and Close opens in the same place', async ({ page }) => {
    const width = page.viewportSize()?.width ?? 0;
    test.skip(width >= 1024, 'the full menu shows from 1024px up');
    await page.goto('/projects');
    const header = page.locator('.site-header');
    const brand = header.locator('.brand');
    await expect(brand.locator('.wordmark')).toBeVisible();
    const toggle = header.getByRole('button', { name: 'Menu' });
    const [menu, logo] = await Promise.all([toggle.boundingBox(), header.locator('.brand').boundingBox()]);
    expect(menu.x + menu.width).toBeLessThan(logo.x);
    expect(Math.abs(logo.x + logo.width / 2 - width / 2)).toBeLessThan(2);
    await toggle.click();
    const dialog = page.locator('#mobile-menu');
    const close = await dialog.getByRole('button', { name: 'Close' }).boundingBox();
    expect(Math.abs(close.x - menu.x)).toBeLessThan(2);
    expect(Math.abs(close.y + close.height / 2 - (menu.y + menu.height / 2))).toBeLessThan(2);
  });

  test('home hero: has no slideshow control when reduced motion is enabled', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const hero = page.locator('.hero-portal');
    await expect(hero.getByRole('button', { name: /pause|play slideshow/i })).toHaveCount(0);
    await expect(page.locator('#app-preloader')).toHaveCount(0, { timeout: 10_000 });
    const descriptor = hero.locator('.hero-portal__descriptor');
    const wordmarkGroup = hero.locator('.hero-portal__mark');
    await page.evaluate(() => window.scrollTo(0, 120));
    await expect.poll(() => descriptor.evaluate((el) => getComputedStyle(el).opacity)).toBe('1');
    await expect.poll(() => wordmarkGroup.evaluate((el) => getComputedStyle(el).transform)).toBe('none');
    await expect.poll(() => wordmarkGroup.evaluate((el) => getComputedStyle(el).opacity)).toBe('1');
    await expect(page.locator('.site-header .brand')).toHaveCSS('opacity', '1'); // with no motion the header is simply there
  });

  test('photos are delivered as AVIF, and no page downloads the larger JPEG as well', async ({ page }) => {
    const photos = [];
    page.on('response', (response) => {
      const { pathname } = new URL(response.url());
      if (pathname.startsWith('/images/') && pathname !== '/images/preloader-architecture.webp') {
        photos.push({ pathname, status: response.status(), type: response.headers()['content-type'] });
      }
    });
    for (const path of ['/', '/projects', '/projects/dubai-marina-residence', '/about']) {
      await page.goto(path);
      await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
      // Scroll so lazy-loaded photos are requested too.
      for (let y = 0; y < 6000; y += 700) {
        await page.evaluate((top) => window.scrollTo(0, top), y);
        await page.waitForTimeout(60);
      }
      await page.waitForLoadState('networkidle');
      // <source> elements only pick a file; one that took up space would push neighbouring content around.
      const sourcesTakingSpace = await page.evaluate(() => [...document.querySelectorAll('picture > source')].filter((el) => getComputedStyle(el).display !== 'none').length);
      expect(sourcesTakingSpace, `<source> elements with a layout box on ${path}`).toBe(0);
    }
    expect(photos.length).toBeGreaterThan(10);
    expect(photos.filter((photo) => !photo.pathname.endsWith('.avif'))).toEqual([]);
    // A 304 ("unchanged, use your copy") has no content type of its own, so only full responses are checked.
    const fullResponses = photos.filter((photo) => photo.status === 200);
    expect(fullResponses.length).toBeGreaterThan(10);
    expect(fullResponses.filter((photo) => photo.type !== 'image/avif')).toEqual([]);
  });

  test('keyboard focus is never hidden under the sticky header', async ({ page }) => {
    await page.goto('/about');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    let stops = 0;
    for (let press = 1; press <= 60; press += 1) {
      await page.keyboard.press('Tab');
      const { atEnd, clear, element } = await page.evaluate(() => {
        const focused = document.activeElement;
        if (focused === document.body) return { atEnd: true, clear: true, element: '<body>' };
        const header = document.querySelector('.site-header').getBoundingClientRect();
        // The skip link is drawn on top of the header while focused, and the header's own controls are never under it.
        const exempt = focused.matches('.skip-link') || Boolean(focused.closest('.site-header'));
        return { atEnd: false, clear: exempt || focused.getBoundingClientRect().top >= header.bottom - 1, element: focused.outerHTML.slice(0, 80) };
      });
      if (atEnd) break; // focus has left the page: the end of the tab order
      stops += 1;
      expect(clear, `tab stop ${stops}: ${element}`).toBe(true);
    }
    expect(stops).toBeGreaterThan(10); // the whole page was walked, including the footer
  });

  test('touch and scrolling behaviour: no double-tap delay, and the menu keeps scrolling to itself', async ({ page }, info) => {
    await page.goto('/');
    expect(await page.evaluate(() => getComputedStyle(document.body).touchAction)).toBe('manipulation');
    if (info.project.name === 'mobile') {
      await page.getByRole('button', { name: /^menu/i }).click();
      const menu = page.getByRole('dialog');
      await expect(menu).toBeVisible();
      expect(await menu.evaluate((el) => getComputedStyle(el).overscrollBehaviorY)).toBe('contain');
    }
  });

  test('services page lists the six consultancy services and has no per-service pages', async ({ page }, info) => {
    await page.goto('/services');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Services');
    await expect(page.locator('.toc-row h2')).toHaveCount(6);
    await expect(page.getByRole('heading', { name: 'Space planning' })).toBeVisible();

    if (info.project.name === 'mobile') {
      const consultation = page.getByRole('button', { name: 'Interior design consultation' });
      const consultationPanel = page.getByRole('region', { name: 'Interior design consultation' });
      await consultation.click();
      await expect(consultation).toHaveAttribute('aria-expanded', 'true');
      await expect(consultationPanel.getByRole('img', { name: /double-height living room/i })).toBeVisible();
      const panelBottom = await consultationPanel.boundingBox().then((box) => box.y + box.height);
      const nextServiceTop = await page.getByRole('button', { name: 'Concept development' }).locator('xpath=ancestor::li').boundingBox().then((box) => box.y);
      expect(nextServiceTop).toBeGreaterThan(panelBottom);

      await page.getByRole('button', { name: 'Concept development' }).click();
      await expect(consultationPanel).toBeHidden();
      await expect(page.getByRole('region', { name: 'Concept development' }).getByRole('img', { name: /marble and dark stone feature wall/i })).toBeVisible();
    } else {
      // Wide screens: one sticky photo that follows the service under the pointer.
      const photos = page.locator('.services-photo img');
      await expect(photos).toHaveCount(6);
      await expect(photos.nth(0)).toHaveClass(/is-active/);
      await page.getByRole('heading', { name: 'Material & finish selection' }).hover();
      await expect(photos.nth(3)).toHaveClass(/is-active/);
      await expect(photos.nth(0)).not.toHaveClass(/is-active/);
    }
    await page.goto('/services/full-renovation');
    await expect(page.getByRole('heading', { name: 'Not found' })).toBeVisible();
  });

  test('about page introduces the team and the studio', async ({ page }) => {
    await page.goto('/about');
    await expect(page.getByRole('heading', { name: 'Our team' })).toBeVisible();
    await expect(page.getByRole('img', { name: 'Portrait of Pooja Vijayakumar' })).toBeVisible();
    await expect(page.getByText('Co-Founder, Strategy & Growth')).toBeVisible();
    // The bullet lists keep room for their markers inside the text column, not out in the page margin.
    expect(await page.locator('.about-list').first().evaluate((el) => parseFloat(getComputedStyle(el).paddingLeft))).toBeGreaterThan(0);
    await expect(page.locator('.footer-follow').getByRole('link', { name: 'Instagram' })).toBeVisible();
    await expect(page.locator('.footer-contact').getByRole('link', { name: /971 55 654 1410/ }).locator('.icon-phone')).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Legal' }).getByRole('link', { name: 'Privacy notice' })).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Legal' }).getByRole('link', { name: 'Terms of service' })).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Legal' }).getByRole('link', { name: 'Cookie policy' })).toBeVisible();
    await expect(page.locator('.footer-legal').getByText('Beracah Trading', { exact: true })).toBeVisible();
    // "Contact" is not repeated in the footer's studio column (the header and the closing band lead there).
    await expect(page.locator('.site-footer').getByRole('link', { name: 'Contact', exact: true })).toHaveCount(0);

    const [copyright, company, studio, legal] = await Promise.all(['.footer-legal p:first-child', '.footer-legal p:last-child', '.footer-grid > :nth-child(3)', '.footer-grid > :nth-child(4)']
      .map((selector) => page.locator(selector).boundingBox()));
    expect(Math.abs(studio.y - legal.y)).toBeLessThan(1); // Studio and Legal always sit side by side
    if ((page.viewportSize()?.width ?? 0) >= 900) expect(copyright.x + copyright.width / 2).toBeLessThan(company.x + company.width / 2); // copyright left, company right
    expect(studio.x).toBeLessThan(legal.x);
  });

  test('project page shows the area in both units and hides an unspecified year and style', async ({ page }) => {
    await page.goto('/projects/dubai-marina-residence');
    await expect(page.getByRole('heading', { level: 1 })).toHaveAccessibleName(/dubai marina residence/i);
    await expect(page.locator('.facts > div:first-child dd')).toHaveText('Dubai, United Arab Emirates');
    await expect(page.getByText('232 m\u00B2 (2,500 sq ft)')).toBeVisible();
    await expect(page.locator('.facts dt', { hasText: /^(Year|Style)$/ })).toHaveCount(0);
  });

  test('has no horizontal scrolling across device widths', async ({ page }, info) => {
    const widths = info.project.name === 'mobile'
      ? [320, 360, 390, 640, 768, 820, 1024, 1440, 1920]
      : [1440];
    const paths = ['/', '/projects', '/projects/dubai-marina-residence', '/services', '/about', '/contact', '/privacy', '/terms', '/cookies'];

    for (const width of widths) {
      await page.setViewportSize({ width, height: 900 });
      for (const path of paths) {
        await page.goto(path);
        await expect(page.locator('main')).toBeVisible();
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        expect(overflow, `${path} overflows at ${width}px by ${overflow}px`).toBeLessThanOrEqual(0);
      }
    }
  });

  test('the footer keeps the email address and the legal links on one line from tablet to wide screens', async ({ page }) => {
    for (const width of [900, 1024, 1180, 1279, 1280, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/privacy');
      const lines = (locator) => locator.evaluate((el) => Math.round(el.getBoundingClientRect().height / parseFloat(getComputedStyle(el).lineHeight)));
      expect(await lines(page.locator('.footer-mail')), `email at ${width}px`).toBe(1);
      for (const name of ['Privacy notice', 'Terms of service', 'Cookie policy']) {
        const link = page.getByRole('navigation', { name: 'Legal' }).getByRole('link', { name });
        expect(await link.evaluate((el) => el.getClientRects().length), `${name} at ${width}px`).toBe(1);
      }
    }
  });

  test('serves the security headers that vercel.json defines, so what is tested is what is shipped', async ({ page }) => {
    const { headers } = JSON.parse(readFileSync(new URL('../client/vercel.json', import.meta.url), 'utf8'));
    const expected = headers.find(({ source }) => source === '/(.*)').headers;
    expect(expected.length).toBeGreaterThan(0);
    const response = await page.goto('/');
    for (const { key, value } of expected) expect(response.headers()[key.toLowerCase()], key).toBe(value);
  });

  test('keyboard users can skip to content and open the mobile menu on small screens', async ({ page }, info) => {
    await page.goto('/about');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
    if (info.project.name === 'mobile') {
      await page.getByRole('button', { name: /^menu/i }).click();
      const dialog = page.getByRole('dialog');
      await expect(dialog.getByRole('link', { name: 'Projects' })).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(dialog).toBeHidden();
    }
  });
});
