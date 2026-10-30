import Image from 'next/image';
import type { ReactNode } from 'react';
import type { ProjectImage } from '@/content/projects';
import styles from './ProjectHero.module.scss';

// Project first screen: the main photo fills the screen with the name on it. A calm entrance only (CSS): the photo fades in and
// settles, the small lines fade up after it; the name rises line by line (Split). Nothing moves on scroll.
export default function ProjectHero({ photo, children }: { photo: ProjectImage; children: ReactNode }) {
  return (
    <section className={styles.hero}>
      <Image src={photo.src} alt={photo.alt} fill priority fetchPriority="high" sizes="100vw" className={styles.photo} />
      <div className={styles.shade} aria-hidden="true" />
      <div className={`container ${styles.title}`}>{children}</div>
    </section>
  );
}
