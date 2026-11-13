import { useEffect, useRef, type MutableRefObject, type RefObject } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const SPAN = 0.55; // how much of the scroll each photo travels for; the photos start one after another

// The photos fly towards you through a corridor (after "perspective tunnel hero" on 21st.dev) while `root` is pinned. Each photo
// sits on a golden-angle spiral around the middle and travels from far to near.
// `onBest` gets the index of the photo that is halfway along. `group` says which project a photo belongs to: only the photos of
// the project named in the middle show, and a photo passing over the text in the middle (`[data-tunnel-text]`) fades nearly away.
export function useTunnel(root: RefObject<HTMLElement | null>, cards: MutableRefObject<HTMLDivElement[]>, n: number, onBest?: (i: number) => void, group?: (i: number) => number) {
  // Held in refs so new callbacks on each render do not rebuild the ScrollTrigger; render() always calls the latest ones.
  const onBestRef = useRef(onBest);
  useEffect(() => { onBestRef.current = onBest; }, [onBest]);
  const groupRef = useRef(group);
  useEffect(() => { groupRef.current = group; }, [group]);
  useEffect(() => {
    const mid = (i: number) => (i / n) * (1 - SPAN) + SPAN / 2; // progress at which photo i is halfway along its travel
    let w = innerWidth, h = innerHeight, phone = innerWidth < 768, shown = -1;
    // Half the text box's size (it sits in the middle of the stage) and each card's laid-out size; transforms change neither
    let text = { x: 0, y: 0 }, sizes: [number, number][] = [];
    const measure = () => {
      const el = root.current?.querySelector<HTMLElement>('[data-tunnel-text]');
      if (el) text = { x: el.offsetWidth / 2, y: el.offsetHeight / 2 };
      sizes = cards.current.map((c) => [c.offsetWidth, c.offsetHeight]);
    };
    const render = (p: number) => {
      let best = 0;
      for (let i = 1; i < cards.current.length; i++) if (Math.abs(p - mid(i)) < Math.abs(p - mid(best))) best = i;
      const owner = groupRef.current?.(best);
      const persp = phone ? 900 : 1200; // the stage's CSS perspective
      cards.current.forEach((el, i) => {
        const lp = clamp((p - (i / n) * (1 - SPAN)) / SPAN);
        const a = i * 137.5 * (Math.PI / 180);
        const x = Math.cos(a) * w * (0.28 + (i % 3) * 0.08);
        const y = Math.sin(a) * h * (0.26 + (i % 2) * 0.09);
        const z = lerp(phone ? -1200 : -1700, phone ? 350 : 500, lp);
        const rot = (i % 2 ? -1 : 1) * (3 + (i % 5) * 2);
        el.style.transform = `translate3d(calc(-50% + ${x}px), calc(-50% + ${y}px), ${z}px) rotateZ(${rot}deg)`;
        // Where the card lands on screen after perspective, and how much of it covers the text box
        const s = persp / Math.max(1, persp - z);
        const [cw, ch] = sizes[i] ?? [0, 0];
        const ox = Math.max(0, Math.min(x * s + (cw * s) / 2, text.x) - Math.max(x * s - (cw * s) / 2, -text.x));
        const oy = Math.max(0, Math.min(y * s + (ch * s) / 2, text.y) - Math.max(y * s - (ch * s) / 2, -text.y));
        const covers = cw && ch ? (ox * oy) / (cw * ch * s * s) : 0;
        const travel = lp < 0.18 ? lp / 0.18 : lp > 0.82 ? clamp((0.98 - lp) / 0.16) : 1;
        const own = owner === undefined || groupRef.current?.(i) === owner ? 1 : 0;
        el.style.opacity = String(travel * own * (1 - 0.88 * clamp(covers * 2)));
      });
      if (best !== shown) { shown = best; onBestRef.current?.(best); }
    };
    measure();
    render(0);
    const st = ScrollTrigger.create({ trigger: root.current, start: 'top top', end: 'bottom bottom', scrub: true, onUpdate: (self) => render(self.progress) });
    const onResize = () => { w = innerWidth; h = innerHeight; phone = w < 768; measure(); render(st.progress); };
    addEventListener('resize', onResize);
    return () => { removeEventListener('resize', onResize); st.kill(); };
  }, [root, cards, n]);
}
