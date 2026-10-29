'use client';

import Image from 'next/image';
import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { ProjectImage } from '@/content/projects';
import styles from './ParallaxHero.module.scss';

gsap.registerPlugin(ScrollTrigger);

// How far each layer sinks (percent of the hero's height) while the hero scrolls away: the deeper the layer, the more it sinks,
// so it moves up the screen more slowly than the page. Same scheme as Osmo's layered parallax; it uses the page's own Lenis.
const SINK: Record<string, number> = { back: 70, photo: 45, title: 15 };

// Project first screen: three layers (a soft warm wash of the photo, the sharp photo, the name). The wash is a CSS background,
// not an <img>, so the header reads the light ground behind the logo and turns dark.
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
      <div data-layer="back" className={styles.layer} aria-hidden="true">
        <div className={styles.wash} style={{ '--wash': `url(${photo.src})` } as CSSProperties} />
        <div className={styles.tint} />
      </div>
      <div data-layer="photo" className={styles.layer}>
        <Image src={photo.src} alt={photo.alt} priority width={photo.width} height={photo.height} sizes="(max-width: 767px) 70vw, 32rem" className={styles.panel} style={{ '--ar': photo.width / photo.height } as CSSProperties} />
      </div>
      <div data-layer="title" className={`container ${styles.layer} ${styles.title}`}>{children}</div>
    </section>
  );
}
