// Four tiny isometric "models", one per step of the process: two parties meeting (the first conversation), a floor plan with blocks
// (the strategy), a fan of material swatches (the guided decisions) and a finished room corner (the execution). Plain SVG, a few
// polygons each, drawn in the brand palette; no images and no libraries.
type Box = { x: number; y: number; z: number; w: number; d: number; h: number; top?: string; left?: string; right?: string };

const U = 11; // pixels per unit
const pt = (x: number, y: number, z: number) => `${((x - y) * 0.866 * U).toFixed(1)},${(((x + y) * 0.5 - z) * U).toFixed(1)}`;

// Faces of a box seen from above and in front: the top, the face on the left (y + d side) and the face on the right (x + w side).
function Cube({ x, y, z, w, d, h, top = 'var(--sand)', left = 'var(--blush)', right = 'var(--oxblood)', k }: Box & { k: number }) {
  const face = (pts: [number, number, number][], fill: string, op = 1) => (
    <polygon points={pts.map((p) => pt(...p)).join(' ')} fill={fill} fillOpacity={op} />
  );
  return (
    <g style={{ '--k': k } as React.CSSProperties}>
      {face([[x, y + d, z], [x + w, y + d, z], [x + w, y + d, z + h], [x, y + d, z + h]], left)}
      {face([[x + w, y, z], [x + w, y + d, z], [x + w, y + d, z + h], [x + w, y, z + h]], right, 0.82)}
      {face([[x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h]], top)}
    </g>
  );
}

const SCENES: Box[][] = [
  // 1. Two parties and an idea between them
  [
    { x: 0, y: 0, z: 0, w: 2, d: 2, h: 2.4 },
    { x: 2.6, y: 0.6, z: 0, w: 1.8, d: 1.8, h: 1.4 },
    { x: 1.7, y: 0.9, z: 3.3, w: 0.8, d: 0.8, h: 0.8, top: 'var(--paper)' },
  ],
  // 2. A floor plan: a slab with the blocks of a layout
  [
    { x: 0, y: 0, z: 0, w: 5, d: 5, h: 0.25 },
    { x: 0.5, y: 0.5, z: 0.25, w: 1.6, d: 1, h: 0.7 },
    { x: 3.1, y: 0.5, z: 0.25, w: 1.2, d: 1.2, h: 0.45 },
    { x: 1, y: 3, z: 0.25, w: 2.6, d: 1, h: 0.45 },
  ],
  // 3. Material swatches fanned out, each a step higher and further along
  [
    { x: 0, y: 1.6, z: 0, w: 3, d: 2.4, h: 0.35, top: 'var(--oxblood)', left: 'var(--oxblood)', right: 'var(--oxblood)' },
    { x: 0.8, y: 0.8, z: 0.55, w: 3, d: 2.4, h: 0.35, top: 'var(--blush)', left: 'var(--sand)', right: 'var(--oxblood)' },
    { x: 1.6, y: 0, z: 1.1, w: 3, d: 2.4, h: 0.35, top: 'var(--sand)', left: 'var(--blush)', right: 'var(--oxblood)' },
  ],
  // 4. A finished room: floor, two walls, a sofa and a lamp
  [
    { x: 0, y: 0, z: 0, w: 5, d: 5, h: 0.2 },
    { x: 0, y: 0, z: 0.2, w: 0.25, d: 5, h: 3.2, top: 'var(--blush)', left: 'var(--sand)', right: 'var(--blush)' },
    { x: 0.25, y: 0, z: 0.2, w: 4.75, d: 0.25, h: 3.2, top: 'var(--blush)', left: 'var(--sand)', right: 'var(--blush)' },
    { x: 1.4, y: 1.6, z: 0.2, w: 2, d: 1.2, h: 0.8 },
    { x: 3.9, y: 0.5, z: 0.2, w: 0.45, d: 0.45, h: 1.5, top: 'var(--paper)' },
  ],
];

export default function StepGlyph({ step, className }: { step: number; className?: string }) {
  const boxes = SCENES[step % SCENES.length];
  return (
    <svg className={className} viewBox="-49 -42 98 106" aria-hidden="true" focusable="false">
      <g stroke="var(--oxblood)" strokeOpacity="0.5" strokeWidth="0.6" strokeLinejoin="round">
        {boxes.map((b, i) => <Cube key={i} k={i} {...b} />)}
      </g>
    </svg>
  );
}
