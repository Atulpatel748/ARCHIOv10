'use client';

import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Gallery from '@/components/Gallery';
import type { Project } from '@/content/projects';
import styles from './Work.module.scss';

const FILTERS = ['All', 'Residential', 'Commercial', 'Landscape'] as const;

// Lays the tiles out in columns of equal width (each tile as tall as its image's aspect ratio makes it) and ends every column
// at the same level: tiles go, in order, into the shortest column; the last few are placed by trying every arrangement and
// keeping the one with the least difference in column heights; a shorter column spreads its tiles apart a little (as on Wood
// & Weave) and any gap still left is made up by stretching its tiles, cropping each image by a hair. When that would crop
// too much (too few tiles to fill the columns evenly), the tiles go into rows of equal height instead.
const MAX_CROP = 0.15;

function pack(grid: HTMLElement): number {
  const items = Array.from(grid.children) as HTMLElement[];
  const cs = getComputedStyle(grid);
  const cols = matchMedia('(min-width: 64em)').matches ? 3 : 2; // not read from the style: once laid out, column-count is auto
  const gap = parseFloat(cs.columnGap) || 0;
  const width = grid.clientWidth;
  const ar = items.map((e) => Number(e.dataset.omAr) || 1);
  const n = items.length;
  const set = (el: HTMLElement, x: number, y: number, w: number, h: number) => {
    el.style.left = `${x}px`; el.style.top = `${y}px`; el.style.width = `${w}px`; el.style.height = `${h}px`;
  };
  const finish = (total: number) => { grid.style.height = `${total}px`; grid.classList.add('is-laid'); return total; };

  // Rows of equal height, each filling the width (the last row keeps the target height and sits at the left)
  const rows = () => {
    const target = innerWidth < 768 ? 150 : innerWidth < 1280 ? 210 : 250;
    let y = 0;
    for (let at = 0; at < n;) {
      let end = at;
      let sum = 0;
      while (end < n) {
        sum += ar[end];
        end++;
        if (sum * target + gap * (end - at - 1) >= width) break;
      }
      const count = end - at;
      const full = sum * target + gap * (count - 1) >= width;
      const h = full ? (width - gap * (count - 1)) / sum : target;
      let x = 0;
      for (let i = at; i < end; i++) { set(items[i], x, y, ar[i] * h, h); x += ar[i] * h + gap; }
      y += h + gap;
      at = end;
    }
    return finish(Math.max(0, y - gap));
  };
  if (n <= cols) return rows();

  const w = (width - gap * (cols - 1)) / cols;
  const heights = ar.map((a) => w / a);
  const colOf = new Array<number>(n).fill(0);
  const colH = new Array<number>(cols).fill(0);
  const tail = Math.min(n, n <= 10 ? n : cols === 2 ? 10 : 8);
  const head = n - tail;
  for (let i = 0; i < head; i++) {
    let c = 0;
    for (let k = 1; k < cols; k++) if (colH[k] < colH[c] - 0.5) c = k;
    colOf[i] = c;
    colH[c] += heights[i] + gap;
  }
  let best = 0;
  let bestSpread = Infinity;
  for (let mask = 0; mask < cols ** tail; mask++) {
    const t = colH.slice();
    for (let k = 0, x = mask; k < tail; k++, x = Math.floor(x / cols)) t[x % cols] += heights[head + k] + gap;
    const spread = Math.max(...t) - Math.min(...t);
    if (spread < bestSpread - 0.5) { bestSpread = spread; best = mask; }
  }
  for (let k = 0, x = best; k < tail; k++, x = Math.floor(x / cols)) {
    colOf[head + k] = x % cols;
    colH[x % cols] += heights[head + k] + gap;
  }

  const total = Math.max(...colH) - gap;
  const sum = new Array<number>(cols).fill(0);
  const count = new Array<number>(cols).fill(0);
  colOf.forEach((c, i) => { sum[c] += heights[i]; count[c]++; });
  const spread = sum.map((s, c) => (count[c] > 1 ? Math.min((total - (s + gap * (count[c] - 1))) / (count[c] - 1), gap * 0.8) : 0));
  const stretch = sum.map((s, c) => (count[c] ? (total - (gap + Math.max(0, spread[c])) * (count[c] - 1)) / s : 1));
  if (stretch.some((k) => Math.abs(k - 1) > MAX_CROP)) return rows();

  const top = new Array<number>(cols).fill(0);
  items.forEach((el, i) => {
    const c = colOf[i];
    const g = gap + Math.max(0, spread[c]);
    const h = heights[i] * stretch[c];
    set(el, c * (w + gap), top[c], w, h);
    top[c] += h + g;
  });
  return finish(total);
}

// "More of the work, room by room": every image of every project in one packed mosaic, filtered by category.
export default function Mosaic({ projects }: { projects: Project[] }) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All');
  const wrap = useRef<HTMLDivElement>(null);
  const all = useMemo(() => projects.flatMap((p) => p.gallery.map((img) => ({ img, category: p.category }))), [projects]);
  const shown = all.filter((x) => filter === 'All' || x.category === filter).map((x) => x.img);

  useLayoutEffect(() => {
    const grid = wrap.current?.querySelector<HTMLElement>('[data-om-grid]');
    if (!grid) return;
    let last = 0;
    const run = () => {
      const total = pack(grid);
      if (Math.abs(total - last) > 1) ScrollTrigger.refresh();
      last = total;
    };
    run();
    let width = grid.clientWidth;
    const ro = new ResizeObserver(() => { if (grid.clientWidth !== width) { width = grid.clientWidth; run(); } });
    ro.observe(grid);
    return () => ro.disconnect();
  }, [filter]);

  return (
    <section className={`container ${styles.om}`} aria-label="More of the work, room by room">
      <div className={styles.omHead}>
        <p className="label" data-reveal>Rooms</p>
        <h2 className={styles.omTitle} data-reveal>More of the work, room by room.</h2>
      </div>
      <div className={styles.omFilters} role="group" aria-label="Filter images by category" data-reveal>
        {FILTERS.map((f) => (
          <button key={f} type="button" className={styles.omFilter} aria-pressed={filter === f} onClick={() => setFilter(f)}>{f}</button>
        ))}
      </div>
      <p className="visually-hidden" aria-live="polite">{shown.length} images shown</p>
      <div ref={wrap}>
        <Gallery key={filter} images={shown} title="Projects" layout="mosaic" />
      </div>
    </section>
  );
}
