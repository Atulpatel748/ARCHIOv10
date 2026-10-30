import type { Metadata } from 'next';
import { pageOpenGraph } from '@/lib/pageMeta';
import Link from 'next/link';
import Image from 'next/image';
import PageHead from '@/components/PageHead';
import { approach, sectors, serviceStages, servicesIntro } from '@/content/site';
import styles from './services.module.scss';
import Roll from '@/components/Roll';

const title = 'Services';
const description = 'Consultancy-based interior design in Dubai: design consultation, concept development, space planning, material selection, design review and project coordination support.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/services' },
  openGraph: pageOpenGraph(title, description),
};

export default function ServicesPage() {
  return (
    <>
      <PageHead label="Services" title="Expertise at every stage" accent="of a project." intro={servicesIntro} />

      {/* Three bands, one per stage: a render to the edge of the screen, the stage name and its two services */}
      <div className={styles.bands}>
        {serviceStages.map((stage, i) => (
          <section key={stage.name} className={styles.band}>
            <div className={styles.bandMedia}>
              <Image src={stage.image} alt={stage.alt} fill sizes="(max-width: 1023px) 100vw, 50vw" priority={i === 0} fetchPriority={i === 0 ? 'high' : undefined} />
            </div>
            <div className={styles.bandBody}>
              <h2 className={styles.bandName} data-reveal>{stage.name}</h2>
              <ul className={styles.offers}>
                {stage.items.map((s) => (
                  <li key={s.title} data-reveal>
                    <h3>{s.title}</h3>
                    <p>{s.text}</p>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ))}
      </div>

      <section className={`container ${styles.sectors}`}>
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
          <h2 className="h2" data-reveal>{approach.title}</h2>
          <p className="serif" data-reveal>{approach.body}</p>
          <Link prefetch={false} href="/contact" className="btn btn--solid" data-reveal><Roll>Start a project</Roll></Link>
        </div>
        <ul className={styles.points}>
          {approach.points.map((p) => (
            <li key={p} data-reveal>{p}</li>
          ))}
        </ul>
      </section>
    </>
  );
}
