'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { nav, site } from '@/content/site';
import styles from './Header.module.scss';

// After Wood & Weave: logo left; a contact link and a round menu button right; a full-screen menu on every screen size.
export default function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = document.getElementById('top-sentinel');
    if (!sentinel) return;
    const io = new IntersectionObserver(([entry]) => setScrolled(!entry.isIntersecting));
    io.observe(sentinel);
    return () => io.disconnect();
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
      <header className={`${styles.header} ${scrolled && !open ? styles.solid : ''} ${open ? styles.onMenu : ''}`}>
        <Link href="/" className={styles.brand} aria-label="Archió, home">
          <span className={`logo logo--lockup ${styles.logo}`} aria-hidden="true" />
        </Link>
        <div className={styles.right}>
          <Link href="/contact" className={styles.enquire}>Start a project</Link>
          <button
            ref={toggleRef}
            type="button"
            className={`${styles.toggle} ${open ? styles.toggleOpen : ''}`}
            aria-expanded={open}
            aria-controls="site-menu"
            aria-label={open ? 'Close the menu' : 'Open the menu'}
            onClick={() => setOpen((o) => !o)}
          >
            <span /><span />
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
          <Link href="/contact" className="btn btn--light">Start a project</Link>
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
