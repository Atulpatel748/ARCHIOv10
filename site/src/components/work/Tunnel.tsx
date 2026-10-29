'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Roll from '@/components/Roll';
import type { Project } from '@/content/projects';
import styles from './Work.module.scss';

gsap.registerPlugin(ScrollTrigger);

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const SPAN = 0.55; // how much of the scroll each photo travels for; the photos start one after another

// Three photos of each project: its cover, one from the middle of its gallery and the last one.
const pick = (p: Project) => [p.cover, p.gallery[Math.floor(p.gallery.length / 2)], p.gallery[p.gallery.length - 1]].filter((img, i, all) => all.findIndex((o) => o.src === img.src) === i);

// The projects page's pinned view: the photos of every project fly towards you through a corridor (after "perspective tunnel
// hero" on 21st.dev) while the page is pinned. Each photo sits on a golden-angle spiral around the middle and travels from far
// to near; the name in the middle is the project whose photo is passing. With reduced motion the stacked list below is shown instead.
export default function Tunnel({ projects }: { projects: Project[] }) {
  const root = useRef<HTMLElement>(null);
  const cards = useRef<HTMLDivElement[]>([]);
  const [current, setCurrent] = useState(0);
  const shots = projects.flatMap((p, owner) => pick(p).map((img) => ({ img, owner })));

  useEffect(() => {
    const n = shots.length;
    const mid = (i: number) => (i / n) * (1 - SPAN) + SPAN / 2; // progress at which photo i is halfway along its travel
    let w = innerWidth, h = innerHeight, phone = innerWidth < 768, shown = 0;
    const render = (p: number) => {
      let best = 0;
      cards.current.forEach((el, i) => {
        const start = (i / n) * (1 - SPAN);
        const lp = clamp((p - start) / SPAN);
        if (Math.abs(p - mid(i)) < Math.abs(p - mid(best))) best = i;
        const a = i * 137.5 * (Math.PI / 180);
        const x = Math.cos(a) * w * (0.28 + (i % 3) * 0.08);
        const y = Math.sin(a) * h * (0.26 + (i % 2) * 0.09);
        const z = lerp(phone ? -1200 : -1700, phone ? 350 : 500, lp);
        const rot = (i % 2 ? -1 : 1) * (3 + (i % 5) * 2);
        el.style.transform = `translate3d(calc(-50% + ${x}px), calc(-50% + ${y}px), ${z}px) rotateZ(${rot}deg)`;
        el.style.opacity = String(lp < 0.18 ? lp / 0.18 : lp > 0.82 ? clamp((0.98 - lp) / 0.16) : 1);
      });
      if (shots[best].owner !== shown) { shown = shots[best].owner; setCurrent(shown); }
    };
    render(0);
    const st = ScrollTrigger.create({ trigger: root.current, start: 'top top', end: 'bottom bottom', scrub: true, onUpdate: (self) => render(self.progress) });
    const onResize = () => { w = innerWidth; h = innerHeight; phone = w < 768; render(st.progress); };
    addEventListener('resize', onResize);
    return () => { removeEventListener('resize', onResize); st.kill(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- shots is derived from projects
  }, [projects]);

  const now = projects[current];
  return (
    <>
      <section ref={root} className={styles.tunnel} aria-label="Projects">
        <div className={styles.stage}>
          <div className={styles.centre}>
            <span className={styles.tag}>{now.category}</span>
            <h2 className={styles.name}><Link prefetch={false} href={`/projects/${now.slug}`} data-cursor="View">{now.title}</Link></h2>
            <p className={styles.meta}>{now.location}, {now.area}</p>
            <Link prefetch={false} href={`/projects/${now.slug}`} className="text-link"><Roll>See the project</Roll> <span aria-hidden="true">→</span></Link>
          </div>
          <div className={styles.space} aria-hidden="true">
            {shots.map(({ img }, i) => (
              <div key={img.src} ref={(el) => { if (el) cards.current[i] = el; }} className={styles.card} style={{ aspectRatio: img.width / img.height }}>
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
            <span className={styles.tag}>{p.category}</span>
            <h2 className={styles.name}>{p.title}</h2>
            <p className={styles.meta}>{p.location}, {p.area}</p>
            <Link prefetch={false} href={`/projects/${p.slug}`} className="text-link"><Roll>See the project</Roll> <span aria-hidden="true">→</span></Link>
          </article>
        ))}
      </section>
    </>
  );
}
