'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import styles from './PageTransition.module.scss';

// One oxblood curtain does two jobs:
// 1. first visit in a session: a short monogram intro (CSS lifts it anyway if JS never runs);
// 2. internal navigation: the curtain closes, the route changes, the curtain opens again.
export default function PageTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const curtain = useRef<HTMLDivElement>(null);
  const busy = useRef(false);
  const firstRun = useRef(true);

  // Open the curtain: on first load after the intro, and after every navigation.
  useEffect(() => {
    const el = curtain.current!;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (firstRun.current) {
      firstRun.current = false;
      el.style.animation = 'none'; // JS is in charge now; the CSS fallback would otherwise override GSAP's transforms
      const seen = sessionStorage.getItem('archio-intro');
      sessionStorage.setItem('archio-intro', '1');
      if (seen || reduce) { gsap.set(el, { y: 0, yPercent: -100 }); return; }
      const tl = gsap.timeline();
      tl.fromTo(el.querySelector(`.${styles.mark}`), { autoAlpha: 0, scale: 0.85 }, { autoAlpha: 1, scale: 1, duration: 0.7, ease: 'power3.out' })
        .fromTo(el.querySelector(`.${styles.word}`), { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power3.out' }, '-=0.3')
        .to(el, { y: 0, yPercent: -100, duration: 0.9, ease: 'power4.inOut', delay: 0.25 });
      return () => { tl.kill(); };
    }
    if (reduce) { gsap.set(el, { y: 0, yPercent: -100 }); busy.current = false; return; }
    gsap.to(el, { y: 0, yPercent: -100, duration: 0.8, ease: 'power4.inOut', delay: 0.05, onComplete: () => { busy.current = false; } });
  }, [pathname]);

  // Close the curtain before internal navigation.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element).closest('a');
      if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname) return;
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      e.preventDefault();
      e.stopPropagation(); // keep next/link from navigating immediately; we navigate once the curtain has closed
      if (busy.current) return;
      busy.current = true;
      const el = curtain.current!;
      gsap.set(el.querySelectorAll(`.${styles.mark}, .${styles.word}`), { autoAlpha: 0 });
      gsap.fromTo(el, { y: 0, yPercent: 100 }, { y: 0, yPercent: 0, duration: 0.65, ease: 'power4.inOut', onComplete: () => router.push(url.pathname + url.search + url.hash) });
    };
    // Capture phase: runs before React's (and next/link's) own click handling.
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [router]);

  return (
    <div ref={curtain} className={styles.curtain} aria-hidden="true">
      <span className={`logo logo--monogram ${styles.mark}`} />
      <span className={`logo logo--wordmark ${styles.word}`} />
    </div>
  );
}
