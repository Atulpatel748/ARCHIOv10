import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Gallery from '@/components/Gallery';
import PageHero from '@/components/PageHero';
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
    title: `${project.title}, ${project.category} design visualisation`,
    description: `${project.summary} ${project.location}, ${project.area}.`,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: { images: [project.cover.src] },
  };
}

export default async function ProjectPage({ params }: Params) {
  const project = getProject((await params).slug);
  if (!project) notFound();
  const next = projects[(projects.indexOf(project) + 1) % projects.length];

  return (
    <>
      {/* The page follows Wood & Weave's project pages: a full-screen hero, the idea beside a facts list, the rooms, then a
          conversation and the next project. */}
      <PageHero label={project.status} title={project.title} intro={project.location} image={project.hero} size="full" compact />

      <section className={`section container ${styles.idea}`}>
        <div className={styles.ideaText}>
          <p className="label" data-reveal>The idea</p>
          <Split className={styles.ideaTitle} text={project.summary} />
          {project.description.map((p) => <p key={p} className="serif" data-reveal>{p}</p>)}
        </div>
        <aside className={styles.ideaSide} data-reveal>
          <dl className={styles.table}>
            <div><dt>Where</dt><dd>{project.location}</dd></div>
            <div><dt>Category</dt><dd>{project.category}</dd></div>
            <div><dt>Area</dt><dd>{project.area}</dd></div>
            <div><dt>What it is</dt><dd>{project.status}</dd></div>
          </dl>
          <Link href="/contact" className="btn btn--solid"><Roll>Start a project</Roll></Link>
          <a href={site.whatsappHref} className="text-link"><Roll>Message us on WhatsApp</Roll></a>
          <p className={styles.note}>The images on this page are 3D design visualisations of the proposed design.</p>
        </aside>
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
            <Link href="/contact" className="btn btn--solid"><Roll>Start a project</Roll></Link>
            <a href={site.whatsappHref} className="text-link"><Roll>Message us on WhatsApp</Roll></a>
          </div>
        </div>
        <div className={styles.endNext}>
          <Link href="/projects" className={`text-link ${styles.endAll}`} data-reveal><Roll>All the work</Roll></Link>
          <Link href={`/projects/${next.slug}`} className={styles.next} data-cursor="View" data-reveal>
            <span className="label">Next project</span>
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
