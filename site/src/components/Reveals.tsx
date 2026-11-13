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
}).catch((error: unknown) => { loading = undefined; throw error; })); // a failed download (flaky network, a deploy mid-visit) is tried again on the next page
const whenIdle = (fn: () => void) => {
  if ('requestIdleCallback' in window) { const id = requestIdleCallback(fn, { timeout: 1500 }); return () => cancelIdleCallback(id); }
  const id = setTimeout(fn, 300);
  return () => clearTimeout(id);
};

type LenisLike = { scrollTo(target: number | HTMLElement, o?: { immediate?: boolean; offset?: number }): void; isScrolling: false | string; targetScroll: number };

export default function Reveals() {
  const pathname = usePathname();
  const popped = useRef<string | null>(null);
  const restoring = useRef(0); // until when (performance.now) a Back/Forward restore is still putting the scroll back

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
      // Lenis ignores scroll-padding, so a field reached with Tab or Shift+Tab could end up under the header or off screen (WCAG 2.4.11).
      const onFocus = (e: FocusEvent) => {
        const el = e.target as HTMLElement;
        if (!el.closest?.('main') || el.closest('[data-recede], [data-seq]') || !el.matches('input, textarea, select, button, a')) return; // pinned scenes and the sticky hero scroll themselves
        // On phones a project's room list is a bar of chips that sticks under the header: leave room for it too
        const rooms = document.querySelector<HTMLElement>('nav[aria-label="Rooms"]');
        const bar = rooms && getComputedStyle(rooms).position === 'sticky' && rooms.offsetWidth > innerWidth * 0.8 ? rooms.offsetHeight : 0;
        const head = (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 80) + 24 + bar;
        const fix = () => {
          const r = el.getBoundingClientRect();
          if (r.top < head || r.bottom > innerHeight - 24) lenis.scrollTo(el, { offset: -head }); // the bottom edge counts too: a field half off the screen is not visible
        };
        fix();
        setTimeout(fix, 800); // and again once content that opens or moves on focus (the stage panels) has finished its transition
      };
      addEventListener('focusin', onFocus);
      off = () => { removeEventListener('focusin', onFocus); gsap.ticker.remove(tick); lenis.destroy(); delete (window as unknown as { lenis?: unknown }).lenis; };
    }).catch(() => undefined)); // without the libraries the page scrolls natively and nothing is hidden
    return () => { dead = true; cancelIdle(); off?.(); };
  }, []);

  // Back and forward: the browser and Next restore the scroll on their own schedule (late on a slow device) and before the pinned sections
  // have their full height, so it lands too high. Remember where you were on each page (see below) and keep putting it back for a moment,
  // until the visitor scrolls themselves. This runs on the popstate itself, not on the page change, so it also covers a quick Back.
  useEffect(() => {
    const events = ['wheel', 'touchstart', 'keydown', 'pointerdown'];
    let timer: ReturnType<typeof setInterval> | undefined;
    let moved = false;
    const mine = () => { moved = true; };
    const stop = () => { clearInterval(timer); restoring.current = 0; events.forEach((e) => removeEventListener(e, mine)); };
    const onPop = () => {
      popped.current = location.pathname; // not reset to the top
      stop();
      if (matchMedia('(prefers-reduced-motion: reduce)').matches || location.hash) return;
      let saved = NaN;
      try { saved = parseFloat(sessionStorage.getItem(`archio-y:${location.pathname}`) ?? ''); } catch { saved = NaN; } // private mode: the browser's own restore stays
      if (!(saved > 0)) return;
      moved = false;
      const since = performance.now();
      restoring.current = since + 2500;
      events.forEach((e) => addEventListener(e, mine, { once: true, passive: true }));
      timer = setInterval(() => {
        if (moved || performance.now() - since > 2500) { stop(); return; }
        if (Math.abs(scrollY - saved) <= 8) return;
        const l = (window as unknown as { lenis?: LenisLike }).lenis;
        if (l) l.scrollTo(saved, { immediate: true }); else scrollTo(0, saved);
      }, 100);
    };
    addEventListener('popstate', onPop);
    return () => { removeEventListener('popstate', onPop); stop(); };
  }, []);

  useEffect(() => {
    if (popped.current !== pathname && !location.hash) (window as unknown as { lenis?: LenisLike }).lenis?.scrollTo(0, { immediate: true });
    popped.current = null;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // Remember where you are on each page, for Back (see above). A scroll made while a restore is under way, or by the page change itself, is not where you were.
    const key = `archio-y:${pathname}`;
    let keepFrame = 0;
    const keep = () => {
      keepFrame ||= requestAnimationFrame(() => {
        keepFrame = 0;
        if (performance.now() < restoring.current || location.pathname !== pathname) return;
        try { sessionStorage.setItem(key, String(Math.round(scrollY))); } catch { return; } // private mode
      });
    };
    addEventListener('scroll', keep, { passive: true });
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
      refresh = setTimeout(() => {
        // The refresh measures from the top and puts back the scroll it found, which cuts short a jump still under way: a #room
        // deep link (the browser's own smooth scroll) or an early click on a room link (Lenis). Finish whichever it was.
        const lenis = (window as unknown as { lenis?: LenisLike }).lenis;
        const goal = lenis?.isScrolling === 'smooth' ? lenis.targetScroll : undefined;
        ScrollTrigger.refresh();
        const target = location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1)));
        if (lenis && goal !== undefined) lenis.scrollTo(goal);
        else if (target) lenis?.scrollTo(target, { immediate: true, offset: -parseFloat(getComputedStyle(target).scrollMarginTop) || 0 });
      }, 300);
    }).catch(() => undefined));
    return () => {
      dead = true; cancelIdle(); clearTimeout(refresh); revert?.();
      removeEventListener('scroll', keep); cancelAnimationFrame(keepFrame);
    };
  }, [pathname]);

  return null;
}
