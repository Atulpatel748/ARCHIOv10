'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { nav, site } from '@/content/site';
import styles from './Header.module.scss';
import Roll from '@/components/Roll';

// After Wood & Weave, on every screen size: no bar, just the logo left and the "Let's talk" pill and a round menu button
// right, with the links in a full-screen menu. Only the logo slides away as you scroll down and returns as you scroll up;
// the pill and the menu button always stay. The logo's colour follows whatever is behind it. On the home page the
// hero's wordmark replaces the logo until you scroll.
export default function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [dark, setDark] = useState(true); // is the page behind the logo dark?
  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = document.getElementById('top-sentinel');
    if (!sentinel) return;
    const io = new IntersectionObserver(([entry]) => setScrolled(!entry.isIntersecting));
    io.observe(sentinel);
    return () => io.disconnect();
  }, []);

  // Colour: look at what sits behind the logo (a photo or canvas counts as dark, otherwise the first solid background).
  useEffect(() => {
    let queued = false;
    const check = () => {
      queued = false;
      const y = (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 80) / 2;
      let theme = 'light';
      for (const el of document.elementsFromPoint(40, y)) {
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

  // Hide the logo while scrolling down (past the first screen's worth), show it again on any scroll up.
  useEffect(() => {
    let last = scrollY;
    const onScroll = () => {
      const d = scrollY - last;
      if (Math.abs(d) < 6) return;
      setHidden(scrollY > 160 && d > 0);
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
      <div id="top-sentinel" className={styles.sentinel} aria-hidden="true" />
      <header
        className={`${styles.header} ${dark ? styles.dark : ''} ${open ? styles.onMenu : ''} ${pathname === '/' && !scrolled && !open ? styles.heroTop : ''} ${hidden && !open ? styles.hidden : ''}`}
        onFocusCapture={() => setHidden(false)}
      >
        <Link href="/" className={styles.brand} aria-label="Archió, home">
          <span className={`logo logo--lockup ${styles.logo}`} aria-hidden="true" />
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
