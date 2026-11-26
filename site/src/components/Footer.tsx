import Link from 'next/link';
import { nav, site } from '@/content/site';
import styles from './Footer.module.scss';
import { icons } from './ContactIcons';

export default function Footer() {
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
        <div className={`${styles.col} ${styles.contact}`}>
          <p className="label">Contact</p>
          {/* The icon says which is which on screen; the hidden word says it to screen readers */}
          <a href={site.whatsappHref}>{icons.whatsapp}<span className="visually-hidden">WhatsApp </span>{site.phone}</a>
          <a href={`mailto:${site.email}`}>{icons.mail}<span className="visually-hidden">Email </span>{site.email}</a>
          <a href={site.instagramHref}>{icons.instagram}<span className="visually-hidden">Instagram </span>{site.instagram}</a>
        </div>
      </div>

      <div className={`container ${styles.bottom}`}>
        <p>© {new Date().getFullYear()} <span translate="no">{site.legalName}</span></p>
        <p>{site.parentLine}</p>
        <Link prefetch={false} href="/privacy">Privacy notice</Link>
      </div>
    </footer>
  );
}
