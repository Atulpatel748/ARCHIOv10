'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

// Smooth scroll (Lenis, driven by GSAP's ticker), scroll reveals and the hero cover effect. Kept deliberately quiet:
//   [data-reveal], [data-split], [data-mask]  a slow fade with a small rise
//   [data-recede]  the hero recedes while the next section slides over it
// Elements already on screen at load are left alone so nothing flashes; reduced motion turns all of it off.
export default function Reveals() {
  const pathname = usePathname();

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const lenis = new Lenis({ lerp: 0.1, anchors: true });
    (window as unknown as { lenis?: Lenis }).lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => { gsap.ticker.remove(tick); lenis.destroy(); };
  }, []);

  useEffect(() => {
    (window as unknown as { lenis?: Lenis }).lenis?.scrollTo(0, { immediate: true });
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const below = (el: Element) => el.getBoundingClientRect().top > window.innerHeight * 0.92;

      const fade = { autoAlpha: 1, y: 0, duration: 1, ease: 'power2.out' };
      const once = (el: Element) => ({ trigger: el, start: 'top 90%', once: true });

      // Split headings keep their word markup (for screen readers and layout) but fade in as one line.
      gsap.utils.toArray<HTMLElement>('[data-reveal], [data-split], [data-mask]').filter(below).forEach((el) => {
        gsap.fromTo(el, { autoAlpha: 0, y: 20 }, { ...fade, scrollTrigger: once(el) });
      });

      // Hero recedes (scales down, fades, drifts up) while the next section slides up over it.
      gsap.utils.toArray<HTMLElement>('[data-recede]').forEach((el) => {
        const next = el.nextElementSibling;
        if (!next || getComputedStyle(el).position !== 'sticky') return; // a hero that is not pinned (portrait project pages) just scrolls
        gsap.to(el.querySelector('[data-recede-inner]') ?? el, {
          scale: 0.92, opacity: 0.35, yPercent: -6, ease: 'none',
          // From the very top (shorter heroes have the next section already on screen) until the next section reaches the top.
          scrollTrigger: { start: 0, end: () => next.getBoundingClientRect().top + window.scrollY, scrub: true },
        });
      });

    });

    const refresh = setTimeout(() => ScrollTrigger.refresh(), 300);
    return () => { clearTimeout(refresh); mm.revert(); };
  }, [pathname]);

  return null;
}
