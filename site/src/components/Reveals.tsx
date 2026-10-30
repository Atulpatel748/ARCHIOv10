'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

// Smooth scroll (Lenis, driven by GSAP's ticker), scroll reveals and the hero cover effect. Kept deliberately quiet:
//   [data-reveal], [data-split], [data-mask]  a slow fade with a small rise
//   [data-recede]  the hero recedes while the next section slides over it
// Elements already on screen at load are left alone so nothing flashes; reduced motion turns all of it off.
// gsap, ScrollTrigger and Lenis are about 59 KB compressed, so they are fetched when the browser is idle, not in the first load.
// Everything below the first screen is still visible until they arrive; the reveals then hide it only if it is off screen.
type Libs = { gsap: typeof import('gsap').gsap; ScrollTrigger: typeof import('gsap/ScrollTrigger').ScrollTrigger; Lenis: typeof import('lenis').default };
let loading: Promise<Libs> | undefined;
const load = () => (loading ??= Promise.all([import('gsap'), import('gsap/ScrollTrigger'), import('lenis')]).then(([g, s, l]) => {
  g.gsap.registerPlugin(s.ScrollTrigger);
  return { gsap: g.gsap, ScrollTrigger: s.ScrollTrigger, Lenis: l.default };
}));
const whenIdle = (fn: () => void) => {
  if ('requestIdleCallback' in window) { const id = requestIdleCallback(fn, { timeout: 1500 }); return () => cancelIdleCallback(id); }
  const id = setTimeout(fn, 300);
  return () => clearTimeout(id);
};

type LenisLike = { scrollTo(y: number, o?: { immediate?: boolean }): void };

export default function Reveals() {
  const pathname = usePathname();
  const popped = useRef<string | null>(null);

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let off: (() => void) | undefined;
    let dead = false;
    const cancelIdle = whenIdle(() => load().then(({ gsap, ScrollTrigger, Lenis }) => {
      if (dead) return;
      const lenis = new Lenis({ lerp: 0.1, anchors: true });
      (window as unknown as { lenis?: unknown }).lenis = lenis;
      lenis.on('scroll', ScrollTrigger.update);
      const tick = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
      off = () => { gsap.ticker.remove(tick); lenis.destroy(); delete (window as unknown as { lenis?: unknown }).lenis; };
    }));
    return () => { dead = true; cancelIdle(); off?.(); };
  }, []);

  // Back/forward restores its own scroll position, so it is not reset to the top.
  useEffect(() => {
    const onPop = () => { popped.current = location.pathname; };
    addEventListener('popstate', onPop);
    return () => removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    if (popped.current !== pathname && !location.hash) (window as unknown as { lenis?: LenisLike }).lenis?.scrollTo(0, { immediate: true });
    popped.current = null;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let revert: (() => void) | undefined;
    let dead = false;
    let refresh: ReturnType<typeof setTimeout> | undefined;
    const cancelIdle = whenIdle(() => load().then(({ gsap, ScrollTrigger }) => {
      if (dead) return;
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const below = (el: Element) => el.getBoundingClientRect().top > window.innerHeight * 0.92;

        // opacity, not autoAlpha: visibility:hidden would take headings and links out of the accessibility tree until scrolled to.
        const fade = { opacity: 1, y: 0, duration: 1, ease: 'power2.out' };
        const once = (el: Element) => ({ trigger: el, start: 'top 90%', once: true });

        // Split headings keep their word markup (for screen readers and layout) but fade in as one line.
        gsap.utils.toArray<HTMLElement>('[data-reveal], [data-split], [data-mask]').filter(below).forEach((el) => {
          gsap.fromTo(el, { opacity: 0, y: 20 }, { ...fade, scrollTrigger: once(el) });
        });

        // Hero recedes (scales down, fades, drifts up) while the next section slides up over it. Once the next section has
        // covered it completely the hero is inert, so keyboard focus cannot land on controls nobody can see.
        const heroes = gsap.utils.toArray<HTMLElement>('[data-recede]');
        heroes.forEach((el) => {
          const next = el.nextElementSibling;
          if (!next || getComputedStyle(el).position !== 'sticky') return; // a hero that is not pinned (portrait project pages) just scrolls
          gsap.to(el.querySelector('[data-recede-inner]') ?? el, {
            scale: 0.92, opacity: 0.35, yPercent: -6, ease: 'none',
            // From the very top (shorter heroes have the next section already on screen) until the next section reaches the top.
            scrollTrigger: {
              start: 0, end: () => next.getBoundingClientRect().top + window.scrollY, scrub: true,
              onLeave: () => el.setAttribute('inert', ''),
              onEnterBack: () => el.removeAttribute('inert'),
            },
          });
        });
        return () => heroes.forEach((el) => el.removeAttribute('inert'));
      });
      revert = () => mm.revert();
      refresh = setTimeout(() => ScrollTrigger.refresh(), 300);
    }));
    return () => { dead = true; cancelIdle(); clearTimeout(refresh); revert?.(); };
  }, [pathname]);

  return null;
}
