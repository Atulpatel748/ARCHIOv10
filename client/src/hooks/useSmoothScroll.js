import { useEffect } from 'react';

// Eased, inertial wheel scrolling (Lenis) for people with a mouse or trackpad who have not asked for less motion.
// Touch screens keep their native momentum scrolling. The library is fetched after the page is idle, in its own
// chunk, so it never competes with the first paint.
const SMOOTH_OK = '(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)';

let activeLenis = null;

// Share an immediate route-level scroll reset with pages that must always open at the top.
export function scrollToTop() {
  if (activeLenis) {
    activeLenis.scrollTo(0, { immediate: true });
    return;
  }
  if (typeof document !== 'undefined') {
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }
}

export function useSmoothScroll() {
  useEffect(() => {
    if (!window.matchMedia(SMOOTH_OK).matches) return undefined;
    let lenis;
    let cancelled = false;
    const start = () => Promise.all([import('lenis'), import('lenis/dist/lenis.css')]).then(([{ default: Lenis }]) => {
      if (!cancelled) {
        lenis = new Lenis({ autoRaf: true, lerp: 0.075, anchors: true });
        activeLenis = lenis;
      }
    }).catch(() => {}); // decoration only: native scrolling stays if the chunk fails
    const idle = window.requestIdleCallback ?? ((fn) => setTimeout(fn, 1));
    const handle = idle(start);
    return () => {
      cancelled = true;
      (window.cancelIdleCallback ?? clearTimeout)(handle);
      lenis?.destroy();
      if (activeLenis === lenis) activeLenis = null;
    };
  }, []);
}
