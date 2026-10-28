'use client';

import { useEffect, useState } from 'react';
import styles from './Preloader.module.scss';

// A curtain over the first screen on every full page load, so nobody sees the hero half-loaded. The wordmark fills in while
// the fonts and the eager (above-the-fold) images arrive; then the curtain lifts. It shows for at least 1.2 s and at most 4 s
// from the start of the page. Client-side navigation keeps the layout, so it never shows again until the next full load.
export default function Preloader() {
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const until = (ms: number) => new Promise((r) => setTimeout(r, ms - performance.now())); // ms counted from the page's start
    const imgs = [...document.querySelectorAll<HTMLImageElement>('img:not([loading="lazy"])')];
    const ready = Promise.all([document.fonts.ready, ...imgs.map((img) => img.decode().catch(() => undefined)), until(1200)]);
    Promise.race([ready, until(4000)]).then(() => { if (!cancelled) setLeaving(true); });
    return () => { cancelled = true; };
  }, []);

  if (gone) return null;
  return (
    <div
      className={`${styles.preloader} ${leaving ? styles.leaving : ''}`}
      data-preloader
      aria-hidden="true"
      onTransitionEnd={(e) => { if (e.target === e.currentTarget) setGone(true); }}
    >
      <span className={styles.mark}>
        <span className={`logo logo--wordmark ${styles.ghost}`} />
        <span className={`logo logo--wordmark ${styles.fill}`} />
      </span>
    </div>
  );
}
