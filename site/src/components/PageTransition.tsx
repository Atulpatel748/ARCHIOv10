'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import styles from './PageTransition.module.scss';

// A pair of oxblood velvet drapes does two jobs:
// 1. first visit in a session: a short monogram intro, then the drapes part (CSS parts them anyway if JS never runs);
// 2. internal navigation: the drapes close from the sides, the route changes, the drapes part again.
export default function PageTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const root = useRef<HTMLDivElement>(null);
  const busy = useRef(false);
  const firstRun = useRef(true);

  const parts = () => {
    const el = root.current!;
    return {
      el,
      left: el.querySelector<HTMLElement>(`.${styles.left}`)!,
      right: el.querySelector<HTMLElement>(`.${styles.right}`)!,
      brand: el.querySelectorAll<HTMLElement>(`.${styles.mark}, .${styles.word}`),
    };
  };

  // Part the drapes: after the intro on first load, and after every navigation.
  useEffect(() => {
    const { el, left, right, brand } = parts();
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const open = (delay = 0) => gsap.timeline({ delay, onComplete: () => { busy.current = false; } })
      .to(brand, { autoAlpha: 0, duration: 0.3 })
      .to(left, { x: 0, xPercent: -100, duration: 1.1, ease: 'power4.inOut' }, '<0.1')
      .to(right, { x: 0, xPercent: 100, duration: 1.1, ease: 'power4.inOut' }, '<');

    if (firstRun.current) {
      firstRun.current = false;
      el.classList.add(styles.js); // JS is in charge now; disables the CSS fallback that would override GSAP's transforms
      const seen = sessionStorage.getItem('archio-intro');
      sessionStorage.setItem('archio-intro', '1');
      if (seen || reduce) { gsap.set(left, { x: 0, xPercent: -100 }); gsap.set(right, { x: 0, xPercent: 100 }); gsap.set(brand, { autoAlpha: 0 }); return; }
      const tl = gsap.timeline();
      tl.fromTo(brand[0], { autoAlpha: 0, scale: 0.85 }, { autoAlpha: 1, scale: 1, duration: 0.7, ease: 'power3.out' })
        .fromTo(brand[1], { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power3.out' }, '-=0.3')
        .add(open(0.25));
      return () => { tl.kill(); };
    }
    if (reduce) { gsap.set(left, { x: 0, xPercent: -100 }); gsap.set(right, { x: 0, xPercent: 100 }); busy.current = false; return; }
    open(0.05);
  }, [pathname]);

  // Close the drapes before internal navigation.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element).closest('a');
      if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname) return;
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      e.preventDefault();
      e.stopPropagation(); // keep next/link from navigating immediately; we navigate once the drapes have closed
      if (busy.current) return;
      busy.current = true;
      const { left, right, brand } = parts();
      gsap.set(brand, { autoAlpha: 0 });
      gsap.timeline({ onComplete: () => router.push(url.pathname + url.search + url.hash) })
        .fromTo(left, { x: 0, xPercent: -100 }, { x: 0, xPercent: 0, duration: 0.75, ease: 'power4.inOut' })
        .fromTo(right, { x: 0, xPercent: 100 }, { x: 0, xPercent: 0, duration: 0.75, ease: 'power4.inOut' }, '<');
    };
    // Capture phase: runs before React's (and next/link's) own click handling.
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [router]);

  return (
    <div ref={root} className={styles.curtain} aria-hidden="true">
      <div className={`${styles.drape} ${styles.left}`} />
      <div className={`${styles.drape} ${styles.right}`} />
      <div className={styles.brand}>
        <span className={`logo logo--monogram ${styles.mark}`} />
        <span className={`logo logo--wordmark ${styles.word}`} />
      </div>
    </div>
  );
}
