import Image from 'next/image';
import Link from 'next/link';
import { visualisation, type Project } from '@/content/projects';
import styles from './ProjectCard.module.scss';

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <article className={styles.card} data-reveal>
      <Link prefetch={false} href={`/projects/${project.slug}`} className={styles.link} data-cursor="View">
        <div className={styles.media} data-mask>
          <Image
            src={project.cover.src}
            alt={project.cover.alt}
            fill
            sizes="(max-width: 767px) 100vw, 46vw"
            className={styles.image}
          />
        </div>
        <div className={styles.meta}>
          <span className="label">{visualisation}</span>
          <h3 className="h3">{project.title}</h3>
          <p>{project.category}, {project.location} · {project.area}</p>
          <span className={styles.more}>See the project <span aria-hidden="true">→</span></span>
        </div>
      </Link>
    </article>
  );
}
