'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import styles from './Cursor.module.scss';

// Follower shown only over marked elements, on mouse/trackpad devices (the normal pointer stays visible):
//   [data-cursor="View"]        a disc with a label (project images)
//   [data-cursor-image="/x.png"] a floating image preview (services list)
export default function Cursor() {
  const pathname = usePathname();
  const disc = useRef<HTMLDivElement>(null);
  const preview = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState('');
  const [image, setImage] = useState('');

  useEffect(() => {
    if (!matchMedia('(hover: hover) and (pointer: fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const moves = [disc.current!, preview.current!].map((el) => ({ x: gsap.quickTo(el, 'x', { duration: 0.45, ease: 'power3' }), y: gsap.quickTo(el, 'y', { duration: 0.45, ease: 'power3' }) }));
    const onMove = (e: PointerEvent) => {
      moves.forEach((m) => { m.x(e.clientX); m.y(e.clientY); });
      const target = (e.target as Element).closest<HTMLElement>('[data-cursor], [data-cursor-image]');
      setLabel(target?.dataset.cursor ?? '');
      setImage(target?.dataset.cursorImage ?? '');
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  // Hide followers when the route changes.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) { setLastPath(pathname); setLabel(''); setImage(''); }

  return (
    <>
      <div ref={disc} className={`${styles.disc} ${label ? styles.on : ''}`} aria-hidden="true"><span>{label}</span></div>
      <div ref={preview} className={`${styles.preview} ${image ? styles.on : ''}`} aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element -- decorative follower; next/image adds nothing here */}
        {image && <img src={image} alt="" />}
      </div>
    </>
  );
}
