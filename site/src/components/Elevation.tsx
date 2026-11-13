import type { CSSProperties } from 'react';
import styles from './RoomJourney.module.scss';

// A building elevation drawn in thin lines, line by line, while you scroll through "How it goes" (an original drawing; the four
// steps map to its four stages: guide lines, volumes, details, roof and context). No script: <Sequence> publishes the scroll
// progress as --progress, each piece works out its own part of the drawing from --a and --b (see .draw in the styles), and the
// finished drawing shows when that is not set (phones, reduced motion, no script).

type Piece = { d: string; a: number; b: number; w?: 'heavy' | 'thin' | 'faint' };

const louvres = [220, 230, 240, 250, 260, 270].map((y) => `M400 ${y}H490`).join('');
const mullions = (xs: number[], y0: number, y1: number) => xs.map((x) => `M${x} ${y0}V${y1}`).join('');

const pieces: Piece[] = [
  // 1 · Brief: the ground line
  { d: 'M20 400H580', a: 0.06, b: 0.24, w: 'heavy' },
  // 2 · Strategy: the two volumes and their slabs
  { d: 'M110 400V290H470V400', a: 0.26, b: 0.38, w: 'heavy' },
  { d: 'M150 290V190H510V290', a: 0.34, b: 0.46, w: 'heavy' },
  { d: 'M110 298H510', a: 0.4, b: 0.48, w: 'thin' },
  { d: 'M140 190V178H520V190', a: 0.44, b: 0.52, w: 'heavy' },
  // 3 · Decisions: openings, screens and the entrance
  { d: `M250 312H450V400M250 312V400${mullions([300, 350, 400], 312, 400)}M250 345H450`, a: 0.5, b: 0.64, w: 'thin' },
  { d: 'M170 322H230V400M170 322V400M160 316H240', a: 0.54, b: 0.66, w: 'thin' },
  { d: `M175 210H400V275H175Z${mullions([231, 287, 343], 210, 275)}M175 240H400`, a: 0.58, b: 0.72, w: 'thin' },
  { d: `M400 210H490V275H400Z${louvres}`, a: 0.62, b: 0.75, w: 'thin' },
  { d: `M20 372H110${mullions([40, 65, 90], 372, 400)}`, a: 0.64, b: 0.74, w: 'thin' },
  // 4 · Coordination: the roof, and the neighbours
  { d: 'M230 178V150H330V178M240 150V140H320V150', a: 0.76, b: 0.86, w: 'thin' },
  { d: 'M400 178V132H440V178M396 132H444M420 132V108', a: 0.8, b: 0.9, w: 'thin' },
  { d: 'M530 400V250L545 238L560 250V400M565 400V300H585V400', a: 0.84, b: 0.96, w: 'faint' },
];

const guides = [150, 250, 400, 510];
const vars = (o: Record<string, string | number>) => o as CSSProperties;

export default function Elevation() {
  return (
    <div className={styles.view} role="img" aria-label="A line drawing of a house, drawn stage by stage as you scroll through the four steps">
      <svg className={styles.drawing} viewBox="0 0 600 460" aria-hidden="true" focusable="false">
        <defs>
          <radialGradient id="elev-glow">
            <stop offset="0" stopColor="#EEDFC8" stopOpacity="0.95" />
            <stop offset="1" stopColor="#EEDFC8" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle className={styles.warm} cx="200" cy="360" r="64" fill="url(#elev-glow)" />
        {guides.map((x, i) => (
          <g key={x} className={styles.guide} style={vars({ '--a': 0.02 + i * 0.04, '--b': 0.14 + i * 0.04 })}>
            <line x1={x} y1="40" x2={x} y2="430" />
          </g>
        ))}
        {pieces.map((p, i) => (
          <path key={i} d={p.d} pathLength={1} className={`${styles.draw} ${p.w ? styles[p.w] : ''}`} style={vars({ '--a': p.a, '--b': p.b })} />
        ))}
      </svg>
    </div>
  );
}
