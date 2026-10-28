// Option D scroll scenes: statement words lit by scroll, WebGL light sweep over each project, services light-up.
// Everything degrades to fully lit, readable content without GSAP, without WebGL or with reduced motion.
const root = document.documentElement;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const isPhone = matchMedia('(max-width: 767px)').matches;
const { gsap, ScrollTrigger } = window;
const motion = !reduceMotion && gsap && ScrollTrigger;
if (!motion) root.classList.add('no-motion');
else gsap.registerPlugin(ScrollTrigger);

// Header gains a backdrop once the page has scrolled past the preview banner.
const sentinel = document.querySelector('.preview-flag');
new IntersectionObserver(([e]) => root.classList.toggle('scrolled', !e.isIntersecting)).observe(sentinel);

// Statement: split into words; with motion, light passes over them as the section scrolls through.
const statement = document.querySelector('[data-light-words]');
statement.innerHTML = statement.textContent.split(' ').map((w) => `<span class="w">${w}</span>`).join(' ');
if (motion) {
  gsap.to(statement.querySelectorAll('.w'), {
    color: '#F8F7F4', ease: 'none', stagger: 0.12,
    scrollTrigger: { trigger: statement, start: 'top 78%', end: 'bottom 42%', scrub: 0.6 },
  });
}

// Services: hovering, focusing or pressing a kind of space brings up the light on its render.
const lights = document.querySelectorAll('.services-light img');
const light = (kind) => lights.forEach((img) => img.classList.toggle('is-lit', img.dataset.for === kind));
for (const button of document.querySelectorAll('[data-kind]')) {
  button.setAttribute('aria-pressed', 'false');
  const li = button.closest('li');
  li.addEventListener('mouseenter', () => light(button.dataset.kind));
  button.addEventListener('focus', () => light(button.dataset.kind));
  button.addEventListener('click', () => {
    const on = button.getAttribute('aria-pressed') !== 'true';
    document.querySelectorAll('[data-kind]').forEach((b) => b.setAttribute('aria-pressed', String(b === button && on)));
    light(on ? button.dataset.kind : null);
  });
}
document.querySelector('[data-kinds]').addEventListener('mouseleave', () => {
  const pressed = document.querySelector('[data-kind][aria-pressed="true"]');
  light(pressed ? pressed.dataset.kind : null);
});

// Project scenes: each render starts in darkness; a raking band of light turns the room on with scroll.
const SWEEP_FRAGMENT = `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uTex;
  uniform float uImgAspect, uPlaneAspect, uProgress, uDir;
  vec2 cover(vec2 uv, float img) {
    vec2 s = uPlaneAspect > img ? vec2(1.0, img / uPlaneAspect) : vec2(uPlaneAspect / img, 1.0);
    return (uv - 0.5) * s + 0.5;
  }
  float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
  void main() {
    float zoom = mix(1.08, 1.0, uProgress);                       // slow push-in as the room lights up
    vec3 col = texture2D(uTex, cover((vUv - 0.5) / zoom + 0.5, uImgAspect)).rgb;
    float x = uDir > 0.0 ? vUv.x : 1.0 - vUv.x;
    float coord = x * 0.85 + (1.0 - vUv.y) * 0.15;                // a slightly raking diagonal
    float edge = mix(-0.25, 1.25, uProgress);
    float lit = 1.0 - smoothstep(edge - 0.22, edge, coord);       // lit behind the edge, dark ahead of it
    float beam = exp(-pow((coord - edge + 0.08) / 0.07, 2.0));    // bright leading edge, like sun through a window
    vec3 c = mix(col * 0.09, col * vec3(1.05, 1.0, 0.93), lit) + vec3(1.0, 0.85, 0.66) * beam * 0.32;
    c += (hash(vUv * 1200.0) - 0.5) * 0.03;                       // fine film grain
    gl_FragColor = vec4(c, 1.0);
  }`;

async function sweep(scene, dir) {
  const media = scene.querySelector('[data-sweep]');
  const img = media.querySelector('img');
  const probe = document.createElement('canvas');
  if (!(probe.getContext('webgl2') || probe.getContext('webgl'))) return;
  const THREE = await import('three');
  img.loading = 'eager';
  await img.decode().catch(() => {});
  const renderer = new THREE.WebGLRenderer({ antialias: false });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  const tex = new THREE.Texture(img); tex.minFilter = THREE.LinearFilter; tex.needsUpdate = true;
  const uniforms = { uTex: { value: tex }, uImgAspect: { value: img.naturalWidth / img.naturalHeight }, uPlaneAspect: { value: 1 }, uProgress: { value: 0 }, uDir: { value: dir } };
  const scene3 = new THREE.Scene();
  scene3.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
    uniforms, fragmentShader: SWEEP_FRAGMENT,
    vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
  })));
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const render = () => renderer.render(scene3, camera);
  new ResizeObserver(() => {
    const { width, height } = media.getBoundingClientRect();
    renderer.setSize(width, height, false);
    uniforms.uPlaneAspect.value = width / height;
    render();
  }).observe(media);
  renderer.domElement.setAttribute('aria-hidden', 'true');
  media.appendChild(renderer.domElement);
  media.classList.add('is-gl');
  ScrollTrigger.create({
    trigger: scene,
    start: isPhone ? 'top 85%' : 'top top',
    end: isPhone ? 'top 15%' : 'bottom bottom',
    scrub: 0.4,
    onUpdate: (self) => { uniforms.uProgress.value = self.progress; render(); },
    onRefresh: (self) => { uniforms.uProgress.value = self.progress; render(); },
  });
}

if (motion) {
  // Initialise each scene's WebGL only as it approaches the viewport.
  const scenes = [...document.querySelectorAll('[data-scene]')];
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      io.unobserve(entry.target);
      const dir = entry.target.classList.contains('scene--right') ? -1 : 1;
      sweep(entry.target, dir).catch((err) => console.warn('Light sweep unavailable; showing the image lit.', err));
    }
  }, { rootMargin: '100% 0px' });
  scenes.forEach((s) => io.observe(s));
}
