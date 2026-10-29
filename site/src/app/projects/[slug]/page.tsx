import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Gallery from '@/components/Gallery';
import Split from '@/components/Split';
import { site } from '@/content/site';
import { getProject, projects } from '@/content/projects';
import styles from './project.module.scss';
import Roll from '@/components/Roll';

type Params = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const project = getProject((await params).slug);
  if (!project) return {};
  return {
    title: `${project.title}, ${project.category} project`,
    description: `${project.summary} ${project.location}, ${project.area}.`,
    alternates: { canonical: `/projects/${project.slug}` },
    // A page's openGraph replaces the root one whole, so the site-wide fields are repeated here.
    openGraph: { type: 'website', siteName: 'Archió Interior Design Studio', locale: 'en_AE', images: [project.cover.src] },
  };
}

export default async function ProjectPage({ params }: Params) {
  const project = getProject((await params).slug);
  if (!project) notFound();
  const next = projects[(projects.indexOf(project) + 1) % projects.length];

  return (
    <>
      {/* Hero: the main image fills the screen under a slow sweep of light; the title bottom left, the facts and a small
          arch (the Ó of the logo) holding a second view bottom right. */}
      <section className={styles.hero}>
        <Image src={project.hero.src} alt={project.hero.alt} fill priority sizes="100vw" className={styles.heroImage} />
        <div className={styles.heroShade} aria-hidden="true" />
        <div className={styles.heroLight} aria-hidden="true" />
        <div className={`container ${styles.heroGrid}`}>
          <div className={styles.heroText}>
            <p className="label label--rule">{project.category}</p>
            <Split as="h1" className={styles.heroTitle} text={project.title} />
            <p className={styles.heroPlace}>{project.location}</p>
          </div>
          <div className={styles.heroSide}>
            <dl className={styles.facts}>
              <div><dt>Category</dt><dd>{project.category}</dd></div>
              <div><dt>Area</dt><dd>{project.area}</dd></div>
            </dl>
          </div>
        </div>
      </section>

      {/* The idea: the summary as a heading, the story in two columns */}
      <section className={`section container ${styles.idea}`}>
        <p className="label label--rule" data-reveal>The idea</p>
        <Split className={styles.ideaTitle} text={project.summary} />
        <div className={styles.ideaCols}>
          {project.description.map((p) => <p key={p} className="serif" data-reveal>{p}</p>)}
        </div>
        <div className={styles.ideaActions} data-reveal>
          <Link prefetch={false} href="/contact" className="btn btn--solid"><Roll>Start a project</Roll></Link>
          <a href={site.whatsappHref} className="text-link"><Roll>Message us on WhatsApp</Roll></a>
        </div>
      </section>


      {/* The rooms; each image opens in the full-screen viewer */}
      <section className="section container" aria-label={`${project.title}, room by room`}>
        <Gallery images={project.gallery} title={project.title} />
      </section>

      {/* A conversation, then the next project */}
      <section className={`section container ${styles.end}`}>
        <div className={styles.endCta}>
          <Split className={styles.endTitle} text="Tell us about the space." />
          <div className={styles.endActions} data-reveal>
            <Link prefetch={false} href="/contact" className="btn btn--solid"><Roll>Start a project</Roll></Link>
            <a href={site.whatsappHref} className="text-link"><Roll>Message us on WhatsApp</Roll></a>
          </div>
        </div>
        <div className={styles.endNext}>
          <Link prefetch={false} href={`/projects/${next.slug}`} className={styles.next} data-cursor="View" data-reveal>
            <span className="label label--rule">Next project</span>
            <span className={styles.nextTitle}>{next.title}</span>
            <span className={styles.nextPlace}>{next.category}, {next.location}</span>
            <span className={styles.nextPhoto}>
              <Image src={next.cover.src} alt="" fill sizes="(max-width: 1023px) 100vw, 45vw" />
            </span>
          </Link>
        </div>
      </section>
    </>
  );
}
