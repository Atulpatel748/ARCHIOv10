import type { Project } from '@/content/projects';
import Tunnel from './Tunnel';
import Mosaic from './Mosaic';
import styles from './Work.module.scss';

// The projects page, a head, a pinned tunnel of the projects' photos, and a filterable
// room-by-room mosaic.
export default function WorkPage({ projects }: { projects: Project[] }) {
  return (
    <>
      <section className={styles.head}>
        <div className="container">
          <div className={styles.headA}>
            <p className="label" data-reveal>Projects</p>
            <h1 className={styles.title}>Selected work.</h1>
            <p className={styles.lead} data-reveal>Residential, commercial and landscape design across Dubai.</p>
          </div>
        </div>
      </section>

      <Tunnel projects={projects} />

      <Mosaic projects={projects} />
    </>
  );
}
