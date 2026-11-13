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
        accent="aesthetically and commercially."
        intro="Archió is a consultancy-led interior design studio in Dubai, founded by Pooja Vijayakumar and S. Harshitha."
      />

      <section className={`section container ${styles.about}`}>
        {/* No second statement here: the heading above already says it (the home page carries the philosophy quote) */}
        <h2 className="label" data-reveal>Who we are</h2>
        <div className={styles.body}>
          {about.body.map((p) => <p key={p} data-reveal>{p}</p>)}
        </div>
      </section>

      <section className={`section ${styles.vm}`}>
        <div className={`container ${styles.vmGrid}`}>
          <div data-reveal>
            <h2 className="h2">Our vision</h2>
            <p className="serif">{vision}</p>
          </div>
          <div data-reveal>
            <h2 className="h2">Our mission</h2>
            <p className="serif">{mission}</p>
          </div>
        </div>
      </section>

      <section className={`section container ${styles.split}`}>
        <div className={styles.media} data-reveal>
          <Image src="/images/projects/dubai-marina-residence/bar-under-stair.webp" alt="Curved bar beneath a marble staircase" width={666} height={800} sizes="(max-width: 767px) 100vw, 40vw" />
        </div>
        <div className={styles.why}>
          <h2 className="h2" data-reveal><span className="label">Why choose us</span> {whyUs.title}</h2>
          <ul>
            {whyUs.points.map((p) => <li key={p} data-reveal>{p}</li>)}
          </ul>
        </div>
      </section>

      <section className={`section container ${styles.teamSection}`}>
        <div className={styles.teamHead}>
          <p className="label label--rule" data-reveal>The founders</p>
          <h2 className={styles.teamTitle} data-reveal>Our team</h2>
        </div>
        <ul className={styles.team}>
          {team.map((m) => (
            <li key={m.name} data-reveal>
              <div className={styles.who}>
                <h3>{m.name}</h3>
                <p>{m.role}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* A quiet way on for a reader who has reached the end: no promise of a reply time */}
      <section className={`section container ${styles.closing}`}>
        <p className={styles.closingLine} data-reveal>If you would like to talk through a space, start with our projects or get in touch.</p>
        <div className={styles.closingActions} data-reveal>
          <Link prefetch={false} href="/contact" className="btn btn--solid"><Roll>Contact us</Roll></Link>
          <Link prefetch={false} href="/projects" className="text-link"><Roll>See our projects</Roll></Link>
        </div>
      </section>
    </>
  );
}
