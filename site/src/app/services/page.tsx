import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import PageHero from '@/components/PageHero';
import { approach, sectors, services, servicesIntro } from '@/content/site';
import styles from './services.module.scss';

export const metadata: Metadata = {
  title: 'Services',
  description: 'Consultancy-based interior design in Dubai: design consultation, concept development, space planning, material selection, design review and project coordination support.',
  alternates: { canonical: '/services' },
};

export default function ServicesPage() {
  return (
    <>
      <PageHero
        label="Services"
        title="Expertise at every stage"
        accent="of a project."
        intro={servicesIntro}
        image={{ src: '/images/projects/jlt-office/boardroom.png', alt: 'Boardroom with a white stone table and cream leather chairs, design visualisation' }}
      />

      <section className="section container">
        <ol className={styles.list}>
          {services.map((s, i) => (
            <li key={s.title} data-reveal>
              <span className={styles.num}>{String(i + 1).padStart(2, '0')}</span>
              <h2 className="h3">{s.title}</h2>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className={`section ${styles.sectors}`}>
        <div className="container">
          <h2 className="h2" data-reveal>Spaces we design</h2>
          <ul className={styles.sectorGrid}>
            {sectors.map((s) => (
              <li key={s.title} data-reveal>
                <div className={styles.sectorMedia}>
                  <Image src={s.image} alt="" fill sizes="(max-width: 767px) 100vw, 46vw" />
                </div>
                <h3 className="h3">{s.title}</h3>
                <p>{s.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={`section ${styles.process}`}>
        <div className={`container ${styles.processInner}`}>
          <div>
            <p className="label" data-reveal>How we work</p>
            <h2 className="h2" data-reveal>{approach.title}</h2>
            <p className="serif" data-reveal>{approach.body}</p>
          </div>
          <ol className={styles.steps}>
            {approach.points.map((p, i) => (
              <li key={p} data-reveal><span className={styles.num}>{String(i + 1).padStart(2, '0')}</span>{p}</li>
            ))}
          </ol>
        </div>
        <div className={`container ${styles.processCta}`} data-reveal>
          <Link href="/contact" className="btn btn--light">Start a project</Link>
        </div>
      </section>
    </>
  );
}
