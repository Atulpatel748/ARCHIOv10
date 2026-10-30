'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './Preloader.module.scss';

// A furnished room drawn in thin lines, in four passes, while the wordmark fills in and warm light gathers in the arched doorway.
// It covers the first screen on every full page load, so nobody sees the page half-loaded. Once the fonts and the eager
// (above-the-fold) images are in, and at least 2 s after the page started (no minimum with reduced motion; at most 4 s), the doorway opens: it grows, keeping its
// arch shape, until it fills the screen. Client-side navigation keeps the layout, so it never shows again until the next full load.

// [pass, path] in a 1440 x 900 drawing; the doorway is the arch from (600, 640) up to (720, 300) and back down to (840, 640).
const LINES: [1 | 2 | 3 | 4, string][] = [
  // 1: the room and the arch
  [1, 'M470 250H970V640H470Z'],
  [1, 'M470 250L0 0M970 250L1440 0M470 640L0 900M970 640L1440 900'],
  [1, 'M600 640V420A120 120 0 0 1 840 420V640'],
  [1, 'M614 640V420A106 106 0 0 1 826 420V640'],
  [1, 'M588 640V420A132 132 0 0 1 852 420V640'],
  // 2: ceiling beams and cornice, floor boards, threshold, wall panels, niches
  [2, 'M570 250L378 0M670 250L606 0M770 250L834 0M870 250L1062 0M226 120H1214M357 190H1083M470 262H970'],
  [2, 'M570 640L370 900M670 640L603 900M770 640L837 900M870 640L1070 900M620 640L487 900M720 652V900M820 640L953 900M361 700H1079M217 780H1223M90 850H1350'],
  [2, 'M590 652H850M600 640L590 652M840 640L850 652'],
  [2, 'M495 280H580V560H495ZM507 292H568V548H507ZM860 280H945V560H860ZM872 292H933V548H872ZM470 626H588M852 626H970'],
  [2, 'M300 690V300A60 60 0 0 1 400 270V650M1140 690V300A60 60 0 0 0 1040 270V650'],
  // 3: pendant lamp, sofa, plant, shelves, rug, table, art, window, armchair, floor lamp, light spilling from the doorway
  [3, 'M720 0V190M688 190Q720 150 752 190ZM712 196A8 8 0 0 0 728 196'],
  [3, 'M490 640V600H588V640M494 600V578Q494 572 500 572H578Q584 572 584 578V600M490 614H588M539 572V600'],
  [3, 'M872 640L866 604H912L906 640M889 604C884 570 868 552 852 540M889 604C892 566 904 548 922 532M889 604C888 576 890 556 888 528M889 604C880 586 864 584 850 586M889 604C898 588 914 586 928 590'],
  [3, 'M300 470L400 462M300 560L400 556M336 469C330 455 334 445 342 440H350C358 445 362 455 356 468M330 559A20 8 0 0 0 370 558'],
  [3, 'M1040 462L1140 470M1040 556L1140 560M1092 440A14 14 0 1 0 1092 412A14 14 0 1 0 1092 440M1086 465H1098V440'],
  [3, 'M470 770A250 46 0 1 0 970 770A250 46 0 1 0 470 770M520 770A200 34 0 1 0 920 770A200 34 0 1 0 520 770'],
  [3, 'M640 720A80 16 0 1 0 800 720A80 16 0 1 0 640 720M662 728V772M778 728V772M720 736V782'],
  [3, 'M120 310L230 331V480L120 487ZM134 324L216 339V468L134 474Z'],
  [3, 'M1210 285L1320 256V541L1210 526ZM1265 271V533M1210 409L1320 403'],
  [3, 'M228 900V826Q228 796 258 796H352Q382 796 382 826V900M218 846H392M240 846V900M370 846V900'],
  [3, 'M1236 900V612M1204 612L1220 566H1252L1268 612ZM1218 900H1254'],
  [3, 'M600 640L556 706M840 640L884 706'],
  // 4: ceiling spotlights, cushions, the art's brushstrokes, curtains, books, a vase of branches on the table
  [4, 'M516 95A4 4 0 1 0 524 95A4 4 0 1 0 516 95M916 95A4 4 0 1 0 924 95A4 4 0 1 0 916 95M606 175A4 4 0 1 0 614 175A4 4 0 1 0 606 175M826 175A4 4 0 1 0 834 175A4 4 0 1 0 826 175'],
  [4, 'M500 588Q511 580 522 588M556 588Q566 580 576 588'],
  [4, 'M142 440C162 400 186 424 208 384M150 456C170 436 190 448 206 430'],
  [4, 'M1198 270C1192 370 1202 470 1194 572M1334 236C1328 370 1340 480 1332 600'],
  [4, 'M1050 556V530M1058 556V534M1066 556V528M1074 556L1080 532'],
  [4, 'M712 712C708 700 712 692 716 688H724C728 692 732 700 728 712M718 688C714 670 704 660 696 650M722 688C726 668 736 660 746 648M720 688V660'],
];
const DOOR = 'M600 640V420A120 120 0 0 1 840 420V640Z';
const OPEN_MS = 1300;

