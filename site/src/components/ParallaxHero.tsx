'use client';

import Image from 'next/image';
import { useEffect, useRef, type ReactNode } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { ProjectImage } from '@/content/projects';
import styles from './ParallaxHero.module.scss';

gsap.registerPlugin(ScrollTrigger);

// How far each layer sinks (percent of the hero's height) while the hero scrolls away: the deeper the layer, the more it sinks.
// Same scheme as Osmo's "Parallax Scrolling" (21st.dev); it uses the page's own Lenis for smooth scrolling.
const SINK: Record<string, number> = { back: 60, title: 38, front: 8 };

// Project first screen: the main photo is cut in two, the wall (top) and the foreground (bottom), with the big name between them.
// The wall sinks fast and the foreground slowly, so the foreground rises over the name. Without motion the layers add up to the
// whole photo, with the name on it.
export default function ParallaxHero({ photo, children }: { photo: ProjectImage; children: ReactNode }) {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: 0 } });
      Object.entries(SINK).forEach(([layer, yPercent], i) => tl.to(`[data-layer="${layer}"]`, { yPercent, ease: 'none' }, i ? '<' : undefined));
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className={styles.hero}>
      <div data-layer="back" className={`${styles.layer} ${styles.back}`} aria-hidden="true">
        <Image src={photo.src} alt="" fill priority sizes="100vw" className={styles.photo} />
        <div className={styles.shade} />
      </div>
      <div data-layer="title" className={`container ${styles.layer} ${styles.title}`}>{children}</div>
      <div data-layer="front" className={`${styles.layer} ${styles.front}`}>
        <Image src={photo.src} alt={photo.alt} fill priority sizes="100vw" className={styles.photo} />
      </div>
    </section>
  );
}
