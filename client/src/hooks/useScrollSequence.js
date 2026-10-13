import { useLayoutEffect, useRef } from 'react';

// Drives a pinned scroll sequence from JavaScript, so it plays the same in every browser (CSS scroll-driven animations
// are missing or partial in some). It sets --seq on the element: how far the page has scrolled since the element's top
// reached the header, in svh (negative before that). The CSS reads --seq and moves things; with reduced motion, or
// before this runs, the element carries no data-seq and simply shows its finished state.
export function useScrollSequence() {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    let header = 0;
    let frame = 0;
    const measure = () => {
      header = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 0;
    };
    const update = () => {
      frame = 0;
      const seq = (header - element.getBoundingClientRect().top) / (window.innerHeight / 100);
      element.style.setProperty('--seq', seq.toFixed(2));
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    const resize = () => {
      measure();
      schedule();
    };

    element.dataset.seq = '';
    measure();
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', resize);
      window.cancelAnimationFrame(frame);
      delete element.dataset.seq;
      element.style.removeProperty('--seq');
    };
  }, []);

  return ref;
}
