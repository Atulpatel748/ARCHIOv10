import type { Metadata } from 'next';
import { pageOpenGraph } from '@/lib/pageMeta';
import Image from 'next/image';
import PageHead from '@/components/PageHead';
import { about, mission, philosophy, team, vision, whyUs } from '@/content/site';
import styles from './about.module.scss';

const title = 'About';
const description = 'Archió is a consultancy-led interior design studio in Dubai, founded by Pooja Vijayakumar and S. Harshitha. Our vision, mission and philosophy.';

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
        <p className={`h2 ${styles.lead}`} data-reveal>{about.lead}</p>
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
          <p className="label" data-reveal>Why choose us</p>
          <h2 className="h2" data-reveal>{whyUs.title}</h2>
          <ul>
            {whyUs.points.map((p) => <li key={p} data-reveal>{p}</li>)}
          </ul>
        </div>
      </section>

      <section className={`section ${styles.philosophy}`}>
        <div className="container">
          <p className="label" data-reveal>Our philosophy</p>
          <blockquote data-reveal>
            <p className="display">{philosophy.quote}</p>
            <p className="serif">{philosophy.body}</p>
          </blockquote>
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
              <div className={styles.arch}>
                <Image src={m.image} alt={`Portrait of ${m.name}`} width={479} height={720} sizes="(max-width: 767px) 50vw, 30vw" />
              </div>
              <div className={styles.who}>
                <h3>{m.name}</h3>
                <p>{m.role}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
