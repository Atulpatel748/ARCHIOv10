// Project slider for option B: a WebGL displacement transition between project images ("GL slider"),
// with a plain CSS crossfade when WebGL is unavailable or reduced motion is requested.
// No autoplay: slides change only when the visitor asks (buttons or arrow keys).
const PROJECTS = [
  { title: 'Dubai Marina residence', facts: 'Residential, 2,500 sq ft' },
  { title: 'JLT office', facts: 'Commercial, 2,000 sq ft' },
  { title: 'Arabian Ranches 2 garden', facts: 'Landscape, 6,500 sqm' },
];

const slider = document.querySelector('[data-slider]');
const stage = slider.querySelector('[data-stage]');
const slides = [...stage.querySelectorAll('.slide')];
const buttons = [...slider.querySelectorAll('[data-goto]')];
const titleEl = slider.querySelector('[data-slide-title]');
const factsEl = slider.querySelector('[data-slide-facts]');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

let current = 0;
let busy = false;
let gl = null; // set once WebGL is ready

function updateText(i) {
  titleEl.textContent = PROJECTS[i].title;
  factsEl.textContent = PROJECTS[i].facts;
  buttons.forEach((b, n) => b.setAttribute('aria-current', String(n === i)));
}

async function go(next) {
  if (busy || next === current) return;
  updateText(next);
  slides.forEach((s, n) => s.classList.toggle('is-active', n === next));
  if (gl) { busy = true; await gl.transition(current, next); busy = false; }
  current = next;
}

buttons.forEach((b) => b.addEventListener('click', () => go(Number(b.dataset.goto))));
slider.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') go((current + 1) % slides.length);
  if (e.key === 'ArrowLeft') go((current - 1 + slides.length) % slides.length);
});

// WebGL enhancement: loaded only after first interaction or idle time, so it never delays the first paint.
async function enhance() {
  const probe = document.createElement('canvas');
  if (reduceMotion || !(probe.getContext('webgl2') || probe.getContext('webgl'))) return;
  const THREE = await import('https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.min.js');
  await Promise.all(slides.map((img) => img.decode().catch(() => {})));

  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const textures = slides.map((img) => {
    const t = new THREE.Texture(img); // no colour-space conversion: the raw shader output must match the <img>
    t.minFilter = THREE.LinearFilter;
    t.needsUpdate = true;
    return t;
  });
  const aspectOf = (img) => img.naturalWidth / img.naturalHeight;
  const uniforms = {
    uFrom: { value: textures[0] }, uTo: { value: textures[0] },
    uFromAspect: { value: aspectOf(slides[0]) }, uToAspect: { value: aspectOf(slides[0]) },
    uPlaneAspect: { value: 1 }, uProgress: { value: 0 },
  };
  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
    fragmentShader: `
      precision highp float;
      varying vec2 vUv;
      uniform sampler2D uFrom, uTo;
      uniform float uFromAspect, uToAspect, uPlaneAspect, uProgress;
      // object-fit: cover in UV space
      vec2 cover(vec2 uv, float img) {
        vec2 s = uPlaneAspect > img ? vec2(1.0, img / uPlaneAspect) : vec2(uPlaneAspect / img, 1.0);
        return (uv - 0.5) * s + 0.5;
      }
      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float noise(vec2 p) {
        vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
      }
      void main() {
        float n = noise(vUv * vec2(3.0, 5.0)) * 0.6 + noise(vUv * vec2(9.0, 14.0)) * 0.4;
        // A soft, plaster-like sweep from left to right with a noisy edge.
        // s spans [-0.175, 1.175]; the edge range keeps m = 1 at progress 0 and m = 0 at progress 1.
        float s = vUv.x + (n - 0.5) * 0.35;
        float edge = mix(-0.43, 1.43, uProgress);
        float m = smoothstep(edge - 0.25, edge + 0.25, s);   // 1 = still the old image
        float band = 4.0 * m * (1.0 - m);                    // distortion only inside the moving edge
        vec2 off = vec2((n - 0.5) * 0.12, (n - 0.5) * 0.04) * band;
        vec4 a = texture2D(uFrom, cover(vUv + off, uFromAspect));
        vec4 b = texture2D(uTo, cover(vUv - off, uToAspect));
        gl_FragColor = mix(b, a, m);
      }`,
  });
  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material));

  const resize = () => {
    const { width, height } = stage.getBoundingClientRect();
    renderer.setSize(width, height, false);
    uniforms.uPlaneAspect.value = width / height;
    renderer.render(scene, camera);
  };
  new ResizeObserver(resize).observe(stage);
  stage.appendChild(renderer.domElement);
  renderer.domElement.setAttribute('aria-hidden', 'true');
  resize();
  stage.classList.add('gl-ready');

  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  gl = {
    transition(from, to) {
      uniforms.uFrom.value = textures[from]; uniforms.uFromAspect.value = aspectOf(slides[from]);
      uniforms.uTo.value = textures[to]; uniforms.uToAspect.value = aspectOf(slides[to]);
      const start = performance.now(), duration = 1200;
      return new Promise((done) => {
        const frame = (now) => {
          const t = Math.min((now - start) / duration, 1);
          uniforms.uProgress.value = ease(t);
          renderer.render(scene, camera);
          if (t < 1) requestAnimationFrame(frame);
          else { uniforms.uFrom.value = textures[to]; uniforms.uFromAspect.value = aspectOf(slides[to]); uniforms.uProgress.value = 0; renderer.render(scene, camera); done(); }
        };
        requestAnimationFrame(frame);
      });
    },
  };
}

const start = () => enhance().catch((err) => console.warn('WebGL slider unavailable, using crossfade.', err));
if ('requestIdleCallback' in window) requestIdleCallback(start, { timeout: 2500 }); else setTimeout(start, 1500);
