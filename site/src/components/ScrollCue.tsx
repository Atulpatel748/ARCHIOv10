'use client';

import { useEffect, useRef } from 'react';
import styles from './ScrollCue.module.scss';

// An invitation to scroll: an oxblood capsule in the left margin with the word set upright and a small drop running down a hairline.
// It is the partner of <BackToTop> on the right: it shows only at the very top of a page that scrolls, then hands over as the
// "Back to top" button appears. Wide screens only (1280px and up), where the margin is empty. Decorative, so hidden from screen readers.
export default function ScrollCue() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current!;
    let frame = 0;
    const update = () => {
      frame = 0;
      const scrolls = document.documentElement.scrollHeight - innerHeight > innerHeight;
      el.classList.toggle(styles.on, scrolls && scrollY < 300);
    };
    const queue = () => { frame ||= requestAnimationFrame(update); };
    update();
    addEventListener('scroll', queue, { passive: true });
    addEventListener('resize', queue);
    return () => { removeEventListener('scroll', queue); removeEventListener('resize', queue); cancelAnimationFrame(frame); };
  }, []);

  return (
    <div ref={ref} className={styles.cue} aria-hidden="true">
      <span className={styles.word}>Scroll</span>
      <span className={styles.rail}><i /></span>
    </div>
  );
}
