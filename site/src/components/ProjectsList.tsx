'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef, useState } from 'react';
import type { Project } from '@/content/projects';
import styles from './ProjectsList.module.scss';

const FILTERS = ['All', 'Residential', 'Commercial', 'Landscape'] as const;
const W = 340; // preview size, matches .preview in the stylesheet
const H = W * 1.25;

// Projects as a large minimal index (after YODEZEEN's projects page). On a mouse the project's image follows the
// pointer; on keyboard focus it sits beside the row; on touch screens each row shows its own thumbnail instead.
export default function ProjectsList({ projects }: { projects: Project[] }) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All');
  const [active, setActive] = useState<string | null>(null);
  const preview = useRef<HTMLDivElement>(null);
  const shown = filter === 'All' ? projects : projects.filter((p) => p.category === filter);

  const place = (x: number, y: number) => {
    const left = Math.min(x, innerWidth - W - 24);
    const top = Math.max(16, Math.min(y - H / 2, innerHeight - H - 16));
    if (preview.current) preview.current.style.transform = `translate3d(${left}px, ${top}px, 0)`;
  };

  return (
    <>
      <div className={styles.filters} role="group" aria-label="Filter projects by category">
        {FILTERS.map((f) => (
          <button key={f} type="button" className={styles.filter} aria-pressed={filter === f} onClick={() => setFilter(f)}>{f}</button>
        ))}
      </div>
      <p className="visually-hidden" aria-live="polite">{shown.length} {shown.length === 1 ? 'project' : 'projects'} shown</p>

      <ol className={styles.list} onPointerLeave={() => setActive(null)} onPointerMove={(e) => { if (e.pointerType === 'mouse') place(e.clientX + 36, e.clientY); }}>
        {shown.map((p) => (
          <li key={p.slug} className={active && active !== p.slug ? styles.dim : undefined}>
            <Link
              href={`/projects/${p.slug}`}
              className={styles.row}
              onPointerEnter={(e) => { if (e.pointerType === 'mouse') setActive(p.slug); }}
              onFocus={(e) => { const r = e.currentTarget.getBoundingClientRect(); place(innerWidth - W - 64, r.top + r.height / 2); setActive(p.slug); }}
              onBlur={() => setActive(null)}
            >
              <span className={styles.num} aria-hidden="true">{String(projects.indexOf(p) + 1).padStart(2, '0')}</span>
              <span className={styles.title}>{p.title}</span>
              <span className={styles.meta}>{p.category}<br />{p.location}</span>
              <span className={styles.area}>{p.area}</span>
              <span className={styles.arrow} aria-hidden="true">→</span>
              <span className={styles.thumb} aria-hidden="true">
                <Image src={p.cover.src} alt="" fill sizes="(max-width: 767px) 100vw, 60vw" />
              </span>
            </Link>
          </li>
        ))}
      </ol>

      {/* One image per project, stacked; the active one shows. Hidden entirely on touch screens. */}
      <div ref={preview} className={`${styles.preview} ${active ? styles.on : ''}`} aria-hidden="true">
        {projects.map((p) => (
          <Image key={p.slug} src={p.cover.src} alt="" fill sizes={`${W}px`} className={p.slug === active ? styles.shown : undefined} />
        ))}
      </div>
    </>
  );
}
