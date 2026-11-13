'use client';

import { useEffect, useRef } from 'react';

// A tall section whose content stays pinned (a sticky child) while you scroll through it. Publishes how far through it you
// are as --progress (0 when its top meets the top of the screen, 1 when its bottom meets the bottom), so CSS can drive the
// motion; the same scheme as YODEZEEN's "We do". Without JS, or with reduced motion, data-seq is never set and the section
// is a plain static block.
export default function Sequence({ className, children }: { className?: string; children: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current!;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const r = el.getBoundingClientRect();
      const span = r.height - innerHeight;
      el.style.setProperty('--progress', (span > 0 ? Math.min(1, Math.max(0, -r.top / span)) : 1).toFixed(4));
    };
    // A keyboard user can Tab to a link that only slides into view at the end of the scene ("See the work"): jump to the end so it is on screen.
    const onFocusIn = (e: FocusEvent) => {
      const q = (e.target as HTMLElement).getBoundingClientRect();
      if (q.top >= 0 && q.bottom <= innerHeight) return;
      const r = el.getBoundingClientRect();
      const end = scrollY + r.top + (r.height - innerHeight);
      const l = (window as unknown as { lenis?: { scrollTo(y: number, o?: object): void } }).lenis;
      if (l) l.scrollTo(end, { immediate: true }); else scrollTo(0, end);
    };
    const queue = () => { frame ||= requestAnimationFrame(update); };
    const resize = () => queue();
    el.dataset.seq = '';
    el.addEventListener('focusin', onFocusIn);
    update();
    addEventListener('scroll', queue, { passive: true });
    addEventListener('resize', resize);
    return () => {
      removeEventListener('scroll', queue);
      removeEventListener('resize', resize);
      el.removeEventListener('focusin', onFocusIn);
      cancelAnimationFrame(frame);
      delete el.dataset.seq;
      el.style.removeProperty('--progress');
    };
  }, []);

  return <section ref={ref} className={className}>{children}</section>;
}
