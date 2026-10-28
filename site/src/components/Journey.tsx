'use client';

import { useEffect, useRef } from 'react';
import StepGlyph from './StepGlyph';
import styles from './Journey.module.scss';

type Step = { title: string; text: string };

// The process as a vertical road: a line fills as you scroll and each step lights up when the line reaches it. With reduced
// motion (or before the script runs) every step is simply shown in full.
export default function Journey({ steps }: { steps: Step[] }) {
  const list = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const el = list.current!;
    const items = [...el.children] as HTMLElement[];
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    el.dataset.live = '';
    let frame = 0;
    const update = () => {
      frame = 0;
      const mid = innerHeight * 0.55;
      const r = el.getBoundingClientRect();
      el.style.setProperty('--fill', String(Math.min(1, Math.max(0, (mid - r.top) / r.height))));
      items.forEach((li) => li.classList.toggle(styles.on, li.getBoundingClientRect().top < mid));
    };
    const queue = () => { frame ||= requestAnimationFrame(update); };
    update();
    addEventListener('scroll', queue, { passive: true });
    addEventListener('resize', queue);
    return () => {
      removeEventListener('scroll', queue);
      removeEventListener('resize', queue);
      cancelAnimationFrame(frame);
      delete el.dataset.live;
    };
  }, []);

  return (
    <ol ref={list} className={styles.road}>
      {steps.map((s, i) => (
        <li key={s.title}>
          <StepGlyph step={i} className={styles.glyph} />
          <div className={styles.body}>
            <h3>{s.title}</h3>
            <p>{s.text}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
