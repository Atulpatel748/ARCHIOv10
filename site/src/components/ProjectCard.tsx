import Image from 'next/image';
import Link from 'next/link';
import type { Project } from '@/content/projects';
import styles from './ProjectCard.module.scss';

type Props = { project: Project; size?: 'large' | 'regular'; priority?: boolean };

export default function ProjectCard({ project, size = 'regular', priority = false }: Props) {
  return (
    <article className={`${styles.card} ${size === 'large' ? styles.large : ''}`} data-reveal>
      <Link href={`/projects/${project.slug}`} className={styles.link} data-cursor="View">
        <div className={styles.media} data-mask>
          <Image
            src={project.cover.src}
            alt={project.cover.alt}
            fill
            priority={priority}
            sizes={size === 'large' ? '(max-width: 767px) 100vw, 92vw' : '(max-width: 767px) 100vw, 46vw'}
            className={styles.image}
          />
        </div>
        <div className={styles.meta}>
          <h3 className="h3">{project.title}</h3>
          <p>{project.category}, {project.location} · {project.area}</p>
          <span className={styles.more}>See the project <span aria-hidden="true">→</span></span>
        </div>
      </Link>
    </article>
  );
}
