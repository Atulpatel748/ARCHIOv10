'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Roll from '@/components/Roll';
import type { Project } from '@/content/projects';
import styles from './Work.module.scss';

gsap.registerPlugin(ScrollTrigger);

// The Full screen view (after Wood & Weave's work page): each project fills the screen. The section pins, the first cover
// opens out from the middle, and as you scroll each cover tilts and lifts away to reveal the next. Without room to pin, or
// with reduced motion, the covers are simply stacked.
export default function Lift({ projects }: { projects: Project[] }) {
  const root = useRef<HTMLElement>(null);
  const [current, setCurrent] = useState(0);

  useLayoutEffect(() => {
    const el = root.current!;
    const covers = Array.from(el.querySelectorAll<HTMLElement>('[data-lf-cover]'));
    const pin = el.querySelector<HTMLElement>('[data-lf-pin]')!;
    const count = covers.length;
    const media = (c: HTMLElement) => c.querySelector<HTMLElement>('[data-lf-media]')!;
    const dim = (c: HTMLElement) => c.querySelector<HTMLElement>('[data-lf-dim]')!;
    const ins = (c: HTMLElement) => Array.from(c.querySelectorAll<HTMLElement>('[data-lf-in]'));
    const mm = gsap.matchMedia();

    mm.add({ wide: '(min-width: 48em)', fits: '(min-height: 31em)', motion: '(prefers-reduced-motion: no-preference)' }, (ctx) => {
      const { wide, fits, motion } = (ctx.conditions ?? {}) as { wide?: boolean; fits?: boolean; motion?: boolean };
      if (!motion || !fits || count < 2) return;
      el.classList.add(styles.isPinned);

      const first = covers[0];
      const rest = covers.slice(1);
      gsap.set(rest, { autoAlpha: 0 });
      gsap.set(rest.map(media), { scale: 1.08 });
      gsap.set(rest.map(dim), { opacity: 0.55 });
      gsap.set(rest.flatMap(ins), { y: 50, opacity: 0 });

      const tl = gsap.timeline({
        defaults: { ease: 'power2.inOut' },
        onUpdate: () => setCurrent(Math.max(0, Math.min(count - 1, Math.round(tl.time() - 1)))),
        scrollTrigger: { trigger: pin, start: 'top top', end: () => `+=${innerHeight * (0.9 + 0.9 * (count - 1))}`, pin: true, scrub: 0.8, invalidateOnRefresh: true },
      });

      // The first cover opens out from the middle
      tl.fromTo(first, { clipPath: wide ? 'inset(14% 25% 14% 25%)' : 'inset(18% 7% 22% 7%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.8 }, 0)
        .fromTo(media(first), { scale: 1.35 }, { scale: 1, duration: 0.9 }, 0)
        .fromTo(ins(first), { y: 50, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.06, duration: 0.3, ease: 'power2.out' }, 0.62)
        .set(rest, { autoAlpha: 1 }, 0.95);

      // Each cover shrinks a little, then tips up and away; the one beneath settles into place
      covers.forEach((cover, i) => {
        if (i === count - 1) return;
        const at = 1 + i;
        const next = covers[i + 1];
        const dir = i % 2 ? 1 : -1;
        tl.to(cover, { scale: 0.9, boxShadow: '0px 60px 90px -30px rgba(0,0,0,0.85)', duration: 0.3, ease: 'power1.out' }, at)
          .to(cover, { yPercent: -118, rotate: dir * 5, xPercent: dir * 4, duration: 0.7, ease: 'power2.in' }, at + 0.28)
          .to(media(next), { scale: 1, duration: 0.85 }, at + 0.1)
          .to(dim(next), { opacity: 0, duration: 0.7 }, at + 0.2)
          .to(ins(next), { y: 0, opacity: 1, stagger: 0.06, duration: 0.3, ease: 'power2.out' }, at + 0.7);
      });
      tl.to({}, { duration: 0.3 });

      return () => {
        el.classList.remove(styles.isPinned);
        setCurrent(0);
      };
    });

    return () => mm.revert();
  }, []);

  return (
    <section ref={root} className={styles.lfStage} aria-label="Projects, full screen">
      <div className={styles.lfPin} data-lf-pin>
        {projects.map((p, i) => (
          <article key={p.slug} className={styles.lfCover} data-lf-cover style={{ '--z': projects.length - i } as CSSProperties} aria-label={p.title}>
            <div className={styles.lfMedia} data-lf-media aria-hidden="true">
              <Image src={p.cover.src} alt="" fill priority={i === 0} sizes="100vw" />
            </div>
            <div className={styles.lfVeil} aria-hidden="true" />
            <Link href={`/projects/${p.slug}`} className={styles.lfHit} aria-hidden="true" tabIndex={-1} data-cursor="View" />
            <div className={`container ${styles.lfText}`}>
              <span className={styles.lfTag} data-lf-in>{p.category}</span>
              <h2 className={styles.lfTitle} data-lf-in>{p.title}</h2>
              <div className={styles.lfRow} data-lf-in>
                <span className={styles.lfMeta}>{p.location}, {p.area}</span>
                <span className={styles.lfStatus}>{p.status}</span>
                <Link href={`/projects/${p.slug}`} className={`text-link ${styles.lfGo}`}><Roll>See the project</Roll> <span aria-hidden="true">→</span></Link>
              </div>
            </div>
            <div className={styles.lfDim} data-lf-dim aria-hidden="true" />
          </article>
        ))}
        <div className={styles.lfStrip}>
          <ul className={styles.lfNames}>
            {projects.map((p, i) => (
              <li key={p.slug} className={i === current ? styles.isOn : undefined}><Link href={`/projects/${p.slug}`}>{p.title}</Link></li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
