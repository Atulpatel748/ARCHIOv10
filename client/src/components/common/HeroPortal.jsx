import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router';
import { HERO } from '../../constants/content.js';
import { ROUTES } from '../../constants/routes.js';
import { modernImageUrl } from '../../utils/images.js';
import { holdPreloader, releasePreloader } from '../../utils/preloader.js';
import ArrowIcon from '../ui/ArrowIcon.jsx';
import MorphGallery from '../ui/morph-gallery';

const INTERVAL_MS = 6000;
const SLIDE_COUNT = 5;
// How far each photo is pulled back from a tight crop (0 = full-screen crop, 1 = whole photo). Kept close to 0 so the
// photo fills the screen; any edge it leaves is filled with a blurred copy of the same photo.
const PHOTO_FIT = 0.08;

// How far above the header the bottom row starts to fade, so it is gone by the time it would touch the header links.
const BASE_FADE_PX = 64;

const prefersReducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

const PinIcon = () => (
  <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false">
    <path d="M8 14.5s4.5-4.2 4.5-7.8a4.5 4.5 0 0 0-9 0c0 3.6 4.5 7.8 4.5 7.8z" fill="none" stroke="currentColor" strokeWidth="1.2" />
    <circle cx="8" cy="6.7" r="1.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
  </svg>
);

