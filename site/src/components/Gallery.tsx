'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import type { ProjectImage } from '@/content/projects';
import styles from './Gallery.module.scss';

// Masonry gallery; each image opens in a native <dialog> lightbox with previous/next and arrow keys.
export default function Gallery({ images, title }: { images: ProjectImage[]; title: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState<number | null>(null);

  const open = (i: number) => { setIndex(i); dialog.current?.showModal(); };
  const step = (d: number) => setIndex((i) => (i === null ? i : (i + d + images.length) % images.length));

  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'ArrowRight') step(1); if (e.key === 'ArrowLeft') step(-1); };
    const onClose = () => setIndex(null);
    el.addEventListener('keydown', onKey);
    el.addEventListener('close', onClose);
    return () => { el.removeEventListener('keydown', onKey); el.removeEventListener('close', onClose); };
  });

  const current = index === null ? null : images[index];

  return (
    <>
      {/* Room by room: alternating full-width and paired images, each with a caption (after Wood & Weave) */}
      <ul className={styles.grid}>
        {images.map((img, i) => (
          <li key={img.src} className={i % 3 === 0 ? styles.wide : undefined} data-reveal>
            <button type="button" className={styles.thumb} data-cursor="Open" onClick={() => open(i)} aria-label={`Open image ${i + 1} of ${images.length}: ${img.alt}`}>
              <Image src={img.src} alt="" fill sizes={i % 3 === 0 ? '(max-width: 767px) 100vw, 92vw' : '(max-width: 767px) 100vw, 46vw'} />
            </button>
            <p className={styles.caption} aria-hidden="true">{img.alt.replace(/, design visualisation$/, '')}</p>
          </li>
        ))}
      </ul>

      <dialog ref={dialog} className={styles.lightbox} aria-label={`${title} gallery`}>
        {current && (
          <figure className={styles.figure}>
            <Image src={current.src} alt={current.alt} width={current.width} height={current.height} sizes="90vw" className={styles.full} />
            <figcaption>{current.alt}<span>{(index ?? 0) + 1} of {images.length}</span></figcaption>
          </figure>
        )}
        <div className={styles.controls}>
          <button type="button" onClick={() => step(-1)}>Previous</button>
          <button type="button" onClick={() => step(1)}>Next</button>
          <button type="button" onClick={() => dialog.current?.close()} autoFocus>Close</button>
        </div>
      </dialog>
    </>
  );
}
