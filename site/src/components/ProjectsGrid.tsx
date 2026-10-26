'use client';

import { useState } from 'react';
import ProjectCard from './ProjectCard';
import type { Project } from '@/content/projects';
import styles from './ProjectsGrid.module.scss';

const FILTERS = ['All', 'Residential', 'Commercial', 'Landscape'] as const;

// Category filter over the project list (after YODEZEEN's projects index).
export default function ProjectsGrid({ projects }: { projects: Project[] }) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All');
  const shown = filter === 'All' ? projects : projects.filter((p) => p.category === filter);

  return (
    <>
      <div className={styles.filters} role="group" aria-label="Filter projects by category">
        {FILTERS.map((f) => (
          <button key={f} type="button" className={styles.filter} aria-pressed={filter === f} onClick={() => setFilter(f)}>{f}</button>
        ))}
      </div>
      <p className="visually-hidden" aria-live="polite">{shown.length} {shown.length === 1 ? 'project' : 'projects'} shown</p>
      <div className={styles.grid}>
        {shown.map((p, i) => <ProjectCard key={p.slug} project={p} priority={i < 2} />)}
      </div>
    </>
  );
}