// Grow the doorway until it covers the screen, using only GPU work (transform and opacity) so it stays smooth. The doorway is an
// arch-shaped box holding warm light and, when the page has a photo behind the doorway, a copy of it; the box scales by s while the
// copy scales by 1/s around the same point, so the photo holds still and only the arch grows. s rises in log space, which reads as
// an even speed. Without a photo the light itself fills the screen and then fades away.
function openDoorway(root: HTMLDivElement, room: SVGSVGElement, door: SVGPathElement, win: HTMLDivElement, light: HTMLDivElement): Promise<unknown> {
  const fadeOut = (delay: number) => root.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, delay, easing: 'ease', fill: 'forwards' }).finished;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return fadeOut(0);

  const r = door.getBoundingClientRect();
  const cx = r.left + r.width / 2, cy = r.top + r.height / 2, half = r.width / 2;
  Object.assign(win.style, { left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px`, borderRadius: `${half}px ${half}px 0 0`, visibility: 'visible' });

  const inArch = (x: number, y: number, s: number) => {
    x /= s; y /= s;
    const top = -r.height / 2 + half; // the centre of the arch's round top, relative to the box centre
    return Math.abs(x) <= half && y <= r.height / 2 && (y >= top || Math.hypot(x, y - top) <= half);
  };
  const corners = [[-cx, -cy], [innerWidth - cx, -cy], [-cx, innerHeight - cy], [innerWidth - cx, innerHeight - cy]];
  let end = 1;
  while (!corners.every(([x, y]) => inArch(x, y, end))) end *= 1.02;

  const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const steps = Array.from({ length: 61 }, (_, i) => Math.pow(end, ease(i / 60)));
  const timing: KeyframeAnimationOptions = { duration: OPEN_MS, fill: 'forwards' };
  win.animate(steps.map((s) => ({ transform: `scale(${s})` })), timing);
  room.style.transformOrigin = `${cx}px ${cy}px`;
  room.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.08)' }], { ...timing, easing: 'cubic-bezier(0.65, 0, 0.35, 1)' });

  // The page's photo behind the doorway, if there is one (the hero on the home and project pages)
  const photo = [...document.querySelectorAll<HTMLImageElement>('#main img:not([loading="lazy"])')].find((img) => {
    const b = img.getBoundingClientRect();
    return img.complete && img.naturalWidth > 0 && b.left <= cx && b.right >= cx && b.top <= cy && b.bottom >= cy;
  });
  if (photo) {
    // The copy is drawn on a canvas, not an <img>: a late image this size would count as the page's Largest Contentful Paint.
    const b = photo.getBoundingClientRect();
    const { objectFit, objectPosition } = getComputedStyle(photo);
    const [px, py] = objectPosition.split(' ').map((v) => (v.endsWith('%') ? parseFloat(v) / 100 : 0.5));
    const dpr = Math.min(devicePixelRatio, 2);
    const copy = document.createElement('canvas');
    copy.width = Math.round(b.width * dpr);
    copy.height = Math.round(b.height * dpr);
    const fit = (objectFit === 'contain' ? Math.min : Math.max)(copy.width / photo.naturalWidth, copy.height / photo.naturalHeight);
    const [dw, dh] = [photo.naturalWidth * fit, photo.naturalHeight * fit];
    copy.getContext('2d')?.drawImage(photo, (copy.width - dw) * px, (copy.height - dh) * py, dw, dh);
    Object.assign(copy.style, {
      left: `${b.left - r.left}px`, top: `${b.top - r.top}px`, width: `${b.width}px`, height: `${b.height}px`,
      transformOrigin: `${cx - b.left}px ${cy - b.top}px`,
    });
    win.prepend(copy);
    copy.animate(steps.map((s) => ({ transform: `scale(${1 / s})` })), timing);
    light.animate([{ opacity: 1 }, { opacity: 0 }], { duration: OPEN_MS * 0.55, easing: 'cubic-bezier(0.4, 0, 0.6, 1)', fill: 'forwards' });
  }
  return fadeOut(OPEN_MS - 150);
}

export default function Preloader() {
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const roomRef = useRef<SVGSVGElement>(null);
  const doorRef = useRef<SVGPathElement>(null);
  const winRef = useRef<HTMLDivElement>(null);
  const lightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (document.documentElement.hasAttribute('data-no-preloader')) return; // not the landing page, or not the first time in this tab: the CSS keeps the overlay hidden
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    // The overlay is only aria-hidden, so keyboard focus would walk into links hidden behind it: make the page inert until it leaves.
    const covered = [...document.querySelectorAll<HTMLElement>('header, main, footer')];
    covered.forEach((el) => el.setAttribute('inert', ''));
    const release = () => covered.forEach((el) => el.removeAttribute('inert'));
    const until = (ms: number) => new Promise((r) => setTimeout(r, ms - performance.now())); // ms counted from the page's start
    const imgs = [...document.querySelectorAll<HTMLImageElement>('#main img:not([loading="lazy"])')];
    // allSettled: an image that fails to decode only stops being waited for; it must not keep the overlay up (or open it early).
    // With reduced motion there is no drawing to watch, so the 2 s minimum is skipped and the overlay leaves as soon as the page is ready.
    const minimum = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 2000;
    const ready = Promise.all([document.fonts.ready, Promise.allSettled(imgs.map((img) => img.decode())), until(minimum)]);
    Promise.race([ready, until(4000)]).then(() => {
      if (cancelled) return;
      setLeaving(true); // the wordmark fades first
      timer = setTimeout(() => {
        const [root, room, door, win, light] = [rootRef.current, roomRef.current, doorRef.current, winRef.current, lightRef.current];
        const finish = () => { release(); setGone(true); dispatchEvent(new Event('preloader:done')); }; // the hero's WebGL waits for this
        if (root && room && door && win && light) openDoorway(root, room, door, win, light).then(finish, finish);
        else finish();
      }, 200);
    });
    return () => { cancelled = true; clearTimeout(timer); release(); };
  }, []);

  if (gone) return null;
  return (
    <div ref={rootRef} className={`${styles.preloader} ${leaving ? styles.leaving : ''}`} data-preloader aria-hidden="true">
      <svg ref={roomRef} className={styles.room} viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id="preloader-light" cx="0.5" cy="0.75" r="0.75"><stop offset="0" stopColor="#EEDFC8" /><stop offset="1" stopColor="#F8F7F4" /></radialGradient>
        </defs>
        <g className={styles.tone}>
          <path fill="#F3F0EA" d="M0 0H1440L970 250H470Z" />
          <path fill="#EEEAE2" d="M0 0L470 250V640L0 900ZM1440 0L970 250V640L1440 900Z" />
          <path fill="#EAE3D8" d="M0 900L470 640H970L1440 900Z" />
        </g>
        <path ref={doorRef} className={styles.door} d={DOOR} />
        <g className={styles.ln}>
          {LINES.map(([pass, d]) => <path key={d} className={styles[`s${pass}`]} pathLength={1} d={d} />)}
        </g>
      </svg>
      <div ref={winRef} className={styles.win}><div ref={lightRef} className={styles.light} /></div>
      <div className={styles.center}>
        <span className={styles.mark}>
          <span className={`logo logo--wordmark ${styles.ghost}`} />
          <span className={`logo logo--wordmark ${styles.fill}`} />
        </span>
      </div>
    </div>
  );
}
