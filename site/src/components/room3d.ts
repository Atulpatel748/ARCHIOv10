import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

// The "How it goes" room in real 3D (three.js): rounded furniture, soft shadows, and lamps that really light the room. It builds
// itself and turns one full circle about its own middle as `getProgress()` (0 to 1, the scroll through the section) rises. Loaded
// only on large screens, once the section is near, see RoomScene. Returns a function that tears it all down, or null without WebGL.

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const ease = (t: number) => 1 - Math.pow(1 - t, 3);
const hashN = (i: number, k: number) => { const s = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return s - Math.floor(s); };

type Piece = { obj: THREE.Object3D; from: number; to: number; home: THREE.Vector3; off: THREE.Vector3; spin: number; rot: number; rise: boolean };
type Wall = THREE.Group & { userData: { n: THREE.Vector3; from: number; to: number } };

export function createRoom3D(host: HTMLElement, getProgress: () => number): (() => void) | null {
  let renderer: THREE.WebGLRenderer;
  try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); } catch { return null; } // no WebGL: the caller shows the CSS room
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  renderer.domElement.setAttribute('aria-hidden', 'true');
  Object.assign(renderer.domElement.style, { position: 'absolute', inset: '0', width: '100%', height: '100%', display: 'block' });
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
  scene.add(new THREE.HemisphereLight(0xffffff, 0xe6d9c6, 1.15), new THREE.AmbientLight(0xfff6ea, 1.1)); // the ambient light keeps walls facing away from the sun from going grey
  const sun = new THREE.DirectionalLight(0xfff1dc, 2.2);
  sun.position.set(6, 11, 5); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0004; sun.shadow.radius = 5;
  Object.assign(sun.shadow.camera, { left: -7, right: 7, top: 7, bottom: -7, near: 1, far: 30 });
  scene.add(sun);

  const glowMats: THREE.MeshStandardMaterial[] = []; // emissive things that come on in step 4
  const lights: THREE.PointLight[] = [];
  const mat = (c: string, o: THREE.MeshStandardMaterialParameters = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.82, metalness: 0, ...o });
  const glowMat = (c: string, on = 1.6) => { const m = new THREE.MeshStandardMaterial({ color: c, emissive: 0xffc878, emissiveIntensity: 0, roughness: 0.6 }); m.userData.on = on; glowMats.push(m); return m; };
  const addLight = (parent: THREE.Object3D, x: number, y: number, z: number, power: number) => { const l = new THREE.PointLight(0xffc27a, 0, 7, 1.6); l.position.set(x, y, z); l.userData.power = power; parent.add(l); lights.push(l); };

  const rb = (w: number, h: number, d: number, r = 0.06) => new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 4, r));
  const cyl = (rt: number, rbm: number, h: number, seg = 40) => new THREE.Mesh(new THREE.CylinderGeometry(rt, rbm, h, seg));
  type PutOpts = { glow?: boolean; noShadow?: boolean; m?: THREE.MeshStandardMaterialParameters };
  const put = <T extends THREE.Mesh>(m: T, x: number, y: number, z: number, color: string, o: PutOpts = {}) => {
    m.position.set(x, y, z); m.material = o.glow ? glowMat(color) : mat(color, o.m); m.castShadow = !o.noShadow; m.receiveShadow = true; return m;
  };

  // ---------- the build list: every piece arrives from a scatter position, one after another ----------
  const room = new THREE.Group(); scene.add(room);
  const pieces: Piece[] = [];
  const add = <T extends THREE.Object3D>(obj: T, from: number, to: number, rise = false) => {
    const i = pieces.length, a = hashN(i, 1) * Math.PI * 2, far = 7 + hashN(i, 2) * 4;
    room.add(obj);
    pieces.push({ obj, from, to, home: obj.position.clone(), rot: obj.rotation.y, rise, spin: (hashN(i, 4) - 0.5) * 4,
      off: rise ? new THREE.Vector3(0, -0.01, 0) : new THREE.Vector3(Math.cos(a) * far, 5 + hashN(i, 3) * 4, Math.sin(a) * far) });
    return obj;
  };

  // floor
  add(put(rb(7, 0.16, 7, 0.02), 0, -0.08, 0, '#E6D9C6'), 0, 0.08, true);

  // walls: each is a group so its pictures hide with it; they grow up from the floor
  const walls: Wall[] = [];
  const makeWall = (x: number, z: number, rotY: number, n: [number, number, number], from: number, to: number) => {
    const g = new THREE.Group() as Wall; g.add(put(rb(7, 3.2, 0.16, 0.02), 0, 1.6, 0, '#F4F0E9'));
    g.position.set(x, 0, z); g.rotation.y = rotY; g.userData = { n: new THREE.Vector3(...n), from, to }; g.scale.y = 0.001; room.add(g); walls.push(g); return g;
  };
  const wBack = makeWall(0, -3.58, 0, [0, 0, 1], 0.06, 0.2);
  const wLeft = makeWall(-3.58, 0, Math.PI / 2, [1, 0, 0], 0.1, 0.24);
  const wFront = makeWall(0, 3.58, 0, [0, 0, -1], 0.14, 0.28);
  const wRight = makeWall(3.58, 0, Math.PI / 2, [-1, 0, 0], 0.18, 0.32);
  // windows, pictures and an arch on the walls (in each wall's own space; +z is into the room)
  const windowAt = (g: THREE.Group, x: number, w: number, h: number) => {
    g.add(put(rb(w + 0.2, h + 0.2, 0.08, 0.02), x, 1.7, 0.1, '#FBF9F5'), put(new THREE.Mesh(new THREE.PlaneGeometry(w, h)), x, 1.7, 0.15, '#DCE7EC', { glow: true, noShadow: true }),
      put(rb(0.06, h, 0.05, 0.01), x, 1.7, 0.17, '#FBF9F5'), put(rb(w, 0.06, 0.05, 0.01), x, 1.7, 0.17, '#FBF9F5'));
  };
  const pic = (g: THREE.Group, x: number, y: number, w: number, h: number, c: string) => { g.add(put(rb(w + 0.12, h + 0.12, 0.06, 0.01), x, y, 0.1, '#FBF9F5'), put(rb(w, h, 0.05, 0.01), x, y, 0.13, c)); };
  windowAt(wBack, -2.2, 1.5, 1.4); windowAt(wBack, 2.2, 1.5, 1.4); pic(wBack, -0.4, 1.9, 1.3, 0.85, '#CEB6A8'); pic(wBack, 0.9, 1.95, 0.6, 0.8, '#8A2E34');
  windowAt(wRight, 0, 2.6, 1.4);
  pic(wFront, -2, 1.9, 0.9, 1.1, '#B9C4A6'); pic(wFront, 2, 1.9, 0.9, 1.1, '#8A2E34');
  wFront.add(put(rb(2.2, 1.2, 0.08, 0.03), 0, 1.7, 0.1, '#171012'));
  { // an arched doorway with warm light behind it, and a round mirror, on the left wall
    const s = new THREE.Shape(); s.moveTo(-0.9, 0); s.lineTo(-0.9, 1.4); s.absarc(0, 1.4, 0.9, Math.PI, 0, true); s.lineTo(0.9, 0); s.lineTo(0.72, 0); s.lineTo(0.72, 1.4); s.absarc(0, 1.4, 0.72, 0, Math.PI, false); s.lineTo(-0.72, 0); s.lineTo(-0.9, 0);
    const rim = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: 0.1, bevelEnabled: false }), mat('#7A4B4C')); rim.position.set(0.8, 0, 0.1); rim.castShadow = true; wLeft.add(rim);
    const f = new THREE.Shape(); f.moveTo(-0.72, 0); f.lineTo(-0.72, 1.4); f.absarc(0, 1.4, 0.72, Math.PI, 0, true); f.lineTo(0.72, 0);
    const inner = new THREE.Mesh(new THREE.ShapeGeometry(f), glowMat('#F8EBD6', 1.2)); inner.position.set(0.8, 0, 0.14); wLeft.add(inner);
    wLeft.add(put(new THREE.Mesh(new THREE.CircleGeometry(0.65, 40)), -2.1, 1.8, 0.14, '#E9EEF0', { m: { roughness: 0.15, metalness: 0.2 } }), put(new THREE.Mesh(new THREE.TorusGeometry(0.65, 0.05, 12, 40)), -2.1, 1.8, 0.14, '#B08D6B'));
  }

  // rug
  add(put(new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.4, 0.04, 64)), 0, 0.02, 0.4, '#D8C7B7'), 0.2, 0.28, true);
  const ring = add(put(new THREE.Mesh(new THREE.TorusGeometry(2.1, 0.03, 8, 64)), 0, 0.045, 0.4, '#B79A82', { noShadow: true }), 0.22, 0.3, true); ring.rotation.x = Math.PI / 2;

  // sofa
  { const g = new THREE.Group(); g.position.set(0, 0, -2.45);
    const b1 = put(rb(1.2, 0.62, 0.26, 0.12), -0.62, 1.15, -0.3, '#D9C4B3'), b2 = put(rb(1.2, 0.62, 0.26, 0.12), 0.62, 1.15, -0.3, '#D9C4B3'); b1.rotation.x = b2.rotation.x = -0.12;
    const cu = put(rb(0.5, 0.46, 0.18, 0.09), -1.0, 1.1, 0.02, '#8A2E34'); cu.rotation.set(-0.2, 0.3, 0.15);
    g.add(put(rb(3.3, 0.5, 1.15, 0.1), 0, 0.4, 0, '#C9AE9C'), put(rb(3.3, 1.15, 0.32, 0.14), 0, 0.95, -0.42, '#C9AE9C'), put(rb(0.34, 0.85, 1.15, 0.13), -1.5, 0.55, 0, '#BFA390'), put(rb(0.34, 0.85, 1.15, 0.13), 1.5, 0.55, 0, '#BFA390'),
      put(rb(1.25, 0.28, 0.98, 0.1), -0.62, 0.78, 0.06, '#D6BFAE'), put(rb(1.25, 0.28, 0.98, 0.1), 0.62, 0.78, 0.06, '#D6BFAE'), b1, b2, cu,
      ...([[-1.5, -0.45], [1.5, -0.45], [-1.5, 0.45], [1.5, 0.45]] as const).map(([x, z]) => put(cyl(0.06, 0.05, 0.14, 12), x, 0.07, z, '#4C1114')));
    add(g, 0.26, 0.42); }
  // coffee table with books and a vase
  { const g = new THREE.Group(); g.position.set(0, 0, 0.45);
    g.add(put(cyl(0.95, 0.95, 0.07, 56), 0, 0.62, 0, '#B08D6B'), ...[0, 2.1, 4.2].map((a) => put(cyl(0.04, 0.04, 0.6, 10), Math.cos(a) * 0.6, 0.31, Math.sin(a) * 0.6, '#8F6F52')),
      put(rb(0.55, 0.07, 0.4, 0.015), -0.25, 0.69, 0.1, '#4C1114'), put(rb(0.5, 0.06, 0.36, 0.015), -0.25, 0.76, 0.1, '#DACFBA'), put(cyl(0.08, 0.06, 0.3, 20), 0.4, 0.83, -0.1, '#F8F7F4'), put(cyl(0.01, 0.01, 0.45, 6), 0.4, 1.1, -0.1, '#7E9070'));
    const lf = put(new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 8)), 0.4, 1.35, -0.1, '#7E9070'); lf.scale.set(1, 1.4, 0.5); g.add(lf); add(g, 0.34, 0.5); }
  // armchair and pouf
  { const g = new THREE.Group(); g.position.set(2.7, 0, 0.7); g.rotation.y = -1.3;
    g.add(put(rb(1.2, 0.45, 1.1, 0.12), 0, 0.35, 0, '#B9A38F'), put(rb(1.2, 1.0, 0.3, 0.13), 0, 0.85, -0.42, '#B9A38F'), put(rb(0.3, 0.75, 1.1, 0.12), -0.55, 0.55, 0, '#AD9783'), put(rb(0.3, 0.75, 1.1, 0.12), 0.55, 0.55, 0, '#AD9783'), put(rb(0.78, 0.22, 0.84, 0.09), 0, 0.66, 0.08, '#D1BDAA'));
    add(g, 0.4, 0.52); }
  add(put(cyl(0.5, 0.5, 0.42, 36), -1.8, 0.21, 1.9, '#CEB6A8'), 0.46, 0.56);
  // tv console against the front wall
  { const g = new THREE.Group(); g.position.set(0, 0, 3.15); g.add(put(rb(2.6, 0.62, 0.5, 0.05), 0, 0.37, 0, '#8F6F52'), put(cyl(0.2, 0.16, 0.22, 20), 0.8, 0.83, 0, '#DACFBA'), put(rb(0.7, 0.05, 0.4, 0.01), -0.6, 0.66, 0, '#6B5039')); add(g, 0.5, 0.6); }
  // bookcase against the right wall, with books
  { const g = new THREE.Group(); g.position.set(3.15, 0, -1.4); g.rotation.y = -Math.PI / 2;
    g.add(put(rb(1.8, 2.5, 0.08, 0.01), 0, 1.25, -0.2, '#8F6F52'), put(rb(0.07, 2.5, 0.5, 0.01), -0.9, 1.25, 0, '#8F6F52'), put(rb(0.07, 2.5, 0.5, 0.01), 0.9, 1.25, 0, '#8F6F52'));
    [0, 0.62, 1.24, 1.86, 2.46].forEach((y) => g.add(put(rb(1.8, 0.05, 0.5, 0.01), 0, y + 0.03, 0, '#A07F5E')));
    ([['#4C1114', -0.7, 0.62], ['#DACFBA', -0.58, 0.62], ['#CEB6A8', -0.46, 0.62], ['#8A2E34', -0.34, 0.62], ['#7E9070', -0.22, 0.62], ['#DACFBA', 0.5, 1.24], ['#4C1114', 0.62, 1.24], ['#B08D6B', 0.74, 1.24], ['#8A2E34', -0.3, 1.86], ['#CEB6A8', -0.18, 1.86]] as const)
      .forEach(([c, x, y]) => g.add(put(rb(0.1, 0.42, 0.3, 0.01), x, y + 0.26, 0, c)));
    g.add(put(cyl(0.09, 0.07, 0.26, 16), 0.3, 1.97, 0, '#F8F7F4')); add(g, 0.56, 0.66); }
  // plant
  { const g = new THREE.Group(); g.position.set(-2.85, 0, 2.3); g.add(put(cyl(0.38, 0.3, 0.55, 30), 0, 0.28, 0, '#9C6F52'));
    ([[0, 0, 1.1, '#6F8662'], [0.2, 0.1, 0.8, '#7E9070'], [-0.18, -0.1, 0.9, '#8FA180'], [0.05, -0.22, 0.65, '#6F8662']] as const).forEach(([x, z, h, c], i) => {
      const s = put(new THREE.Mesh(new THREE.SphereGeometry(0.2, 14, 10)), x, 0.55 + h * 0.65, z, c); s.scale.set(1, 2.4 + i * 0.3, 0.7); s.rotation.z = (i - 1.5) * 0.12; g.add(s);
    });
    add(g, 0.6, 0.7); }
  // a side table with a table lamp, a floor lamp, and a hanging globe over the table
  const shade = (rt: number, rbm: number, h: number, y: number) => { const s = put(new THREE.Mesh(new THREE.CylinderGeometry(rt, rbm, h, 24, 1, true)), 0, y, 0, '#F4E7D2', { glow: true }); (s.material as THREE.MeshStandardMaterial).side = THREE.DoubleSide; return s; };
  { const g = new THREE.Group(); g.position.set(-2.25, 0, -2.75);
    g.add(put(cyl(0.38, 0.38, 0.06, 36), 0, 0.62, 0, '#B08D6B'), put(cyl(0.05, 0.05, 0.6, 10), 0, 0.3, 0, '#8F6F52'), put(cyl(0.2, 0.2, 0.04, 20), 0, 0.04, 0, '#8F6F52'), put(cyl(0.05, 0.05, 0.35, 10), 0, 0.85, 0, '#EEDFC8'), shade(0.2, 0.28, 0.3, 1.15));
    addLight(g, 0, 1.15, 0, 9); add(g, 0.64, 0.74); }
  { const g = new THREE.Group(); g.position.set(2.3, 0, -3.0);
    g.add(put(cyl(0.3, 0.3, 0.05, 28), 0, 0.03, 0, '#4C1114'), put(cyl(0.03, 0.03, 2.0, 10), 0, 1.0, 0, '#4C1114'), shade(0.28, 0.4, 0.45, 2.15));
    addLight(g, 0, 2.0, 0, 14); add(g, 0.68, 0.78); }
  { const g = new THREE.Group(); g.position.set(0, 0, 0.45); g.add(put(cyl(0.01, 0.01, 1.0, 6), 0, 2.65, 0, '#4C1114'), put(new THREE.Mesh(new THREE.SphereGeometry(0.26, 28, 20)), 0, 2.0, 0, '#F4E7D2', { glow: true }));
    addLight(g, 0, 1.95, 0, 12); add(g, 0.72, 0.8); }

  // ---------- size, loop, teardown ----------
  const camTarget = new THREE.Vector3(0, 0.9, 0);
  const resize = () => { const { width, height } = host.getBoundingClientRect(); if (!width || !height) return; renderer.setSize(width, height, false); camera.aspect = width / height; camera.updateProjectionMatrix(); };
  const ro = new ResizeObserver(resize); ro.observe(host); resize();
  let visible = true;
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }); io.observe(host);

  const tmp = new THREE.Vector3();
  let target = getProgress(), shown = target, raf = 0, dead = false;
  const frame = () => {
    if (dead) return;
    raf = requestAnimationFrame(frame);
    if (!visible) return; // nothing to draw while the section is off screen
    target = getProgress(); shown += (target - shown) * 0.1; const p = shown;
    for (const it of pieces) {
      const t = ease(clamp((p - it.from) / (it.to - it.from)));
      it.obj.visible = t > 0.001;
      it.obj.position.set(it.home.x + it.off.x * (1 - t), it.home.y + it.off.y * (1 - t), it.home.z + it.off.z * (1 - t));
      it.obj.rotation.y = it.rot + it.spin * (1 - t);
      if (it.rise) it.obj.scale.set(1, Math.max(t, 0.001), 1);
    }
    // the camera makes one full turn about the room's middle
    const az = Math.PI / 4 + p * Math.PI * 2, el = 0.62, R = 27;
    camera.position.set(Math.sin(az) * Math.cos(el) * R, Math.sin(el) * R + camTarget.y, Math.cos(az) * Math.cos(el) * R); camera.lookAt(camTarget);
    // walls grow, and the ones between the camera and the room are hidden
    for (const w of walls) {
      const t = ease(clamp((p - w.userData.from) / (w.userData.to - w.userData.from)));
      w.scale.y = Math.max(t, 0.001);
      w.visible = t > 0.001 && tmp.copy(camera.position).sub(w.position).dot(w.userData.n) > 0;
    }
    // the lights come on
    const on = ease(clamp((p - 0.76) / 0.2));
    glowMats.forEach((m) => { m.emissiveIntensity = m.userData.on * on; });
    lights.forEach((l) => { l.intensity = l.userData.power * on; });
    renderer.toneMappingExposure = 1.05 - 0.12 * on;
    renderer.render(scene, camera);
  };
  frame();

  return () => {
    dead = true; cancelAnimationFrame(raf); ro.disconnect(); io.disconnect();
    scene.traverse((o) => { if (o instanceof THREE.Mesh) { o.geometry.dispose(); (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose()); } });
    renderer.dispose(); renderer.domElement.remove();
  };
}
