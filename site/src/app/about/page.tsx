import type { Metadata } from 'next';
import { pageOpenGraph } from '@/lib/pageMeta';
import Image from 'next/image';
import Link from 'next/link';
import Roll from '@/components/Roll';
import Split from '@/components/Split';
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

// The About page as approved at Gate 2 on 23 Nov 2026 (option A, "Editorial index"): one strict grid, each section's
// numbered label in a left column and its words in a right column, so everything lines up. Names only, no portraits.
export default function AboutPage() {
  return (
    <>
      <section className={`container ${styles.hero}`}>
        <p className="label" data-reveal>About us</p>
        <Split as="h1" className={styles.title} text="Design that works, functionally," accent="aesthetically and commercially" />
        <div className={styles.heroImg} data-reveal>
          <Image src="/images/about/living-room-wide.webp" alt="Double-height living room with a marble feature wall and a pale sectional sofa" width={2121} height={1414} sizes="(max-width: 1680px) 92vw, 1500px" priority />
        </div>
      </section>

      <div className="container">
        <section className={styles.row}>
          <p className={`label ${styles.idx}`} data-reveal>Who we are</p>
          <div>
            <p className={styles.lead} data-reveal>{about.body[0]}</p>
            <p className={styles.copy} data-reveal>{about.body.slice(1).join(' ')}</p>
          </div>
        </section>

        <section className={styles.row}>
          <p className={`label ${styles.idx}`} data-reveal>Vision &amp; mission</p>
          <div className={styles.vm}>
            <div data-reveal><h2 className={styles.h3}>Our vision</h2><p>{vision}</p></div>
            <div data-reveal><h2 className={styles.h3}>Our mission</h2><p>{mission}</p></div>
          </div>
        </section>

        <section className={styles.row}>
          <p className={`label ${styles.idx}`} data-reveal>Why choose us</p>
          <div className={styles.why}>
            <div className={styles.whyImg} data-reveal>
              <Image src="/images/projects/dubai-marina-residence/bar-under-stair.webp" alt="Curved bar beneath a marble staircase" width={666} height={800} sizes="(max-width: 900px) 92vw, 30vw" />
            </div>
            <div>
              <h2 className={styles.h3} data-reveal>{whyUs.title}</h2>
              <p data-reveal>{whyUs.body}</p>
            </div>
          </div>
        </section>

        <section className={styles.row}>
          <p className={`label ${styles.idx}`} data-reveal>The founders</p>
          <div>
            <h2 className={styles.teamTitle} data-reveal>Our team</h2>
            <div className={styles.team}>
              {team.map((m) => (
                <div key={m.name} className={styles.person} data-reveal>
                  <h3>{m.name}</h3>
                  <p>{m.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* A quiet way on for a reader who has reached the end: no promise of a reply time */}
        <section className={styles.close}>
          <p data-reveal>If you are looking to design, refurbish or revamp your space, let&apos;s talk.</p>
          <Link prefetch={false} href="/contact" className="btn btn--solid" data-reveal><Roll>Contact us</Roll></Link>
        </section>
      </div>
    </>
  );
}
