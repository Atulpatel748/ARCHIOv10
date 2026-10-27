'use client';

import { useEffect, useRef } from 'react';

// A tall section whose content stays pinned while you scroll through it. Publishes how far in you are as --seq
// (in screen heights, 0 when the section's top meets the header) so CSS can drive the motion. Without JS, or with
// reduced motion, data-seq is never set and the section is a plain static block.
export default function Sequence({ className, children }: { className?: string; children: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current!;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let frame = 0;
    let header = 0;
    const measure = () => { header = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 0; };
    const update = () => { frame = 0; el.style.setProperty('--seq', ((header - el.getBoundingClientRect().top) / (innerHeight / 100)).toFixed(2)); };
    const queue = () => { frame ||= requestAnimationFrame(update); };
    const resize = () => { measure(); queue(); };
    el.dataset.seq = '';
    measure();
    update();
    addEventListener('scroll', queue, { passive: true });
    addEventListener('resize', resize);
    return () => {
      removeEventListener('scroll', queue);
      removeEventListener('resize', resize);
      cancelAnimationFrame(frame);
      delete el.dataset.seq;
      el.style.removeProperty('--seq');
    };
  }, []);

  return <section ref={ref} className={className}>{children}</section>;
}
