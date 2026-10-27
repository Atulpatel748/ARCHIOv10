import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import HeroSlider from '@/components/HeroSlider';
import ProjectCard from '@/components/ProjectCard';
import Sequence from '@/components/Sequence';
import Split from '@/components/Split';
import { projects } from '@/content/projects';
import { about, philosophy, processSteps, services, team } from '@/content/site';
import styles from './home.module.scss';
import Roll from '@/components/Roll';

export const metadata: Metadata = { alternates: { canonical: '/' } };

const slides = projects.map((p) => ({
  src: p.cover.src, alt: p.cover.alt, title: p.title, place: p.location, href: `/projects/${p.slug}`,
}));

// Services grouped by stage (proposed grouping, owner to confirm), each with a render.
const stages = [
  { name: 'Define', items: [services[0], services[2]], image: '/images/projects/dubai-marina-residence/study-wall.png', alt: 'Study wall with timber joinery and lit shelving' },
  { name: 'Design', items: [services[1], services[3]], image: '/images/projects/dubai-marina-residence/media-wall-marble.png', alt: 'Media wall in book-matched marble framed by timber panelling' },
  { name: 'Support', items: [services[4], services[5]], image: '/images/projects/jlt-office/boardroom-screen.png', alt: 'Boardroom facing a media wall with timber joinery' },
];

export default function HomePage() {
  const [flagship, ...others] = projects;
  return (
    <>
      {/* Hero: the brand wordmark centred over the project slides */}
      <HeroSlider slides={slides}>
        <h1 className={styles.heroMark}>
          <span className="visually-hidden">Archió, interior design studio in Dubai</span>
          <span className={`logo logo--wordmark ${styles.heroLogo}`} data-hero-mark aria-hidden="true" />
          <span className={styles.heroTag} data-hero-tag aria-hidden="true">Interior design studio</span>
        </h1>
      </HeroSlider>

      {/* We do, built like YODEZEEN's: a tall section with a pinned stage. As you scroll, "We" and "Do" slide apart and fade
          while the sectors rise from below, one after another, to the middle. */}
      <Sequence className={styles.sequence}>
        <div className={styles.seqStage}>
          <h2 className="visually-hidden">We do residential, commercial and landscape design</h2>
          <div className={styles.seqTitle} aria-hidden="true">
            <span className={styles.seqStart}>We</span>
            <span className={styles.seqEnd}>Do</span>
          </div>
          <div className={styles.seqItems}>
            {['Residential', 'Commercial', 'Landscape'].map((name, i) => (
              <span key={name} className={styles.seqItem} style={{ '--i': i } as React.CSSProperties} aria-hidden="true">{name}</span>
            ))}
            <Link href="/projects" className={`text-link ${styles.seqLink}`} style={{ '--i': 3 } as React.CSSProperties}><Roll>See the work</Roll></Link>
          </div>
        </div>
      </Sequence>

      {/* Philosophy: a quiet dark statement, text only */}
      <section className={styles.philosophy}>
        <blockquote className={`container ${styles.philosophyInner}`}>
          <Split as="p" className={styles.quote} text="Good design is not about making something" accent="look expensive." />
          <p className={`serif ${styles.philosophyBody}`} data-reveal>{philosophy.body}</p>
        </blockquote>
      </section>

      {/* The position */}
      <section className={`section container ${styles.position}`}>
        <p className="label" data-reveal>Our position</p>
        <div className={styles.positionBody}>
          <Split as="p" className={styles.positionLead} text={about.body[0]} />
          <div className={styles.positionCols}>
            <p data-reveal>{about.body[1]}</p>
            <p data-reveal>{about.body[2]}</p>
          </div>
        </div>
      </section>

      {/* What we do */}
      <section className={`section ${styles.whatWeDo}`}>
        <div className="container">
          <div className={styles.headRow}>
            <p className="label" data-reveal>What we do</p>
            <Split className={styles.big} text="Consultancy at every stage," accent="from first brief to handover." />
          </div>
          <ol className={styles.stages}>
            {stages.map((s) => (
              <li key={s.name} data-reveal>
                <div className={styles.stageMedia} data-mask>
                  <Image src={s.image} alt={s.alt} fill sizes="(max-width: 767px) 100vw, 30vw" />
                </div>
                <h3 className={styles.stageName}>{s.name}</h3>
                {s.items.map((it) => (
                  <div key={it.title} className={styles.stageItem}>
                    <h4>{it.title}</h4>
                    <p>{it.text}</p>
                  </div>
                ))}
              </li>
            ))}
          </ol>
          <Link href="/services" className={`text-link ${styles.onDark}`} data-reveal><Roll>All services</Roll></Link>
        </div>
      </section>

      {/* Who you get: founders in arched frames (after Wood & Weave) */}
      <section className={`section container ${styles.founders}`}>
        <div className={styles.foundersHead}>
          <p className="label" data-reveal>Who you work with</p>
          <Split className={styles.big} text="The people behind" accent="Archió." />
          <Link href="/about" className="text-link" data-reveal><Roll>About the studio</Roll></Link>
        </div>
        <ul className={styles.foundersGrid}>
          {team.map((m) => (
            <li key={m.name} data-reveal>
              <div className={styles.arch}>
                <Image src={m.image} alt={`Portrait of ${m.name}`} width={479} height={720} sizes="(max-width: 767px) 80vw, 26vw" />
              </div>
              <h3>{m.name}</h3>
              <p>{m.role}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* The work: a flagship with a facts card, then the other projects */}
      <section className={`section ${styles.work}`}>
        <div className="container">
          <p className="label" data-reveal>The work</p>
          <Split className={styles.big} text="Three spaces," accent="designed in full." />
        </div>
        <div className={`container ${styles.flagship}`}>
          <Link href={`/projects/${flagship.slug}`} className={styles.flagshipMedia} data-cursor="View" data-mask>
            <Image src={flagship.hero.src} alt={flagship.hero.alt} fill sizes="(max-width: 1023px) 100vw, 60vw" />
          </Link>
          <div className={styles.factsCard} data-reveal>
            <h3>{flagship.title}</h3>
            <p className="serif">{flagship.summary}</p>
            <dl>
              <div><dt>Where</dt><dd>{flagship.location}</dd></div>
              <div><dt>Area</dt><dd>{flagship.area}</dd></div>
            </dl>
            <Link href={`/projects/${flagship.slug}`} className="btn btn--solid"><Roll>See the project</Roll> <span aria-hidden="true">→</span></Link>
          </div>
        </div>
        <div className={`container ${styles.others}`}>
          {others.map((p) => <ProjectCard key={p.slug} project={p} />)}
        </div>
      </section>

      {/* How it goes */}
      <section className={`section ${styles.process}`}>
        <div className="container">
          <p className="label" data-reveal>How it goes</p>
          <Split className={styles.big} text="From the first conversation" accent="to the final handover." />
          <ol className={styles.steps}>
            {processSteps.map((s, i) => (
              <li key={s.title} data-reveal>
                <span className={styles.stepNum}>{String(i + 1).padStart(2, '0')}</span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </li>
            ))}
          </ol>
          <Link href="/contact" className="btn btn--solid" data-reveal><Roll>Start a project</Roll></Link>
        </div>
      </section>
    </>
  );
}
