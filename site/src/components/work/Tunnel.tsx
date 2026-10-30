'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef, useState } from 'react';
import Roll from '@/components/Roll';
import { useTunnel } from '@/components/useTunnel';
import t from '@/components/tunnel.module.scss';
import { visualisation, type Project } from '@/content/projects';
import styles from './Work.module.scss';

// Three photos of each project: its cover, one from the middle of its gallery and the last one.
const pick = (p: Project) => [p.cover, p.gallery[Math.floor(p.gallery.length / 2)], p.gallery[p.gallery.length - 1]].filter((img, i, all) => all.findIndex((o) => o.src === img.src) === i);

// The projects page's pinned view: the photos of every project fly through the tunnel; the name in the middle is the project
// whose photo is passing. With reduced motion the stacked list below is shown instead.
export default function Tunnel({ projects }: { projects: Project[] }) {
  const root = useRef<HTMLElement>(null);
  const cards = useRef<HTMLDivElement[]>([]);
  const [current, setCurrent] = useState(0);
  const shots = projects.flatMap((p, owner) => pick(p).map((img) => ({ img, owner })));
  useTunnel(root, cards, shots.length, 0, (i) => setCurrent(shots[i].owner));

  const now = projects[current];
  return (
    <>
      <section ref={root} className={t.tunnel} style={{ '--len': '520dvh' } as React.CSSProperties} aria-label="Projects">
        <div className={t.stage}>
          <div className={t.centre}>
            <span className={t.tag}>{now.category}</span>
            <h2 className={t.name}><Link prefetch={false} href={`/projects/${now.slug}`} data-cursor="View">{now.title}</Link></h2>
            <p className={t.meta}>{now.location}, {now.area}</p>
            <span className={t.note}>{visualisation}</span>
            <Link prefetch={false} href={`/projects/${now.slug}`} className="text-link"><Roll>See the project</Roll> <span aria-hidden="true">→</span></Link>
          </div>
          <div className={t.space} aria-hidden="true">
            {shots.map(({ img }, i) => (
              <div key={img.src} ref={(el) => { if (el) cards.current[i] = el; }} className={t.card} style={{ aspectRatio: img.width / img.height }}>
                <Image src={img.src} alt="" fill sizes="(max-width: 767px) 38vw, 18vw" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.plain} aria-label="Projects">
        {projects.map((p) => (
          <article key={p.slug} className={`container ${styles.plainItem}`}>
            <Link prefetch={false} href={`/projects/${p.slug}`} className={styles.plainPhoto}><Image src={p.cover.src} alt={p.cover.alt} fill sizes="(max-width: 1023px) 100vw, 60vw" /></Link>
            <span className={t.tag}>{p.category}</span>
            <h2 className={t.name}>{p.title}</h2>
            <p className={t.meta}>{p.location}, {p.area}</p>
            <span className={t.note}>{visualisation}</span>
            <Link prefetch={false} href={`/projects/${p.slug}`} className="text-link"><Roll>See the project</Roll> <span aria-hidden="true">→</span></Link>
          </article>
        ))}
      </section>
    </>
  );
}
