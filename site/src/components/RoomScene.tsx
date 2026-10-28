'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import styles from './RoomJourney.module.scss';

// The room is about 470 elements, so it is not part of the page load: its code is fetched and its markup built only once
// the section is within a screen of the viewport. Until then this is an empty box of the right size (no layout shift).
const RoomModel = dynamic(() => import('./RoomModel'), { ssr: false });

export default function RoomScene() {
  const box = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setNear(true); io.disconnect(); } }, { rootMargin: '100% 0px' });
    io.observe(box.current!);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={box} className={styles.view} role="img" aria-label="An illustration of a living room being built, shown from every side as you scroll">
      {near && <RoomModel />}
    </div>
  );
}
