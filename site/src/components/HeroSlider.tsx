'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './HeroSlider.module.scss';
import Roll from '@/components/Roll';

export type Slide = { src: string; poster?: string; alt: string; title: string; place: string; href: string };

const FRAGMENT = `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uFrom, uTo;
  uniform float uFromAspect, uToAspect, uPlaneAspect, uProgress;
  vec2 cover(vec2 uv, float img) {
    vec2 s = uPlaneAspect > img ? vec2(1.0, img / uPlaneAspect) : vec2(uPlaneAspect / img, 1.0);
    return (uv - 0.5) * s + 0.5;
  }
  // On a screen much wider than the photo (over 1.35 times its aspect, about 21:9 for these 16:9 photos) the whole photo is shown, centred, and the side bars are filled with a blurred, dimmed copy of it. Otherwise the photo covers the screen.
  vec4 pic(sampler2D t, vec2 uv, float img) {
    vec2 cv = cover(uv, img);
    if (uPlaneAspect < 1.0 || uPlaneAspect <= img * 1.35) return texture2D(t, cv);
    vec4 bg = texture2D(t, cv);
    for (int i = 0; i < 8; i++) {
      float a = float(i) * 0.785398;
      vec2 d = vec2(cos(a), sin(a));
      bg += texture2D(t, cv + d * 0.03) + texture2D(t, cv + d * 0.07);
    }
    bg = mix(bg / 17.0, vec4(0.08, 0.02, 0.03, 1.0), 0.35);
    vec2 c = (uv - 0.5) * vec2(uPlaneAspect / img, 1.0) + 0.5;
    float inside = step(0.0, c.x) * step(c.x, 1.0);
    return mix(bg, texture2D(t, clamp(c, 0.0, 1.0)), inside);
  }
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
  }
  void main() {
    float n = noise(vUv * vec2(3.0, 5.0)) * 0.6 + noise(vUv * vec2(9.0, 14.0)) * 0.4;
    float s = vUv.x + (n - 0.5) * 0.35;                      // spans [-0.175, 1.175]
    float edge = mix(-0.43, 1.43, uProgress);
    float m = smoothstep(edge - 0.25, edge + 0.25, s);       // 1 = still the old image
    float band = 4.0 * m * (1.0 - m);
    vec2 off = vec2((n - 0.5) * 0.12, (n - 0.5) * 0.04) * band;
    float zoom = 1.0 + 0.06 * (1.0 - uProgress);              // incoming image settles as it arrives
    vec4 a = pic(uFrom, vUv + off, uFromAspect);
    vec4 b = pic(uTo, (vUv - off - 0.5) / zoom + 0.5, uToAspect);
    gl_FragColor = mix(b, a, m);
  }`;

// The hero photos come as ready-sized files (-640, -1080, -1920, -2560 .webp in /images/hero), served as they are: nothing is
// processed on the first request, so the picture is there as soon as it has downloaded.
const heroLoader = ({ src, width }: { src: string; width: number }) => src.replace(/\.webp$/, `-${width <= 640 ? 640 : width <= 1080 ? 1080 : width <= 1920 ? 1920 : 2560}.webp`);

type GL = { go(from: number, to: number): Promise<void>; dispose(): void };

async function createGL(stage: HTMLDivElement, srcs: string[]): Promise<GL | null> {
  const probe = document.createElement('canvas');
  if (!(probe.getContext('webgl2') || probe.getContext('webgl'))) return null;
  const THREE = await import('three');
  // Fresh Image objects from the original files: <Image> elements report layout sizes, which breaks texture upload.
  const imgs = await Promise.all(srcs.map(async (src) => { const i = new window.Image(); i.src = src; await i.decode(); return i; }));
  const renderer = new THREE.WebGLRenderer({ antialias: false });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  // No mipmaps: a full-screen image never minifies, and mipmap generation fails for these (AVIF/WebP) sources.
  const textures = imgs.map((i) => { const t = new THREE.Texture(i); t.generateMipmaps = false; t.minFilter = THREE.LinearFilter; t.needsUpdate = true; return t; });
  const aspect = (i: HTMLImageElement) => i.naturalWidth / i.naturalHeight;
  const uniforms = {
    uFrom: { value: textures[0] }, uTo: { value: textures[0] }, uFromAspect: { value: aspect(imgs[0]) }, uToAspect: { value: aspect(imgs[0]) },
    uPlaneAspect: { value: 1 }, uProgress: { value: 0 },
  };
  const scene = new THREE.Scene();
  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
    uniforms, fragmentShader: FRAGMENT, vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
  })));
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const render = () => renderer.render(scene, camera);
  const ro = new ResizeObserver(() => {
    const { width, height } = stage.getBoundingClientRect();
    renderer.setSize(width, height, false);
    uniforms.uPlaneAspect.value = width / height;
    render();
  });
  ro.observe(stage);
  renderer.domElement.setAttribute('aria-hidden', 'true');
  renderer.domElement.className = styles.canvas;
  stage.appendChild(renderer.domElement);
  const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  return {
    go(from, to) {
      uniforms.uFrom.value = textures[from]; uniforms.uFromAspect.value = aspect(imgs[from]);
      uniforms.uTo.value = textures[to]; uniforms.uToAspect.value = aspect(imgs[to]);
      const start = performance.now();
      return new Promise((done) => {
        const frame = (now: number) => {
          const t = Math.min((now - start) / 1400, 1);
          uniforms.uProgress.value = ease(t);
          render();
          if (t < 1) requestAnimationFrame(frame);
          else { uniforms.uFrom.value = textures[to]; uniforms.uFromAspect.value = aspect(imgs[to]); uniforms.uProgress.value = 0; render(); done(); }
        };
        requestAnimationFrame(frame);
      });
    },
    dispose() { ro.disconnect(); textures.forEach((t) => t.dispose()); renderer.dispose(); renderer.domElement.remove(); },
  };
}

