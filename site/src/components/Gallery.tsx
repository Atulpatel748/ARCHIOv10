'use client';

import Image from 'next/image';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { gsap } from 'gsap';
import { visualisation, type ProjectImage } from '@/content/projects';
import styles from './Gallery.module.scss';

type Lenis = { stop(): void; start(): void };
const lenis = () => (window as unknown as { lenis?: Lenis }).lenis;
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

// The thumbnail's rectangle expressed as an inset() of the full image, so the image can open out of
// (and close back into) the exact spot that was clicked. No overlap: a centred 35% inset.
function insetFrom(full: DOMRect, thumb: DOMRect) {
  const c = (v: number, max: number) => Math.max(0, Math.min(max, v));
  const overlaps = thumb.right > full.left && thumb.left < full.right && thumb.bottom > full.top && thumb.top < full.bottom;
  if (!overlaps) return `inset(${full.height * 0.35}px ${full.width * 0.35}px ${full.height * 0.35}px ${full.width * 0.35}px)`;
  return `inset(${c(thumb.top - full.top, full.height)}px ${c(full.right - thumb.right, full.width)}px ${c(full.bottom - thumb.bottom, full.height)}px ${c(thumb.left - full.left, full.width)}px)`;
}

// Images grouped by room (consecutive images with the same room).
type Shot = { img: ProjectImage; index: number };
function groupByRoom(images: ProjectImage[]) {
  const groups: { room: string; shots: Shot[] }[] = [];
  images.forEach((img, index) => {
    const room = img.room ?? '';
    const last = groups[groups.length - 1];
    if (last && last.room === room) last.shots.push({ img, index });
    else groups.push({ room, shots: [{ img, index }] });
  });
  return groups;
}