// Home hero: a full-screen photo gallery running up behind the (clear) header, with the wordmark in the middle
// and the featured project at the bottom.
export default function HeroPortal({ projects }) {
  const slides = useMemo(() => (projects ?? []).slice(0, SLIDE_COUNT), [projects]);
  const count = slides.length;
  const [index, setIndex] = useState(0);
  // The photos change by themselves, so there must be a way to stop them (WCAG 2.2.2). With reduced motion they never
  // start, and the control is not shown.
  const [reducedMotion] = useState(prefersReducedMotion);
  const [playing, setPlaying] = useState(true);
  const rotates = !reducedMotion && count > 1;
  const descriptorRef = useRef(null);
  const wordmarkRef = useRef(null);

  // The hero fills the screen, so ask for a photo as wide as the screen is in device pixels (the largest size made, at most).
  const [wantedWidth] = useState(() => Math.round(window.innerWidth * (window.devicePixelRatio || 1)));
  // The AVIF twin of each photo is a fraction of the JPEG's size; WebGL can read either. A browser that cannot decode
  // AVIF falls back to the JPEG.
  const items = useMemo(
    () => slides.map((project) => {
      const avif = modernImageUrl(project.coverImage.url, wantedWidth);
      return { src: avif ?? project.coverImage.url, fallbackSrc: avif ? project.coverImage.url : undefined, alt: project.coverImage.alt };
    }),
    [slides, wantedWidth],
  );

  // The loading screen waits for the first photo to be on screen, so the visitor never sees the black box the gallery
  // sits on while it loads. With no photos there is nothing to wait for. (A time limit in utils/preloader.js means a
  // photo that never loads cannot trap the visitor.)
  const hasPhotos = count > 0;
  useLayoutEffect(() => {
    if (!hasPhotos) return undefined;
    holdPreloader('hero');
    return () => releasePreloader('hero');
  }, [hasPhotos]);

  const releaseWhenPhotoShows = useCallback(() => releasePreloader('hero'), []);

  // The slideshow only runs while the hero is on screen: scrolled away, a dissolve nobody sees would still keep the GPU
  // busy every few seconds (and drain a phone's battery). Without IntersectionObserver it simply always runs.
  const heroRef = useRef(null);
  const [inView, setInView] = useState(true);
  useEffect(() => {
    const hero = heroRef.current;
    if (!rotates || !hero || typeof IntersectionObserver === 'undefined') return undefined;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    observer.observe(hero);
    return () => observer.disconnect();
  }, [rotates]);

  useEffect(() => {
    if (!rotates || !playing || !inView) return undefined;
    const timer = setInterval(() => { if (!document.hidden) setIndex((value) => (value + 1) % count); }, INTERVAL_MS);
    return () => clearInterval(timer);
  }, [rotates, playing, inView, count]);

  // The big wordmark travels up with the scroll and lands on the header's wordmark (the same artwork), then fades into it.
  // Until it lands the header logo is hidden (html[data-hero-undocked], see site.css). The studio line under it rides up
  // with it and fades out at the same pace, so it is gone exactly when the wordmark has landed.
  useEffect(() => {
    const wordmark = wordmarkRef.current;
    const slot = wordmark?.parentElement;
    const descriptor = descriptorRef.current;
    const descriptorSlot = descriptor?.parentElement;
    const header = document.querySelector('.site-header');
    const headerBrand = header?.querySelector('.brand');
    const hero = wordmark?.closest('.hero-portal');
    if (!wordmark || !slot || !descriptor || !descriptorSlot || !headerBrand || !hero) return undefined;

    const root = document.documentElement;
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let start;
    let target;
    let endScroll;
    let frame = 0;

    // The big wordmark is position: fixed, so scrolling cannot pull it out of line with the header logo (a transform that is
    // corrected on every scroll event trails the page by a frame). Its slot keeps the room it takes in the hero.
    const measure = () => {
      for (const property of ['position', 'left', 'top', 'transform']) wordmark.style.removeProperty(property);
      for (const property of ['position', 'left', 'top', 'transform', 'width']) descriptor.style.removeProperty(property);
      for (const box of [slot, descriptorSlot]) {
        box.style.removeProperty('width');
        box.style.removeProperty('height');
      }
      const rect = wordmark.getBoundingClientRect();
      const headerRect = headerBrand.getBoundingClientRect();
      start = { x: rect.left + rect.width / 2 + window.scrollX, y: rect.top + rect.height / 2 + window.scrollY, width: rect.width };
      target = { x: headerRect.left + headerRect.width / 2, y: headerRect.top + headerRect.height / 2, width: headerRect.width };
      endScroll = Math.max(1, hero.getBoundingClientRect().bottom + window.scrollY - header.getBoundingClientRect().height);
      if (motionPreference.matches) return; // with reduced motion the wordmark simply scrolls away with the hero
      slot.style.width = `${rect.width}px`;
      slot.style.height = `${rect.height}px`;
      wordmark.style.position = 'fixed';
      wordmark.style.left = `${rect.left + window.scrollX}px`;
      wordmark.style.top = `${rect.top + window.scrollY}px`;
      const line = descriptor.getBoundingClientRect();
      descriptorSlot.style.width = `${line.width}px`;
      descriptorSlot.style.height = `${line.height}px`;
      descriptor.style.width = `${line.width}px`;
      descriptor.style.position = 'fixed';
      descriptor.style.left = `${line.left + window.scrollX}px`;
      descriptor.style.top = `${line.top + window.scrollY}px`;
    };

    const update = () => {
      frame = 0;
      // The place line, "View project" and the pause button leave before they reach the (clear) header, so they never
      // sit on top of its links. The base row may appear after the first render, so it is looked up each time.
      const base = hero.querySelector('.hero-portal__base');
      if (base) {
        const room = base.getBoundingClientRect().top - header.getBoundingClientRect().bottom;
        const visible = Math.min(Math.max(room / BASE_FADE_PX, 0), 1);
        base.style.opacity = String(visible);
        base.style.pointerEvents = visible < 0.05 ? 'none' : '';
      }
      if (motionPreference.matches) {
        wordmark.style.removeProperty('opacity');
        descriptor.style.removeProperty('opacity');
        root.removeAttribute('data-hero-undocked');
        return;
      }

      const progress = Math.min(Math.max(window.scrollY / endScroll, 0), 1);
      const travel = Math.min(progress / 0.8, 1);
      const fade = Math.min(Math.max((progress - 0.8) / 0.2, 0), 1);
      const scale = 1 + (target.width / start.width - 1) * travel;
      const x = (target.x - start.x) * travel;
      const y = (target.y - start.y) * travel;

      wordmark.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
      wordmark.style.opacity = String(1 - fade);
      descriptor.style.transform = `translate3d(0, ${y}px, 0)`;
      descriptor.style.opacity = String(1 - travel);
      root.toggleAttribute('data-hero-undocked', travel < 1);
    };

    const scheduleUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    const resize = () => {
      measure();
      scheduleUpdate();
    };

    measure();
    update();
    // Fonts and the photo gallery settle after first paint and shift the centre block; measure again when they do.
    const layoutObserver = new ResizeObserver(resize);
    layoutObserver.observe(hero);
    layoutObserver.observe(slot.parentElement);
    let alive = true; // fonts can settle after the hero is gone; measuring then would hide the next page's header logo
    document.fonts?.ready.then(() => alive && resize());
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', resize);
    motionPreference.addEventListener('change', resize);
    return () => {
      alive = false;
      layoutObserver.disconnect();
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', resize);
      motionPreference.removeEventListener('change', resize);
      window.cancelAnimationFrame(frame);
      root.removeAttribute('data-hero-undocked');
      for (const property of ['position', 'left', 'top', 'transform', 'opacity']) wordmark.style.removeProperty(property);
      for (const property of ['position', 'left', 'top', 'transform', 'opacity', 'width']) descriptor.style.removeProperty(property);
      hero.querySelector('.hero-portal__base')?.removeAttribute('style');
      for (const box of [slot, descriptorSlot]) {
        box.style.removeProperty('width');
        box.style.removeProperty('height');
      }
    };
  }, []);

  const position = count ? index % count : 0;
  const current = count ? slides[position] : null;

  return (
    <section ref={heroRef} className="hero-portal" aria-label="Archió">
      {/* Backdrop only: the featured project is named and linked below. Inert keeps the photos (and, without WebGL,
          their <img> alt text) away from keyboard and screen-reader users. */}
      <div className="hero-portal__media" inert>
        {count ? (
          <MorphGallery items={items} index={position} height="100%" fit={PHOTO_FIT} onReady={releaseWhenPhotoShows} />
        ) : <div className="hero-portal__solid" />}
        <div className="hero-portal__scrim" />
      </div>

      <div className="hero-portal__centre">
        <div className="hero-portal__mark-slot">
          <h1 ref={wordmarkRef} className="hero-portal__mark" translate="no" aria-label={`Archió, ${HERO.descriptor.toLowerCase()}`}>
            <span className="wordmark" aria-hidden="true" />
          </h1>
        </div>
        <div className="hero-portal__mark-slot">
          <p ref={descriptorRef} className="hero-portal__descriptor">
            <span className="hero-portal__rule" aria-hidden="true" />
            {HERO.descriptor}
            <span className="hero-portal__rule" aria-hidden="true" />
          </p>
        </div>
      </div>

      {current && (
        <div className="hero-portal__base container">
          <div className="hero-portal__featured">
            <div className="hero-portal__project">
              {/* Keyed, so each photo's place name is a new element and fades in (hero-portal.css). */}
              <p className="hero-portal__place" key={current.slug}><PinIcon /> {current.city}</p>
            </div>
            <Link className="hero-portal__view" to={ROUTES.project(current.slug)}>
              <span>View project</span>
              <ArrowIcon />
            </Link>
          </div>
          {rotates && (
            <button
              type="button"
              className="hero-portal__toggle"
              aria-label={playing ? 'Pause slideshow' : 'Play slideshow'}
              onClick={() => setPlaying((value) => !value)}
            >
              <svg key={playing ? 'pause' : 'play'} viewBox="0 0 16 16" width="12" height="12" aria-hidden="true" focusable="false">
                {playing ? <path d="M5 3v10M11 3v10" stroke="currentColor" strokeWidth="1.5" /> : <path d="M5 3l8 5-8 5z" fill="currentColor" />}
              </svg>
            </button>
          )}
        </div>
      )}
    </section>
  );
}