// Full-screen hero: the three projects, changed by a WebGL displacement transition ("GL slider").
// Autoplays every 8 s, pauses on hover/focus or when the tab is hidden; reduced motion means no autoplay and a crossfade.
export default function HeroSlider({ slides, children }: { slides: Slide[]; children: React.ReactNode }) {
  const stage = useRef<HTMLDivElement>(null);
  const gl = useRef<GL | null>(null);
  const busy = useRef(false);
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [stopped, setStopped] = useState(false); // the visitor pressed pause or picked a slide: no autoplay after that
  const [glReady, setGlReady] = useState(false);
  const currentRef = useRef(0);

  const go = useCallback(async (next: number) => {
    const from = currentRef.current;
    if (busy.current || next === from) return;
    busy.current = true;
    currentRef.current = next;
    setCurrent(next);
    if (gl.current) await gl.current.go(from, next);
    else await new Promise((r) => setTimeout(r, 700));
    busy.current = false;
  }, []);

  useEffect(() => {
    // The WebGL transition is for larger screens; phones and data-saver users keep the plain crossfade and skip three.js.
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || matchMedia('(max-width: 767px)').matches || saveData) return;
    let cancelled = false;
    const start = () => createGL(stage.current!, slides.map((s) => (s.poster ? heroLoader({ src: s.poster, width: 1920 }) : s.src))).then((g) => {
      if (cancelled) { g?.dispose(); return; }
      gl.current = g;
      if (g) setGlReady(true);
    }).catch(() => undefined);
    // After first paint, so the LCP image is never delayed, and after the preloader, whose motion it would otherwise stall.
    let idle: ReturnType<typeof setTimeout> | undefined;
    const preloading = !document.documentElement.hasAttribute('data-no-preloader') && !!document.querySelector('[data-preloader]');
    if (preloading) addEventListener('preloader:done', start, { once: true });
    else idle = setTimeout(start, 900);
    return () => {
      cancelled = true;
      clearTimeout(idle);
      removeEventListener('preloader:done', start);
      gl.current?.dispose(); gl.current = null;
    };
  }, [slides]);

  useEffect(() => {
    if (paused || stopped || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(() => { if (!document.hidden) go((currentRef.current + 1) % slides.length); }, 8000);
    return () => clearInterval(id);
  }, [paused, stopped, go, slides.length]);

  const slide = slides[current];
  return (
    <section
      className={styles.hero}
      aria-roledescription="carousel"
      aria-label="Featured projects"
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}
      data-recede
    >
      <div className={styles.inner} data-recede-inner>
      <div ref={stage} className={`${styles.stage} ${glReady ? styles.glReady : ''}`}>
        {slides.map((s, i) => (
          <div key={s.src} className={`${styles.slide} ${i === current ? styles.active : ''}`}>
            <Image src={s.poster ?? s.src} loader={s.poster ? heroLoader : undefined} alt="" fill sizes="100vw" className={styles.backdrop} aria-hidden="true" />
            <Image
              src={s.poster ?? s.src}
              loader={s.poster ? heroLoader : undefined}
              alt={i === current ? s.alt : ''}
              fill
              priority={i === 0}
              sizes="100vw"
              className={styles.photo}
            />
          </div>
        ))}
      </div>
      <div className={styles.shade} aria-hidden="true" />
      <div className={`container ${styles.content}`}>{children}</div>
      <div className={styles.bar}>
        <div className={styles.caption} aria-live={stopped ? 'polite' : 'off'}>
          <p className={styles.place}>
            <svg viewBox="0 0 12 16" aria-hidden="true"><path d="M6 15s5-5.2 5-9A5 5 0 0 0 1 6c0 3.8 5 9 5 9Z" fill="none" stroke="currentColor" /><circle cx="6" cy="6" r="1.6" fill="currentColor" /></svg>
            {slide.place}
          </p>
          <Link prefetch={false} href={slide.href} className={styles.slideLink} data-cursor="View">
            <Roll>View project</Roll><span className="visually-hidden">: {slide.title}</span> <span aria-hidden="true">→</span>
          </Link>
        </div>
        <div className={styles.controls}>
          <button type="button" className={styles.pause} onClick={() => setStopped((v) => !v)} aria-pressed={stopped}>
            {stopped ? 'Play slideshow' : 'Pause slideshow'}
          </button>
          {slides.map((s, i) => (
            <button
              key={s.src}
              type="button"
              className={styles.dot}
              data-current={i === current}
              aria-label={`Show ${s.title}`}
              aria-current={i === current ? 'true' : undefined}
              onClick={() => { setStopped(true); go(i); }}
            >
              <span className={`${styles.track} ${i === current && !paused && !stopped ? styles.running : ''}`} />
            </button>
          ))}
        </div>
      </div>
      </div>
    </section>
  );
}
