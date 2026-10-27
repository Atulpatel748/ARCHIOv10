import type { Project } from '@/content/projects';
import Lift from './Lift';
import Mosaic from './Mosaic';
import styles from './Work.module.scss';

// The projects page, laid out like Wood & Weave's work page: a head, the projects full screen, what each item is, and a
// filterable room-by-room mosaic.
export default function WorkPage({ projects }: { projects: Project[] }) {
  const statuses = [...new Set(projects.map((p) => p.status))].map((status) => ({ status, names: projects.filter((p) => p.status === status).map((p) => p.title) }));

  return (
    <>
      <section className={styles.head}>
        <div className="container">
          <div className={styles.headA}>
            <p className="label" data-reveal>Projects</p>
            <h1 className={styles.title}>Selected work.</h1>
            <p className={styles.lead} data-reveal>Residential, commercial and landscape design across Dubai. Each is labelled for what it is.</p>
          </div>
        </div>
      </section>

      <Lift projects={projects} />

      <section className={`container ${styles.labels}`} aria-label="What each project is">
        <div className={styles.labelsGrid}>
          <h2 className={styles.labelsTitle} data-reveal>Every item here carries what it actually is.</h2>
          <ul className={styles.labelList} data-reveal>
            {statuses.map((s) => <li key={s.status}>{s.status}<span>{s.names.join(', ')}</span></li>)}
          </ul>
        </div>
      </section>

      <Mosaic projects={projects} />
    </>
  );
}
