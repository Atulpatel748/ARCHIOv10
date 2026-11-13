'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { nav, site } from '@/content/site';
import styles from './Header.module.scss';
import Roll from '@/components/Roll';

// No bar. The logo is always centred. Desktop: the links (Projects, Services, About) on the left and the "Let's talk" pill on
// the right. Phones, tablets and laptops under 1024px: the round menu button on the left (the links live in the full-screen
// menu) and the pill on the right. On the home page the big hero wordmark scrolls up and becomes the header logo. Elsewhere the logo slides away as you scroll
// down and returns as you scroll up. The logo and links change colour to suit whatever is behind them.
export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false); // past the top (on home, past the hero): phones get a bar behind the buttons
  const [dark, setDark] = useState(true); // is the page behind the logo dark?
  const toggleRef = useRef<HTMLButtonElement>(null);
  const brandRef = useRef<HTMLAnchorElement>(null);
  const scrolledRef = useRef(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Colour: look at what sits behind the logo (a photo or canvas counts as dark, otherwise the first solid background).
  // Sample the logo's real centre: on the home page it starts big and mid-screen, far below the header strip.
  useEffect(() => {
    let queued = false;
    const check = () => {
      queued = false;
      // While the first-visit preloader (or the menu) is up the page is inert, and inert elements are invisible to
      // elementsFromPoint, so the check would see only the paper background and wrongly pick oxblood. Keep the current colour.
      if (document.getElementById('main')?.inert) return;
      const box = brandRef.current?.getBoundingClientRect();
      const onScreen = box && box.height > 0 && box.top + box.height / 2 > 0;
      const x = onScreen ? box.left + box.width / 2 : innerWidth / 2;
      const y = onScreen ? box.top + box.height / 2 : (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 80) / 2;
      let theme = 'light';
      for (const el of document.elementsFromPoint(x, y)) {
        if (el.closest('header, #site-menu, [data-preloader]')) continue;
        if (el instanceof HTMLImageElement || el instanceof HTMLCanvasElement || el instanceof HTMLVideoElement) {
          // With the phone bar showing, the bar takes the section's own colour: a photo passing under it must not flip it back and forth
          if (scrolledRef.current && matchMedia('(max-width: 767px)').matches) continue;
          theme = 'dark'; break;
        }
        const c = (getComputedStyle(el).backgroundColor.match(/[0-9.]+/g) ?? []).map(Number);
        if (c.length < 3 || (c.length > 3 && c[3] < 0.5)) continue;
        theme = 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2] < 128 ? 'dark' : 'light';
        break;
      }
      setDark(theme === 'dark');
    };
    const ask = () => { if (!queued) { queued = true; setTimeout(check, 60); } };
    addEventListener('scroll', ask, { passive: true });
    addEventListener('resize', ask);
    addEventListener('preloader:done', ask); // the check skipped while the preloader was up
    ask();
    const settle = setTimeout(ask, 700); // after the new page's images and layout have settled
    return () => { removeEventListener('scroll', ask); removeEventListener('resize', ask); removeEventListener('preloader:done', ask); clearTimeout(settle); };
  }, [pathname]);

  // Home: the hero wordmark docks into the header, the way archio-v10's does. The logo stays fixed on screen and glides in a
  // straight line from the placeholder's spot to its header spot, growing smaller, over the first 80% of the hero's height of
  // scrolling (--p runs 0 to 1). The "Interior design studio" line moves up by the same distance and fades out as it goes.
  // Measurements come from layout offsets, which transforms (the hero recedes as you scroll) cannot skew.
  useEffect(() => {
    const el = brandRef.current;
    const mark = pathname === '/' ? document.querySelector<HTMLElement>('[data-hero-mark]') : null;
    const hero = mark?.closest<HTMLElement>('[data-recede]');
    const tag = document.querySelector<HTMLElement>('[data-hero-tag]');
    if (!el || !mark || !hero) return;
    const logo = el.firstElementChild as HTMLElement;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let dy = 0;
    let distance = 1;
    let dead = false;
    const measure = () => {
      let y0 = mark.offsetHeight / 2;
      // Stop at the hero itself: it is sticky, so its own offsetTop grows as you scroll. It sits at the top of the page.
      for (let n: HTMLElement | null = mark; n && n !== hero; n = n.offsetParent as HTMLElement | null) y0 += n.offsetTop;
      const headerH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 80;
      dy = headerH / 2 - y0;
      distance = Math.max(1, hero.offsetHeight - headerH);
      el.style.setProperty('--y0', `${y0}px`);
      el.style.setProperty('--s0', String(mark.offsetWidth / logo.offsetWidth));
    };
    const update = () => {
      if (reduced.matches) {
        // No motion: the hero keeps its big wordmark and line; the header logo simply appears once the hero is mostly scrolled past.
        el.style.setProperty('--p', '1');
        el.toggleAttribute('data-over-hero', scrollY < distance * 0.5);
        el.inert = scrollY < distance * 0.5;
        tag?.style.removeProperty('transform');
        tag?.style.removeProperty('opacity');
        return;
      }
      const t = Math.min(1, Math.max(0, scrollY / distance));
      const r = Math.min(t / 0.8, 1);
      el.style.setProperty('--p', String(r));
      el.inert = r < 1; // the big hero wordmark is not a link; it becomes one once it has docked into the header
      if (tag) {
        tag.style.transform = `translate3d(0, ${dy * r}px, 0)`;
        tag.style.opacity = String(1 - r);
      }
    };
    const onResize = () => { measure(); update(); };
    measure();
    update();
    // Placed: the header logo now takes over from the hero's own wordmark (see .heroLogo and .brand in the styles)
    document.documentElement.setAttribute('data-hero-brand', '');
    const ro = new ResizeObserver(onResize);
    ro.observe(hero);
    document.fonts?.ready.then(() => { if (!dead) onResize(); }); // fonts can settle after you have left the page
    addEventListener('scroll', update, { passive: true });
    addEventListener('resize', onResize);
    reduced.addEventListener('change', onResize);
    return () => {
      dead = true;
      ro.disconnect();
      removeEventListener('scroll', update);
      removeEventListener('resize', onResize);
      reduced.removeEventListener('change', onResize);
      ['--p', '--y0', '--s0'].forEach((v) => el.style.removeProperty(v));
      document.documentElement.removeAttribute('data-hero-brand');
      el.removeAttribute('data-over-hero');
      el.inert = false;
      tag?.style.removeProperty('transform');
      tag?.style.removeProperty('opacity');
    };
  }, [pathname]);

  // Hide the logo and links as soon as you scroll down, and keep them hidden on scroll-up until you are back at the very top. On the
  // home page the logo is still docking over the first screen, so they hide after it and return once the hero is back in view.
  useEffect(() => {
    let last = scrollY;
    const onScroll = () => {
      const home = location.pathname === '/';
      const hideAt = home ? innerHeight : 24;
      const showAt = home ? innerHeight * 0.9 : 1;
      scrolledRef.current = scrollY > showAt;
      setScrolled(scrolledRef.current);
      if (scrollY <= showAt) { setHidden(false); last = scrollY; return; } // back at the top: always show
      const d = scrollY - last;
      if (Math.abs(d) < 6) return;
      setHidden((h) => (d > 0 ? scrollY > hideAt : h));
      last = scrollY;
    };
    addEventListener('scroll', onScroll, { passive: true });
    return () => removeEventListener('scroll', onScroll);
  }, []);

  // Close the menu on navigation (a render-time state adjustment rather than an effect).
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) { setLastPath(pathname); setOpen(false); }

  const menuWasOpen = useRef(false);
  useEffect(() => {
    const main = document.getElementById('main');
    const footer = document.querySelector('footer');
    const skip = document.querySelector<HTMLElement>('.skip-link');
    // Only touch inert when the menu opens or has just closed: on mount, resetting it would undo the preloader's inert.
    if (open || menuWasOpen.current) [main, footer, skip].forEach((el) => { if (el) el.inert = open; });
    menuWasOpen.current = open;
    document.documentElement.style.overflow = open ? 'hidden' : '';
    const lenis = (window as unknown as { lenis?: { stop(): void; start(): void } }).lenis;
    if (open) lenis?.stop(); else lenis?.start();
    if (open) menuRef.current?.querySelector('a')?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && open) { setOpen(false); toggleRef.current?.focus(); } };
    document.addEventListener('keydown', onKey);
    // The menu button exists only under 1024px: a menu left open when the window widens (a tablet turned) would have no way out
    const wide = matchMedia('(min-width: 1024px)');
    const onWide = () => { if (wide.matches) setOpen(false); };
    if (open) wide.addEventListener('change', onWide);
    return () => { document.removeEventListener('keydown', onKey); wide.removeEventListener('change', onWide); };
  }, [open]);

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`));
  const links = [{ href: '/', label: 'Home' }, ...nav];

  return (
    <>
      <header
        className={`${styles.header} ${dark ? styles.dark : ''} ${open ? styles.onMenu : ''} ${pathname === '/' ? styles.onHome : ''} ${hidden && !open ? styles.hidden : ''} ${scrolled ? styles.scrolled : ''}`}
        onFocusCapture={() => setHidden(false)}
      >
        <div className={styles.menuSlot}>
            <button
              ref={toggleRef}
              type="button"
              className={`${styles.toggle} ${open ? styles.toggleOpen : ''}`}
              aria-expanded={open}
              aria-controls="site-menu"
              aria-label={open ? 'Close the menu' : 'Open the menu'}
              onClick={() => setOpen((o) => !o)}
            >
              <span className={styles.bars}><span /><span /></span>
            </button>
        </div>
        <nav aria-label="Main" className={styles.nav} inert={open}>
          {nav.slice(0, 3).map((item) => (
            <Link prefetch={false} key={item.href} href={item.href} aria-current={isActive(item.href) ? 'page' : undefined}><Roll>{item.label}</Roll></Link>
          ))}
        </nav>
        <Link prefetch={false} ref={brandRef} href="/" className={styles.brand} aria-label="Archió, home" inert={open}>
          <span className={`logo logo--wordmark ${styles.logo}`} aria-hidden="true" />
        </Link>
        <div className={styles.right} inert={open}>
          <Link prefetch={false} href="/contact" className={styles.talk}><Roll>{"Let's talk"}</Roll> <span aria-hidden="true">+</span></Link>
        </div>
      </header>

      <div ref={menuRef} id="site-menu" className={`${styles.menu} ${open ? styles.menuOpen : ''}`} role="dialog" aria-label="Menu" aria-hidden={!open} inert={!open}>
        <nav aria-label="Menu links" className={styles.menuNav}>
          {links.map((item) => (
            <Link prefetch={false} key={item.href} href={item.href} aria-current={isActive(item.href) ? 'page' : undefined}>{item.label}</Link>
          ))}
        </nav>
        <div className={styles.menuSide}>
          <p className={styles.menuLead}>Tell us about the <span className="accent">space.</span></p>
          <Link prefetch={false} href="/contact" className="btn btn--light"><Roll>Start a project</Roll></Link>
          <div className={styles.menuContact}>
            <a href={site.whatsappHref}>WhatsApp {site.phone}</a>
            <a href={site.phoneHref}>Call {site.phone}</a>
            <a href={`mailto:${site.email}`}>{site.email}</a>
          </div>
        </div>
      </div>
    </>
  );
}
