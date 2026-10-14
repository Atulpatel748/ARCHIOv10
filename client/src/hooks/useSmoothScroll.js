import { useEffect } from 'react';

// Eased, inertial wheel scrolling (Lenis) for people with a mouse or trackpad who have not asked for less motion.
// Touch screens keep their native momentum scrolling. The library is fetched after the page is idle, in its own
// chunk, so it never competes with the first paint.
const SMOOTH_OK = '(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)';

export function useSmoothScroll() {
  useEffect(() => {
    if (!window.matchMedia(SMOOTH_OK).matches) return undefined;
    let lenis;
    let cancelled = false;
    const start = () => Promise.all([import('lenis'), import('lenis/dist/lenis.css')]).then(([{ default: Lenis }]) => {
      if (!cancelled) lenis = new Lenis({ autoRaf: true, lerp: 0.075, anchors: true });
    }).catch(() => {}); // decoration only: native scrolling stays if the chunk fails
    const idle = window.requestIdleCallback ?? ((fn) => setTimeout(fn, 1));
    const handle = idle(start);
    return () => {
      cancelled = true;
      (window.cancelIdleCallback ?? clearTimeout)(handle);
      lenis?.destroy();
    };
  }, []);
}
