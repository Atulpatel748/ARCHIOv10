import Link from 'next/link';
import Split from './Split';
import Roll from './Roll';
import { site } from '@/content/site';
import styles from './EndCta.module.scss';

// The invitation that closes a page, just before the footer: a full-width oxblood band with one heading, the contact page
// and WhatsApp. Used at the end of the home page and of every project page.
export default function EndCta({ action }: { action: string }) {
  return (
    <section className={`section ${styles.cta}`}>
      <div className={`container ${styles.inner}`}>
        <Split className={styles.title} text="Tell us about your space" />
        <div className={styles.actions} data-reveal>
          <Link prefetch={false} href="/contact" className="btn btn--accent"><Roll>{action}</Roll></Link>
          <a href={site.whatsappHref} className="text-link"><Roll>Message us on WhatsApp</Roll></a>
        </div>
      </div>
    </section>
  );
}
