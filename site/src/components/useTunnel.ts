import { useEffect, useRef, type MutableRefObject, type RefObject } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const SPAN = 0.55; // how much of the scroll each photo travels for; the photos start one after another

// The photos fly towards you through a corridor (after "perspective tunnel hero" on 21st.dev) while `root` is pinned. Each photo
// sits on a golden-angle spiral around the middle and travels from far to near. `startAt` begins the journey part-way, so the
// first photos are already on their way when the page opens. `onBest` gets the index of the photo that is halfway along.
export function useTunnel(root: RefObject<HTMLElement | null>, cards: MutableRefObject<HTMLDivElement[]>, n: number, startAt = 0, onBest?: (i: number) => void) {
  const onBestRef = useRef(onBest);
  useEffect(() => { onBestRef.current = onBest; });
  useEffect(() => {
    const mid = (i: number) => (i / n) * (1 - SPAN) + SPAN / 2; // progress at which photo i is halfway along its travel
    let w = innerWidth, h = innerHeight, phone = innerWidth < 768, shown = -1;
    const render = (progress: number) => {
      const p = startAt + (1 - startAt) * progress;
      let best = 0;
      cards.current.forEach((el, i) => {
        const lp = clamp((p - (i / n) * (1 - SPAN)) / SPAN);
        if (Math.abs(p - mid(i)) < Math.abs(p - mid(best))) best = i;
        const a = i * 137.5 * (Math.PI / 180);
        const x = Math.cos(a) * w * (0.28 + (i % 3) * 0.08);
        const y = Math.sin(a) * h * (0.26 + (i % 2) * 0.09);
        const z = lerp(phone ? -1200 : -1700, phone ? 350 : 500, lp);
        const rot = (i % 2 ? -1 : 1) * (3 + (i % 5) * 2);
        el.style.transform = `translate3d(calc(-50% + ${x}px), calc(-50% + ${y}px), ${z}px) rotateZ(${rot}deg)`;
        el.style.opacity = String(lp < 0.18 ? lp / 0.18 : lp > 0.82 ? clamp((0.98 - lp) / 0.16) : 1);
      });
      if (best !== shown) { shown = best; onBestRef.current?.(best); }
    };
    render(0);
    const st = ScrollTrigger.create({ trigger: root.current, start: 'top top', end: 'bottom bottom', scrub: true, onUpdate: (self) => render(self.progress) });
    const onResize = () => { w = innerWidth; h = innerHeight; phone = w < 768; render(st.progress); };
    addEventListener('resize', onResize);
    return () => { removeEventListener('resize', onResize); st.kill(); };
  }, [root, cards, n, startAt]);
}
