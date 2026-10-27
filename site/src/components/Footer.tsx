import Link from 'next/link';
import { contactCopy, nav, site } from '@/content/site';
import Split from './Split';
import styles from './Footer.module.scss';
import Roll from '@/components/Roll';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.cta}`}>
        <Split className="display" text={"Let's build something"} accent="purposeful." />
        <div className={styles.ctaSide} data-reveal>
          <p>{contactCopy.body}</p>
          <Link href="/contact" className="btn btn--light"><Roll>Start a project</Roll></Link>
        </div>
      </div>

      <div className={`container ${styles.grid}`}>
        <div className={styles.brand}>
          <span className={`logo logo--lockup ${styles.logo}`} role="img" aria-label="Archió" />
          <p>{site.descriptor}<br />{site.city}</p>
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
        <p>© {new Date().getFullYear()} {site.legalLine}</p>
        <p>All project images are design visualisations.</p>
      </div>
    </footer>
  );
}
