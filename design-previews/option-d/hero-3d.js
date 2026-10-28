// Option D hero: the brand's Ó monogram, extruded from the kit's own outline, standing in plaster against a
// plaster wall and lit by a low, warm sun. The sun rises on load, follows the pointer and sets as you scroll away.
// Without WebGL the flat monogram fallback stays; with reduced motion one still, lit frame is rendered.
import * as THREE from 'three';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';

const stage = document.querySelector('[data-hero-stage]');
const hero = stage.closest('.hero');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const isPhone = matchMedia('(max-width: 767px)').matches;
const probe = document.createElement('canvas');

if (probe.getContext('webgl2') || probe.getContext('webgl')) build().catch((err) => console.warn('3D hero unavailable; showing the flat monogram.', err));

// Fine noise used as a bump map so surfaces read as hand-finished plaster rather than plastic.
function plasterTexture(repeat) {
  const size = 256, c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d'), img = ctx.createImageData(size, size);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 118 + Math.random() * 20 + (Math.random() < 0.02 ? 30 : 0);
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat, repeat);
  return t;
}

async function build() {
  const svg = (await (await fetch('../shared/logo-monogram.svg')).text()).replace('currentColor', '#000'); // fill is irrelevant here; avoids a THREE.Color warning
  const shapes = new SVGLoader().parse(svg).paths.flatMap((p) => SVGLoader.createShapes(p));
  const geometry = new THREE.ExtrudeGeometry(shapes, { depth: 54, bevelEnabled: true, bevelThickness: 4, bevelSize: 2.5, bevelSegments: 4, curveSegments: 28 });
  geometry.center();

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, isPhone ? 1.5 : 1.75));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.95;

  const scene = new THREE.Scene();
  const night = new THREE.Color('#140708');
  scene.background = night;
  scene.fog = new THREE.Fog(night, 10, 19);

  const plaster = (color, repeat) => new THREE.MeshStandardMaterial({ color, roughness: 0.94, metalness: 0, bumpMap: plasterTexture(repeat), bumpScale: 0.7 });

  // The monogram: about 2.6 units tall, flipped from SVG's y-down space.
  const scale = 2.6 / 359;
  const mono = new THREE.Mesh(geometry, plaster('#E9E0CF', 1 / 60));
  mono.scale.set(scale, scale, scale);
  mono.rotation.x = Math.PI;
  mono.castShadow = mono.receiveShadow = true;
  const monoX = isPhone ? 0 : 2.1; // keep the left third dark so the headline always sits on shadow
  const monoY = isPhone ? 1.25 : 0.2; // on phones the Ó sits above the headline, not behind it
  mono.position.set(monoX, monoY, 0);
  scene.add(mono);

  const wall = new THREE.Mesh(new THREE.PlaneGeometry(40, 24), plaster('#B8A88E', 7));
  wall.position.set(0, 0, -0.75);
  wall.receiveShadow = true;
  scene.add(wall);

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 20), plaster('#A6957A', 7));
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, monoY - 1.3 - 0.02, 0);
  floor.receiveShadow = true;
  scene.add(floor);

  // Oxblood-tinted fill keeps shadows deep red-brown rather than black.
  scene.add(new THREE.HemisphereLight('#6a2a2c', '#140708', 1.6));
  // The "sun": a soft-edged spot, so a pool of raking light falls on the wall and the rest stays in darkness.
  const sunTarget = new THREE.Object3D();
  scene.add(sunTarget);
  // A distant source gives a crisp, readable shadow of the ring and the Á; intensity scales with distance squared.
  const SUN_DISTANCE = 15;
  const BASE_INTENSITY = 900;
  const sun = new THREE.SpotLight('#FFD3A1', BASE_INTENSITY, 0, 0.24, 0.7, 2);
  sun.castShadow = true;
  sun.shadow.mapSize.set(isPhone ? 1024 : 2048, isPhone ? 1024 : 2048);
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 30;
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.02;
  sun.shadow.radius = 5;
  sun.target = sunTarget;
  scene.add(sun);

  const camera = new THREE.PerspectiveCamera(isPhone ? 38 : 28, 1, 0.1, 60);
  const lookAt = new THREE.Vector3(isPhone ? 0 : 0.8, isPhone ? 0.3 : 0, 0);

  // Sun angle: low from the left (raking) at dawn, higher as it rises; the pointer nudges it like moving a lamp.
  const state = { angle: 3.0, targetAngle: 2.55, pointerX: 0, pointerY: 0, sunset: 0 };
  const place = () => {
    const a = state.angle + state.pointerX * 0.28;
    const height = Math.sin(a) * 7.5 * (1 - state.sunset * 0.75) + 1.2;
    sun.position.set(monoX + Math.cos(a) * SUN_DISTANCE, monoY + height, 7);
    sunTarget.position.set(monoX + 0.9, monoY - 0.2, -0.75); // aim just past the Ó so its shadow lands in the light pool
    sun.intensity = BASE_INTENSITY * (1 - state.sunset * 0.85);
    camera.position.set(lookAt.x + state.pointerX * 0.35, lookAt.y + 0.25 - state.pointerY * 0.2, isPhone ? 10.5 : 9.2);
    camera.lookAt(lookAt);
  };

  const resize = () => {
    const { width, height } = stage.getBoundingClientRect();
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    place();
    renderer.render(scene, camera);
  };
  stage.appendChild(renderer.domElement);
  renderer.domElement.setAttribute('aria-hidden', 'true');
  new ResizeObserver(resize).observe(stage);
  stage.classList.add('is-3d');

  if (reduceMotion) { state.angle = 2.55; resize(); return; }

  // Pointer moves the light; scrolling out of the hero lowers the sun to dusk.
  addEventListener('pointermove', (e) => {
    state.tx = (e.clientX / innerWidth) * 2 - 1;
    state.ty = (e.clientY / innerHeight) * 2 - 1;
  }, { passive: true });
  if (window.ScrollTrigger) {
    window.gsap.registerPlugin(window.ScrollTrigger);
    window.ScrollTrigger.create({ trigger: hero, start: 'top top', end: 'bottom top', onUpdate: (s) => { state.sunset = s.progress; } });
  }

  // Render only while the hero is on screen and the tab is visible.
  let running = false;
  const frame = () => {
    if (!running) return;
    state.angle += (state.targetAngle - state.angle) * 0.018;
    state.pointerX += ((state.tx ?? 0) - state.pointerX) * 0.05;
    state.pointerY += ((state.ty ?? 0) - state.pointerY) * 0.05;
    place();
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  };
  const setRunning = (on) => { if (on && !running) { running = true; requestAnimationFrame(frame); } else if (!on) running = false; };
  let visible = true;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; setRunning(visible && !document.hidden); }).observe(hero);
  document.addEventListener('visibilitychange', () => setRunning(visible && !document.hidden));
  resize();
  setRunning(true);
}