// Room-by-room gallery with a full-screen viewer (open, close and next/previous motion after Wood & Weave). Each room is a
// collage: a sticky index lists the rooms and marks the one in view, and the photos drift as you scroll.
export default function Gallery({ images, title, layout = 'rooms' }: { images: ProjectImage[]; title: string; layout?: 'rooms' | 'mosaic' }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const veil = useRef<HTMLDivElement>(null);
  const thumbs = useRef<HTMLButtonElement[]>([]);
  const figs = useRef<HTMLElement[]>([]);
  const state = useRef({ index: 0, busy: false, tl: null as gsap.core.Timeline | null });
  const [room, setRoom] = useState(0);
  const roomsEl = useRef<HTMLDivElement>(null);

  const frame = (i: number) => figs.current[i].querySelector<HTMLElement>('[data-frame]')!;
  const caption = (i: number) => figs.current[i].querySelector<HTMLElement>('figcaption')!;

  // Size the frame to fit the screen at the image's own ratio.
  const fit = (i: number) => {
    const { width, height } = images[i];
    const ratio = width / height;
    const phone = innerWidth < 768;
    const w = Math.min(innerWidth - (phone ? 24 : 144), (innerHeight - (phone ? 150 : 112)) * ratio, width);
    // The thumbnail's already-loaded image shows through until the full-size one arrives.
    const thumb = thumbs.current[i].querySelector('img')?.currentSrc;
    Object.assign(frame(i).style, { width: `${Math.round(w)}px`, height: `${Math.round(w / ratio)}px`, backgroundImage: thumb ? `url("${thumb}")` : '' });
  };
  const show = (i: number) => figs.current.forEach((f, n) => { f.hidden = n !== i; });
  const reset = (i: number) => gsap.set([frame(i), caption(i), figs.current[i]], { clearProps: 'all' });

  function open(i: number) {
    const s = state.current;
    if (s.busy) return;
    s.index = i;
    gsap.set(figs.current, { clearProps: 'all' });
    show(i);
    fit(i);
    gsap.set(veil.current, { clearProps: 'all' });
    dialog.current!.showModal();
    lenis()?.stop();
    if (reduced()) return;
    s.busy = true;
    const from = insetFrom(frame(i).getBoundingClientRect(), thumbs.current[i].getBoundingClientRect());
    gsap.set(caption(i), { opacity: 0, y: 10 });
    s.tl = gsap.timeline({ onComplete: () => { s.busy = false; } })
      .fromTo(veil.current, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: 'power2.out' }, 0)
      .fromTo(frame(i), { clipPath: from, scale: 1.08 }, { clipPath: 'inset(0px 0px 0px 0px)', scale: 1, duration: 1, ease: 'expo.inOut' }, 0)
      .to(caption(i), { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 0.75);
  }

  function close() {
    const s = state.current;
    if (!dialog.current?.open) return;
    s.tl?.kill();
    const i = s.index;
    // A step cut short leaves the outgoing figure half faded and shifted.
    gsap.set(figs.current, { clearProps: 'all' });
    show(i);
    const finish = () => { dialog.current?.close(); reset(i); gsap.set(veil.current, { clearProps: 'all' }); s.busy = false; lenis()?.start(); thumbs.current[i]?.focus(); };
    if (reduced()) { finish(); return; }
    s.busy = true;
    const thumb = thumbs.current[i].getBoundingClientRect();
    const onScreen = thumb.bottom > 0 && thumb.top < innerHeight && thumb.width > 0;
    s.tl = gsap.timeline({ onComplete: finish }).to(caption(i), { opacity: 0, duration: 0.2 }, 0);
    if (onScreen) {
      s.tl.to(frame(i), { clipPath: insetFrom(frame(i).getBoundingClientRect(), thumb), scale: 1, duration: 0.75, ease: 'expo.inOut' }, 0)
        .to(veil.current, { opacity: 0, duration: 0.35, ease: 'power2.out' }, 0.2);
    } else {
      s.tl.to(frame(i), { opacity: 0, scale: 0.96, duration: 0.3, ease: 'power2.out' }, 0)
        .to(veil.current, { opacity: 0, duration: 0.3, ease: 'power2.out' }, 0.05);
    }
  }

  function step(dir: number) {
    const s = state.current;
    if (s.busy || images.length < 2) return;
    const from = s.index;
    const to = (from + dir + images.length) % images.length;
    s.index = to;
    fit(to);
    figs.current[to].hidden = false;
    if (reduced()) { figs.current[from].hidden = true; return; }
    s.busy = true;
    s.tl = gsap.timeline({ onComplete: () => { figs.current[from].hidden = true; reset(from); s.busy = false; } })
      .to(figs.current[from], { opacity: 0, x: -50 * dir, duration: 0.5, ease: 'power2.inOut' }, 0)
      .fromTo(figs.current[to], { opacity: 0, x: 50 * dir }, { opacity: 1, x: 0, duration: 0.6, ease: 'power3.out', clearProps: 'opacity,x' }, 0.12);
  }

  // Leaving the page with the viewer open (browser Back) must not leave the layout's smooth scroll stopped.
  useEffect(() => {
    const s = state.current;
    return () => { s.tl?.kill(); lenis()?.start(); };
  }, []);

  // The room index marks the chapter that is crossing the middle of the screen.
  useEffect(() => {
    const chapters = document.querySelectorAll<HTMLElement>('[data-chapter]');
    const io = new IntersectionObserver((entries) => entries.forEach((e) => { if (e.isIntersecting) setRoom(Number((e.target as HTMLElement).dataset.chapter)); }), { rootMargin: '-45% 0px -50% 0px' });
    chapters.forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, [images, layout]);

  // Collage drift: each chapter publishes how far it has travelled through the screen (--p, 0 to 1); its photos drift by different amounts. Set straight on the DOM; off with reduced motion.
  useEffect(() => {
    if (layout === 'mosaic' || reduced()) return;
    const rooms = roomsEl.current!;
    rooms.dataset.drift = '';
    let raf = 0;
    const update = () => {
      raf = 0;
      rooms.querySelectorAll<HTMLElement>('[data-chapter]').forEach((c) => {
        const r = c.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) return;
        c.style.setProperty('--p', String(Math.min(1, Math.max(0, (innerHeight - r.top) / (innerHeight + r.height)))));
      });
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll);
    return () => { removeEventListener('scroll', onScroll); removeEventListener('resize', onScroll); cancelAnimationFrame(raf); delete rooms.dataset.drift; };
  }, [images, layout]);

  // Keyboard, Escape (cancel), swipe and resize.
  useEffect(() => {
    const el = dialog.current!;
    let startX = 0;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'ArrowRight') step(1); if (e.key === 'ArrowLeft') step(-1); };
    const onCancel = (e: Event) => { e.preventDefault(); close(); };
    const onDown = (e: PointerEvent) => { startX = e.clientX; };
    const onUp = (e: PointerEvent) => { const dx = e.clientX - startX; if (Math.abs(dx) > 60) step(dx < 0 ? 1 : -1); };
    const onResize = () => { if (el.open) fit(state.current.index); };
    el.addEventListener('keydown', onKey);
    el.addEventListener('cancel', onCancel);
    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointerup', onUp);
    addEventListener('resize', onResize);
    return () => {
      el.removeEventListener('keydown', onKey); el.removeEventListener('cancel', onCancel);
      el.removeEventListener('pointerdown', onDown); el.removeEventListener('pointerup', onUp);
      removeEventListener('resize', onResize);
    };
  });

  return (
    <>
      {layout === 'mosaic' ? (
        // A packed mosaic: the page's script places each tile by its aspect ratio (data-om-ar); without it, plain columns.
        <ul className={styles.mosaic} data-om-grid>
          {images.map((img, index) => (
            <li key={img.src} className={styles.tile} data-om-ar={img.width / img.height} style={{ '--ar': img.width / img.height, '--i': Math.min(index, 14) } as CSSProperties}>
              <button
                ref={(el) => { if (el) thumbs.current[index] = el; }}
                type="button" className={styles.tileBtn} data-cursor="Open" onClick={() => open(index)}
                aria-label={`Open image ${index + 1} of ${images.length}: ${img.alt}`}
              >
                <Image src={img.src} alt="" fill sizes="(min-width: 64em) 30vw, 50vw" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
      <div ref={roomsEl} className={styles.rooms}>
        <nav className={styles.index} aria-label="Rooms">
          <ol>
            {groupByRoom(images).map((g, gi) => (
              <li key={`${g.room}-${gi}`}><a href={`#room-${gi}`} aria-current={room === gi ? 'true' : undefined}><span>{String(gi + 1).padStart(2, '0')}</span>{g.room}</a></li>
            ))}
          </ol>
        </nav>
        <div className={styles.chapters}>
          {groupByRoom(images).map((g, gi) => (
            <section key={`${g.room}-${gi}`} id={`room-${gi}`} data-chapter={gi} aria-label={g.room} className={styles.chapter}>
              <h3 className={styles.chapterName}>{g.room}</h3>
              {g.shots.map(({ img, index }, si) => (
                <button
                  key={img.src}
                  ref={(el) => { if (el) thumbs.current[index] = el; }}
                  type="button" className={`${styles.shot} ${styles[`s${si % 4}`]}`}
                  style={{ '--ar': img.width / img.height } as CSSProperties} data-cursor="Open" onClick={() => open(index)}
                  aria-label={`Open image ${index + 1} of ${images.length}: ${img.alt}`}
                >
                  <Image src={img.src} alt="" fill sizes="(max-width: 767px) 90vw, 50vw" />
                </button>
              ))}
            </section>
          ))}
        </div>
      </div>
      )}

      <dialog ref={dialog} className={styles.viewer} aria-label={`${title}, full screen`} onClick={(e) => { if (e.target === dialog.current || e.target === veil.current) close(); }}>
        <div ref={veil} className={styles.veil} aria-hidden="true" />
        {images.map((img, i) => (
          <figure key={img.src} ref={(f) => { if (f) figs.current[i] = f; }} className={styles.fig} hidden>
            <div className={styles.frame} data-frame>
              <Image src={img.src} alt={img.alt} fill sizes="100vw" />
            </div>
            <figcaption>{img.room ?? img.alt} · {visualisation}</figcaption>
          </figure>
        ))}
        <button type="button" className={`${styles.btn} ${styles.close}`} onClick={close} aria-label="Close" autoFocus><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg></button>
        <button type="button" className={`${styles.btn} ${styles.prev}`} onClick={() => step(-1)} aria-label="Previous image"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg></button>
        <button type="button" className={`${styles.btn} ${styles.next}`} onClick={() => step(1)} aria-label="Next image"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg></button>
      </dialog>
    </>
  );
}
