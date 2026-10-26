'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

// Smooth scroll (Lenis, driven by GSAP's ticker) plus scroll reveals:
//   [data-reveal]  fade and rise      [data-split]  words rise out of a mask
//   [data-mask]    image wipes in     [data-parallax] image drifts while scrolling
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

      // Word spans are rendered by <Split>; only styles are animated here, never the DOM structure.
      gsap.utils.toArray<HTMLElement>('[data-split]').forEach((el) => {
        const words = el.querySelectorAll('.split-word > span');
        const tween = { yPercent: 0, duration: 1.1, ease: 'power4.out', stagger: 0.045 };
        if (below(el)) gsap.fromTo(words, { yPercent: 110 }, { ...tween, scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
        else gsap.fromTo(words, { yPercent: 110 }, { ...tween, delay: 0.25 });
      });

      gsap.utils.toArray<HTMLElement>('[data-reveal]').filter(below).forEach((el) => {
        gsap.fromTo(el, { autoAlpha: 0, y: 32 }, { autoAlpha: 1, y: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
      });

      gsap.utils.toArray<HTMLElement>('[data-mask]').filter(below).forEach((el) => {
        gsap.fromTo(el, { clipPath: 'inset(12% 8% 12% 8%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
      });

      gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach((el) => {
        gsap.fromTo(el, { yPercent: -8 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
      });
    });

    const refresh = setTimeout(() => ScrollTrigger.refresh(), 300);
    return () => { clearTimeout(refresh); mm.revert(); };
  }, [pathname]);

  return null;
}
