import type { Metadata } from 'next';
import { pageOpenGraph } from '@/lib/pageMeta';
import Link from 'next/link';
import Image from 'next/image';
import PageHead from '@/components/PageHead';
import { approach, sectors, serviceStages, servicesIntro } from '@/content/site';
import styles from './services.module.scss';
import Roll from '@/components/Roll';

const title = 'Services';
const description = 'Consultancy-led interior design in Dubai: consultation, concept development, space planning, material and finish selection, design review and coordination support.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/services' },
  openGraph: pageOpenGraph(title, description),
};

export default function ServicesPage() {
  return (
    <>
      <PageHead label="Services" title="Expertise at every stage" accent="of a project" intro={servicesIntro} />

      {/* The three stages as one row of cards (client: too much open space in the full-screen bands) */}
      <div className={`container ${styles.route}`} aria-hidden="true">
        {serviceStages.map((stage, i) => <span key={stage.name}>{String(i + 1).padStart(2, '0')} {stage.name}</span>)}
      </div>
      <div className={`container ${styles.stages}`}>
        {serviceStages.map((stage, i) => (
          <section key={stage.name} className={styles.stage} data-reveal>
            <div className={styles.stageMedia}>
              <Image src={stage.image} alt={stage.alt} fill sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw" priority={i === 0} fetchPriority={i === 0 ? 'high' : undefined} />
              <span className={`label ${styles.stageNum}`}>Stage {String(i + 1).padStart(2, '0')}</span>
            </div>
            <div className={styles.stageBody}>
              <h2 className={styles.stageName}>{stage.name}</h2>
              <ul className={styles.offers}>
                {stage.items.map((s) => (
                  <li key={s.title}>
                    <h3>{s.title}</h3>
                    <p>{s.text}</p>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ))}
      </div>

      <div className="container">
        <div className={styles.bandsNext} data-reveal>
          <p>Not sure where to begin? Get in touch with us</p>
          <Link prefetch={false} href="/contact" className="btn btn--accent"><Roll>Contact us</Roll></Link>
        </div>
      </div>

      <section className={`container ${styles.sectors}`}>
        <p className="label" data-reveal>Sectors</p>
        <h2 className={`h2 ${styles.sectorsTitle}`} data-reveal>Spaces we design</h2>
        <ul className={styles.spaces}>
          {sectors.map((s) => (
            <li key={s.title} className={styles.space} data-reveal>
              <div className={styles.spaceMedia}>
                <Image src={s.image} alt="" fill sizes="200px" />
              </div>
              <h3 className={styles.spaceName}>{s.title}</h3>
              <p>{s.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className={`section container ${styles.process}`}>
        <div className={styles.processHead}>
          <p className="label" data-reveal>How we work</p>
          <h2 className="h2" style={{ whiteSpace: 'pre-line' }} data-reveal>{approach.title.replace('. ', '.\n')}</h2>
        </div>
        {/* The words and the way in sit beside the heading, so its right side is not left empty */}
        <div className={styles.processBody}>
          <p className="serif" data-reveal>{approach.body}</p>
          <Link prefetch={false} href="/contact" className="btn btn--accent" data-reveal><Roll>Start a project</Roll></Link>
        </div>
      </section>
    </>
  );
}
