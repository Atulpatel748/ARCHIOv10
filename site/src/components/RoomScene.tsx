'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import styles from './RoomJourney.module.scss';

// The room is not part of the page load: its code is fetched and it is built only once the section is within a screen of the
// viewport. Until then this is an empty box of the right size (no layout shift).
// On large screens with WebGL (and no reduced-motion setting) it is the real 3D room (room3d.ts: three.js, loaded only here).
// Everywhere else (phones, tablets, short windows, reduced motion, no WebGL) it is the CSS room, standing still (RoomModel).
const RoomModel = dynamic(() => import('./RoomModel'), { ssr: false });

const pinned = () => matchMedia('(min-width: 1024px) and (min-height: 640px) and (prefers-reduced-motion: no-preference)').matches;

export default function RoomScene() {
  const box = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<'idle' | '3d' | 'flat'>('idle');

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setMode(pinned() ? '3d' : 'flat'); io.disconnect(); } }, { rootMargin: '100% 0px' });
    io.observe(box.current!);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (mode !== '3d') return;
    const host = box.current!;
    const track = host.closest<HTMLElement>('section');
    const progress = () => parseFloat(track?.style.getPropertyValue('--progress') || '1');
    let stop: (() => void) | null = null, cancelled = false;
    import('./room3d').then((m) => {
      const dispose = m.createRoom3D(host, progress);
      if (cancelled) dispose?.(); else if (dispose) stop = dispose; else setMode('flat'); // no WebGL
    });
    return () => { cancelled = true; stop?.(); };
  }, [mode]);

  return (
    <div ref={box} className={styles.view} role="img" aria-label="An illustration of a living room being built, shown from every side as you scroll">
      {mode === 'flat' && <RoomModel />}
    </div>
  );
}
