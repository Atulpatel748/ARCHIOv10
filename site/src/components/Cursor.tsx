'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './Cursor.module.scss';

// Measured from YODEZEEN's cursor: the SVG is drawn 150px wide but its viewBox is 280, so everything is scaled by 150/280 (0.54).
// A radius of 50 is therefore about 27px (a ring about 54px across) and 120 is about 64px (about 129px across); 80 is about 43px (about 86px across).
const SIZE = 150;
const VIEW = 280;
const R_IDLE = 50;
const R_HOVER = 120; // over something labelled with data-cursor, which needs room for its text
const R_LINK = 80; // over a plain link or button: a gentler growth, about 86px across
const INTERACTIVE = 'a, button, [data-cursor]';

// A ring that trails the pointer (after YODEZEEN's cursor): it eases after the mouse and grows over links, buttons and
// anything marked data-cursor, showing the data-cursor text inside.
// Drawn in white with mix-blend-mode: difference so it reads on any background. The normal pointer stays visible.
// Mouse devices 1024px and wider only, and not with reduced motion.
export default function Cursor() {
  const root = useRef<HTMLDivElement>(null);
  const circle = useRef<SVGCircleElement>(null);
  const [label, setLabel] = useState('');

  useEffect(() => {
    if (!matchMedia('(min-width: 1024px) and (hover: hover) and (pointer: fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const el = root.current!;
    const ring = circle.current!;
    let mx = 0, my = 0, x = 0, y = 0, r = R_IDLE, target = R_IDLE;
    let current: Element | null = null;
    let seen = false;
    let raf = 0;

    const frame = () => {
      x += (mx - x) * 0.14;
      y += (my - y) * 0.14;
      r += (target - r) * 0.14;
      el.style.transform = `translate3d(${x - SIZE / 2}px, ${y - SIZE / 2}px, 0)`;
      ring.setAttribute('r', r.toFixed(2));
      raf = requestAnimationFrame(frame);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      mx = e.clientX; my = e.clientY;
      if (!seen) { seen = true; x = mx; y = my; el.style.opacity = '1'; raf = requestAnimationFrame(frame); }
    };
    const onOver = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const next = (e.target as Element).closest(INTERACTIVE);
      if (next === current) return;
      current = next;
      target = next ? (next.hasAttribute('data-cursor') ? R_HOVER : R_LINK) : R_IDLE;
      setLabel(next?.getAttribute('data-cursor') ?? '');
    };
    const onLeave = () => { el.style.opacity = '0'; seen = false; cancelAnimationFrame(raf); };

    addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerover', onOver, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerover', onOver);
      document.documentElement.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return (
    <div ref={root} className={styles.cursor} aria-hidden="true">
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${VIEW} ${VIEW}`}>
        <circle ref={circle} cx={VIEW / 2} cy={VIEW / 2} r={R_IDLE} />
      </svg>
      <span className={`${styles.label} ${label ? styles.on : ''}`}>{label}</span>
    </div>
  );
}
