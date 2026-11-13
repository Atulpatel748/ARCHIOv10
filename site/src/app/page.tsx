import type { Metadata } from 'next';
import { pageOpenGraph } from '@/lib/pageMeta';
import Image from 'next/image';
import Link from 'next/link';
import HeroSlider from '@/components/HeroSlider';
import ProjectCard from '@/components/ProjectCard';
import RoomJourney from '@/components/RoomJourney';
import Sequence from '@/components/Sequence';
import StageList from '@/components/StageList';
import Split from '@/components/Split';
import { projects, visualisation } from '@/content/projects';
import { approach, philosophy, processSteps, serviceStages as stages } from '@/content/site';
import styles from './home.module.scss';
import Roll from '@/components/Roll';

// The root layout's title and description, repeated for the openGraph link preview.
const title = 'Archió | Interior Design Studio in Dubai';
const description = 'Archió is a consultancy-led interior design studio in Dubai for residential, commercial, mixed-use and landscape projects.';

export const metadata: Metadata = {
  alternates: { canonical: '/' },
  openGraph: pageOpenGraph(title, description),
};

const slides = projects.map((p) => ({
  src: p.cover.src, poster: `/images/hero/${p.slug}.webp`, alt: p.cover.alt, title: p.title, place: p.location, href: `/projects/${p.slug}`,
}));

export default function HomePage() {
  const [flagship, ...others] = projects;
  return (
    <>
      {/* Hero: the brand wordmark centred over the project slides */}
      <HeroSlider slides={slides}>
        <h1 className={styles.heroMark}>
          <span className="visually-hidden"><span translate="no">Archió</span>, interior design studio in Dubai</span>
          <span className={`logo logo--wordmark ${styles.heroLogo}`} data-hero-mark aria-hidden="true" />
          <span className={styles.heroTag} data-hero-tag aria-hidden="true">Interior design studio</span>
        </h1>
      </HeroSlider>

      {/* We do, built like YODEZEEN's: a tall section with a pinned stage. As you scroll, "We" and "Do" slide apart and fade
          while the sectors rise from below, one after another, to the middle. */}
      <Sequence className={styles.sequence}>
        <div className={styles.seqStage}>
          <h2 className="visually-hidden">We design residential, commercial and landscape spaces</h2>
          <div className={styles.seqTitle} aria-hidden="true">
            <span className={styles.seqStart}>We</span>
            <span className={styles.seqEnd}>Design</span>
          </div>
          <div className={styles.seqItems}>
            {['Residential', 'Commercial', 'Landscape'].map((name, i) => (
              <span key={name} className={styles.seqItem} style={{ '--i': i } as React.CSSProperties} aria-hidden="true">{name}</span>
            ))}
            <Link prefetch={false} href="/projects" className={`text-link ${styles.seqLink}`} style={{ '--i': 3 } as React.CSSProperties}><Roll>See the work</Roll></Link>
          </div>
        </div>
      </Sequence>

      {/* Philosophy: a quiet dark statement, text only */}
      <section className={styles.philosophy}>
        <blockquote className={`container ${styles.philosophyInner}`}>
          <Split as="p" className={styles.quote} text="Spaces made" accent="to be lived in." />
          <p className={`serif ${styles.philosophyBody}`} data-reveal>{philosophy.body}</p>
        </blockquote>
      </section>

      {/* The position */}
      <section className={`section container ${styles.position}`}>
        <p className="label" data-reveal>Our positioning</p>
        <Split as="p" className={styles.positionLead} text={approach.title} />
      </section>

      {/* What we do: an index of the three stages, after YODEZEEN's service list */}
      <section className={`section ${styles.whatWeDo}`}>
        <div className="container">
          <div className={styles.headRow}>
            <p className="label" data-reveal>What we do</p>
            <Split className={styles.big} text="Consultancy at every stage," accent="from first brief to site coordination." />
          </div>
          <StageList stages={stages} />
        </div>
      </section>


      {/* The work: a flagship with a facts card, then the other projects */}
      <section className={`section ${styles.work}`}>
        <div className="container">
          <h2 className="label" data-reveal>The work</h2>
        </div>
        <div className={`container ${styles.flagship}`}>
          <Link prefetch={false} href={`/projects/${flagship.slug}`} className={styles.flagshipMedia} data-cursor="View" data-mask>
            <Image src={flagship.hero.src} alt={flagship.hero.alt} fill sizes="(max-width: 1023px) 100vw, 60vw" />
          </Link>
          <div className={styles.factsCard} data-reveal>
            <p className="label">{visualisation}</p>
            <h3>{flagship.title}</h3>
            <p className="serif">{flagship.summary}</p>
            <dl>
              <div><dt>Where</dt><dd>{flagship.location}</dd></div>
              <div><dt>Area</dt><dd>{flagship.area}</dd></div>
            </dl>
            <Link prefetch={false} href={`/projects/${flagship.slug}`} className="btn btn--solid"><Roll>See the project</Roll> <span aria-hidden="true">→</span></Link>
          </div>
        </div>
        <div className={`container ${styles.others}`}>
          {others.map((p) => <ProjectCard key={p.slug} project={p} />)}
        </div>
      </section>

      {/* How it goes: a 3D room builds itself and turns once while the four steps scroll past */}
      <RoomJourney steps={processSteps} />
    </>
  );
}
