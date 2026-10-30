'use client';

import Link from 'next/link';
import { useSyncExternalStore } from 'react';
import { nav, site } from '@/content/site';
import styles from './Footer.module.scss';

// The page is prerendered, so the build year is only the first paint; the visitor's clock takes over after hydration.
const built = new Date().getFullYear();
const noop = () => () => {};

export default function Footer() {
  const year = useSyncExternalStore(noop, () => new Date().getFullYear(), () => built);
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.grid}`}>
        <div className={styles.brand}>
          <span className={`logo logo--wordmark ${styles.logo}`} role="img" aria-label="Archió" />
          <p>{site.footerLine}</p>
        </div>
        <nav aria-label="Footer" className={styles.col}>
          <p className="label">Explore</p>
          {nav.map((item) => <Link prefetch={false} key={item.href} href={item.href}>{item.label}</Link>)}
        </nav>
        <div className={styles.col}>
          <p className="label">Contact</p>
          <a href={site.whatsappHref}>WhatsApp {site.phone}</a>
          <a href={site.phoneHref}>Call {site.phone}</a>
          <a href={`mailto:${site.email}`}>{site.email}</a>
          <a href={site.instagramHref}>Instagram {site.instagram}</a>
        </div>
      </div>

      <div className={`container ${styles.bottom}`}>
        <p>© {year} <span translate="no">{site.legalName}</span></p>
        <p>{site.parentLine}</p>
        <Link prefetch={false} href="/privacy">Privacy notice</Link>
      </div>
    </footer>
  );
}
