'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { nav, site } from '@/content/site';
import styles from './Header.module.scss';
import Roll from '@/components/Roll';

// No bar: the links (Projects, Services, About) on the left, the logo centred, and the "Let's talk" pill on the right, plus a
// round menu button on phones and tablets (where the links and a left-aligned logo move into the full-screen menu and header).
// On the home page the big hero wordmark scrolls up and becomes the header logo. Elsewhere the logo slides away as you scroll
// down and returns as you scroll up. The logo and links change colour to suit whatever is behind them.
export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [dark, setDark] = useState(true); // is the page behind the logo dark?
  const toggleRef = useRef<HTMLButtonElement>(null);
  const brandRef = useRef<HTMLAnchorElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Colour: look at what sits behind the logo (a photo or canvas counts as dark, otherwise the first solid background).
  useEffect(() => {
    let queued = false;
    const check = () => {
      queued = false;
      const y = (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 80) / 2;
      let theme = 'light';
      for (const el of document.elementsFromPoint(innerWidth >= 1024 ? innerWidth / 2 : 40, y)) {
        if (el.closest('header, #site-menu')) continue;
        if (el instanceof HTMLImageElement || el instanceof HTMLCanvasElement || el instanceof HTMLVideoElement) { theme = 'dark'; break; }
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
    ask();
    const settle = setTimeout(ask, 700); // after the new page's images and layout have settled
    return () => { removeEventListener('scroll', ask); removeEventListener('resize', ask); clearTimeout(settle); };
  }, [pathname]);

  // Home: the hero wordmark (a hidden placeholder in the page) scrolls up and shrinks into the header logo.
  // --p runs from 0 (the logo sits where the placeholder is, at full size) to 1 (the header position).
  useEffect(() => {
    const el = brandRef.current;
    const mark = pathname === '/' ? document.querySelector<HTMLElement>('[data-hero-mark]') : null;
    if (!el || !mark) return;
    const logo = el.firstElementChild as HTMLElement;
    const range = () => innerHeight * 0.5;
    const measure = () => {
      const r = mark.getBoundingClientRect();
      el.style.setProperty('--y0', `${r.top + r.height / 2 + scrollY}px`);
      el.style.setProperty('--s0', String(r.width / logo.offsetWidth));
    };
    const update = () => el.style.setProperty('--p', String(Math.min(1, scrollY / range())));
    const onResize = () => { measure(); update(); };
    measure();
    update();
    addEventListener('scroll', update, { passive: true });
    addEventListener('resize', onResize);
    return () => {
      removeEventListener('scroll', update);
      removeEventListener('resize', onResize);
      ['--p', '--y0', '--s0'].forEach((v) => el.style.removeProperty(v));
    };
  }, [pathname]);

  // Hide the logo while scrolling down (past the first screen's worth), show it again on any scroll up.
  useEffect(() => {
    let last = scrollY;
    const onScroll = () => {
      const d = scrollY - last;
      if (Math.abs(d) < 6) return;
      setHidden(location.pathname !== '/' && scrollY > 160 && d > 0);
      last = scrollY;
    };
    addEventListener('scroll', onScroll, { passive: true });
    return () => removeEventListener('scroll', onScroll);
  }, []);

  // Close the menu on navigation (a render-time state adjustment rather than an effect).
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) { setLastPath(pathname); setOpen(false); }

  useEffect(() => {
    const main = document.getElementById('main');
    const footer = document.querySelector('footer');
    [main, footer].forEach((el) => { if (el) el.inert = open; });
    document.documentElement.style.overflow = open ? 'hidden' : '';
    const lenis = (window as unknown as { lenis?: { stop(): void; start(): void } }).lenis;
    if (open) lenis?.stop(); else lenis?.start();
    if (open) menuRef.current?.querySelector('a')?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && open) { setOpen(false); toggleRef.current?.focus(); } };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`));
  const links = [{ href: '/', label: 'Home' }, ...nav];

  return (
    <>
      <header
        className={`${styles.header} ${dark ? styles.dark : ''} ${open ? styles.onMenu : ''} ${pathname === '/' ? styles.onHome : ''} ${hidden && !open ? styles.hidden : ''}`}
        onFocusCapture={() => setHidden(false)}
      >
        <nav aria-label="Main" className={styles.nav}>
          {nav.slice(0, 3).map((item) => (
            <Link key={item.href} href={item.href} aria-current={isActive(item.href) ? 'page' : undefined}><Roll>{item.label}</Roll></Link>
          ))}
        </nav>
        <Link ref={brandRef} href="/" className={styles.brand} aria-label="Archió, home">
          <span className={`logo logo--wordmark ${styles.logo}`} aria-hidden="true" />
        </Link>
        <div className={styles.right}>
          <Link href="/contact" className={styles.talk}><Roll>{"Let's talk"}</Roll> <span aria-hidden="true">+</span></Link>
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
      </header>

      <div ref={menuRef} id="site-menu" className={`${styles.menu} ${open ? styles.menuOpen : ''}`} role="dialog" aria-modal="true" aria-label="Menu" aria-hidden={!open} inert={!open}>
        <nav aria-label="Main" className={styles.menuNav}>
          {links.map((item) => (
            <Link key={item.href} href={item.href} aria-current={isActive(item.href) ? 'page' : undefined}>{item.label}</Link>
          ))}
        </nav>
        <div className={styles.menuSide}>
          <p className={styles.menuLead}>Tell us about the <span className="accent">space.</span></p>
          <Link href="/contact" className="btn btn--light"><Roll>Start a project</Roll></Link>
          <div className={styles.menuContact}>
            <a href={site.whatsappHref}>WhatsApp {site.phone}</a>
            <a href={site.phoneHref}>{site.phone}</a>
            <a href={`mailto:${site.email}`}>{site.email}</a>
          </div>
        </div>
      </div>
    </>
  );
}
