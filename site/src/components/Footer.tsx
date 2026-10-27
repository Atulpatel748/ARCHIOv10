import Link from 'next/link';
import { nav, site } from '@/content/site';
import styles from './Footer.module.scss';

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
          {nav.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}
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
        <p>© {new Date().getFullYear()} {site.legalName}</p>
        <p>{site.parentLine}</p>
      </div>
    </footer>
  );
}
