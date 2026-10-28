'use client';

import { useEffect, useRef } from 'react';
import styles from './BackToTop.module.scss';

// A round "Back to top" button whose ring fills as you read down the page. On wide screens (1280px and up) it sits in the empty side
// margin and shows once you are past the first screen, so it never covers content; on narrower screens the margins are too thin, so it
// shows only in the last stretch of the page, where the footer leaves a clear band for it.
export default function BackToTop() {
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const el = ref.current!;
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - innerHeight;
      const wide = matchMedia('(min-width: 1280px)').matches;
      const show = max > innerHeight && (wide ? scrollY > 400 : scrollY >= max - 240);
      el.style.setProperty('--p', String(Math.min(1, Math.max(0, max > 0 ? scrollY / max : 0))));
      el.classList.toggle(styles.on, show);
      el.tabIndex = show ? 0 : -1;
      el.setAttribute('aria-hidden', String(!show));
    };
    const queue = () => { frame ||= requestAnimationFrame(update); };
    update();
    addEventListener('scroll', queue, { passive: true });
    addEventListener('resize', queue);
    return () => { removeEventListener('scroll', queue); removeEventListener('resize', queue); cancelAnimationFrame(frame); };
  }, []);

  const toTop = () => {
    const lenis = (window as unknown as { lenis?: { scrollTo(y: number): void } }).lenis;
    if (lenis) lenis.scrollTo(0);
    else scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  };

  return (
    <button ref={ref} type="button" className={styles.top} onClick={toTop} aria-label="Back to top" aria-hidden="true" tabIndex={-1}>
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <circle className={styles.track} cx="24" cy="24" r="22" />
        <circle className={styles.fill} cx="24" cy="24" r="22" />
        <path className={styles.arrow} d="M24 32V16m0 0-7 7m7-7 7 7" />
      </svg>
    </button>
  );
}
