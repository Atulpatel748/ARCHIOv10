import type { Metadata } from 'next';
import { pageOpenGraph } from '@/lib/pageMeta';
import Image from 'next/image';
import Link from 'next/link';
import PageHead from '@/components/PageHead';
import Roll from '@/components/Roll';
import { about, mission, team, vision, whyUs } from '@/content/site';
import styles from './about.module.scss';

const title = 'About';
const description = 'Archió is a consultancy-led interior design studio in Dubai, founded by Pooja Vijayakumar and S. Harshitha. Our vision, our mission and why clients choose us.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/about' },
  openGraph: pageOpenGraph(title, description),
};

export default function AboutPage() {
  return (
    <>
      <PageHead
        label="About us"
        title="Design that works, functionally,"
        accent="aesthetically and commercially"
      >
        <div className={styles.headMedia}>
          <Image src="/images/about/managers-office.webp" alt="Manager's office with a marble feature wall and lit shelving" width={864} height={1080} sizes="(max-width: 1023px) 100vw, 30vw" priority />
        </div>
      </PageHead>

      <section className={`section container ${styles.about}`}>
        {/* No second statement here: the heading above already says it (the home page carries the philosophy quote) */}
        <h2 className={styles.whoTitle} data-reveal>Who we are</h2>
        <div className={styles.body}>
          <p data-reveal>{about.body[0]}</p>
          <p data-reveal>{about.body.slice(1).join(' ')}</p>
        </div>
      </section>

      <section className={styles.vm}>
        <div className={`container ${styles.vmGrid}`}>
          <div className={styles.vmRow} data-reveal>
            <h2 className={styles.vmTitle}>Our vision</h2>
            <p>{vision}</p>
          </div>
          <div className={styles.vmRow} data-reveal>
            <h2 className={styles.vmTitle}>Our mission</h2>
            <p>{mission}</p>
          </div>
        </div>
      </section>

      <section className={`section container ${styles.split}`}>
        <div className={styles.media} data-reveal>
          <Image src="/images/projects/dubai-marina-residence/bar-under-stair.webp" alt="Curved bar beneath a marble staircase" width={666} height={800} sizes="(max-width: 767px) 100vw, 36vw" />
        </div>
        <div className={styles.why}>
          <h2 className={styles.whyTitle} data-reveal><span className="label">Why choose us</span> {whyUs.title}</h2>
          <p className="serif" data-reveal>{whyUs.body}</p>
        </div>
      </section>

      {/* The heading with the two founders on the same line (client's arrows pointed from the heading to the names) */}
      <section className={`container ${styles.teamSection}`}>
        <div className={styles.teamHead}>
          <p className="label" data-reveal>The founders</p>
          <h2 className={styles.teamTitle} data-reveal>Our team</h2>
        </div>
        {team.map((m) => (
          <div key={m.name} className={styles.who} data-reveal>
            <h3>{m.name}</h3>
            <p>{m.role}</p>
          </div>
        ))}
      </section>

      {/* A quiet way on for a reader who has reached the end: no promise of a reply time */}
      <section className={`container ${styles.closing}`}>
        <p className={styles.closingLine} data-reveal>If you are looking to design, refurbish or revamp your space, let&apos;s talk</p>
        <div className={styles.closingActions} data-reveal>
          <Link prefetch={false} href="/contact" className="btn btn--solid"><Roll>Contact us</Roll></Link>
        </div>
      </section>
    </>
  );
}
