import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Gallery from '@/components/Gallery';
import ProjectHero from '@/components/ProjectHero';
import Split from '@/components/Split';
import { site } from '@/content/site';
import { getProject, projects, visualisation } from '@/content/projects';
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
  const title = `${project.title}, ${project.category} project`;
  const description = `${project.summary} ${project.location}, ${project.area}.`;
  return {
    title,
    description,
    alternates: { canonical: `/projects/${project.slug}` },
    // A page's openGraph replaces the root one whole, so the site-wide fields are repeated here.
    openGraph: { type: 'website', siteName: 'Archió Interior Design Studio', locale: 'en_AE', images: [project.cover.src], title, description },
  };
}

export default async function ProjectPage({ params }: Params) {
  const project = getProject((await params).slug);
  if (!project) notFound();
  const next = projects[(projects.indexOf(project) + 1) % projects.length];

  return (
    <>
      {/* Hero: the main photo full screen with the name on it; a calm entrance, nothing moves on scroll. */}
      <ProjectHero photo={project.hero}>
        <p className="label">{project.category}</p>
        <Split as="h1" text={project.title} />
        <p>{project.location}</p>
        <p className="label">{visualisation}</p>
      </ProjectHero>

      {/* Facts beside the story */}
      <section className={`section container ${styles.info}`}>
        <dl className={styles.facts} data-reveal>
          <div><dt>Where</dt><dd>{project.location}</dd></div>
          <div><dt>Category</dt><dd>{project.category}</dd></div>
          <div><dt>Area</dt><dd>{project.area}</dd></div>
          <div><dt>Images</dt><dd>{visualisation}</dd></div>
        </dl>
        <div className={styles.story}>
          <Split className={styles.storyLead} text={project.summary} />
          {project.description.map((p) => <p key={p} data-reveal>{p}</p>)}
          <div className={styles.storyActions} data-reveal>
            <Link prefetch={false} href="/contact" className="btn btn--solid"><Roll>Start a project</Roll></Link>
            <a href={site.whatsappHref} className="text-link"><Roll>Message us on WhatsApp</Roll></a>
          </div>
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
