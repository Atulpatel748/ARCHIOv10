import type { CSSProperties } from 'react';
import styles from './RoomJourney.module.scss';

// The room itself (about 470 elements): loaded only when the section is about to be scrolled to, see RoomScene.
const FACES = ['top', 'front', 'back', 'right', 'left'] as const;
const vars = (o: Record<string, string | number>) => o as CSSProperties;
const win = (from: number, to: number) => vars({ '--from': from, '--to': to });

// x, y (floor position), width, depth, height, colour, builds from / to (scroll progress 0 to 1), height above the floor, lit lamp, shadow
type Box = [number, number, number, number, number, string, number, number, number?, boolean?, boolean?];
const BOXES: Box[] = [
  // sofa: base, back, two arms, two seat cushions, two back cushions, a red cushion
  [200, 300, 300, 100, 38, '#C9AE9C', .52, .6], [200, 300, 300, 26, 112, '#C9AE9C', .53, .61], [200, 300, 28, 100, 80, '#BFA390', .54, .62], [472, 300, 28, 100, 80, '#BFA390', .54, .62],
  [228, 328, 122, 72, 18, '#D6BFAE', .56, .64, 38, false, false], [350, 328, 122, 72, 18, '#D6BFAE', .56, .64, 38, false, false],
  [232, 326, 114, 20, 54, '#D9C4B3', .57, .65, 38, false, false], [354, 326, 114, 20, 54, '#D9C4B3', .57, .65, 38, false, false], [240, 340, 40, 14, 40, '#8A2E34', .6, .67, 56, false, false],
  // coffee table (top, four legs), books, a vase
  [260, 450, 180, 90, 8, '#B08D6B', .58, .66, 32], [266, 456, 8, 8, 32, '#8F6F52', .58, .66, 0, false, false], [426, 456, 8, 8, 32, '#8F6F52', .58, .66, 0, false, false],
  [266, 524, 8, 8, 32, '#8F6F52', .58, .66, 0, false, false], [426, 524, 8, 8, 32, '#8F6F52', .58, .66, 0, false, false],
  [280, 470, 46, 34, 7, '#4C1114', .62, .7, 40, false, false], [284, 474, 38, 28, 6, '#DACFBA', .62, .7, 47, false, false],
  [390, 480, 14, 14, 26, '#F8F7F4', .63, .71, 40, false, false], [395, 485, 4, 4, 34, '#7E9070', .64, .72, 66, false, false],
  // media console, tray, bowl
  [230, 640, 240, 50, 54, '#8F6F52', .6, .68], [236, 646, 70, 38, 4, '#6B5039', .62, .7, 54, false, false], [420, 650, 30, 30, 14, '#DACFBA', .64, .72, 54, false, false],
  // armchair and pouf
  [540, 410, 90, 90, 36, '#B9A38F', .6, .68], [540, 410, 90, 22, 100, '#B9A38F', .61, .69], [540, 410, 20, 90, 70, '#AD9783', .62, .7], [610, 410, 20, 90, 70, '#AD9783', .62, .7],
  [560, 432, 50, 68, 14, '#D1BDAA', .63, .71, 36, false, false], [420, 560, 70, 70, 36, '#CEB6A8', .66, .74],
  // side table and a lit table lamp; a lit floor lamp
  [110, 310, 50, 50, 56, '#B08D6B', .64, .72], [130, 330, 10, 10, 40, '#EEDFC8', .68, .76, 56, false, false], [120, 320, 30, 30, 26, '#F4E7D2', .69, .77, 96, true, false],
  [510, 250, 44, 44, 4, '#4C1114', .66, .74, 0, false, false], [528, 268, 8, 8, 170, '#4C1114', .67, .75, 4, false, false], [516, 256, 32, 32, 34, '#F4E7D2', .7, .78, 170, true, false],
  // bookcase against the far side wall: frame, five shelves, books
  [644, 120, 54, 160, 6, '#8F6F52', .62, .7], [694, 120, 6, 160, 176, '#8F6F52', .62, .7], [644, 120, 54, 6, 176, '#8F6F52', .62, .7], [644, 274, 54, 6, 176, '#8F6F52', .62, .7],
  [644, 120, 54, 160, 5, '#A07F5E', .64, .72, 42, false, false], [644, 120, 54, 160, 5, '#A07F5E', .64, .72, 84, false, false], [644, 120, 54, 160, 5, '#A07F5E', .64, .72, 126, false, false], [644, 120, 54, 160, 5, '#A07F5E', .64, .72, 170, false, false],
  [656, 132, 36, 11, 40, '#4C1114', .7, .78, 47, false, false], [656, 146, 36, 11, 38, '#DACFBA', .7, .78, 47, false, false], [656, 160, 36, 11, 42, '#CEB6A8', .7, .78, 47, false, false], [656, 174, 36, 11, 36, '#8A2E34', .7, .78, 47, false, false], [656, 188, 36, 11, 40, '#7E9070', .7, .78, 47, false, false],
  [656, 140, 36, 18, 34, '#DACFBA', .7, .78, 89, false, false], [656, 170, 36, 18, 36, '#4C1114', .7, .78, 89, false, false], [656, 200, 36, 18, 32, '#B08D6B', .7, .78, 89, false, false], [660, 196, 20, 20, 24, '#F8F7F4', .72, .8, 131, false, false],
  // plant: pot and leaves
  [40, 500, 70, 70, 50, '#9C6F52', .66, .74], [62, 522, 12, 12, 120, '#6F8662', .72, .8, 50, false, false], [48, 512, 10, 10, 92, '#7E9070', .72, .8, 50, false, false],
  [82, 536, 10, 10, 100, '#6F8662', .72, .8, 50, false, false], [70, 548, 8, 8, 70, '#8FA180', .72, .8, 50, false, false], [54, 540, 8, 8, 140, '#7E9070', .72, .8, 50, false, false],
  // a hanging globe in the far corner: cord and lit globe
  [60, 60, 6, 6, 120, '#4C1114', .74, .8, 0, false, false], [40, 40, 46, 46, 46, '#F4E7D2', .76, .84, 120, true, false],
];
const GHOSTS = [[200, 300, 300, 100], [260, 450, 180, 90], [230, 640, 240, 50], [540, 410, 90, 90], [110, 310, 50, 50], [40, 500, 70, 70], [630, 120, 60, 160], [510, 250, 44, 44]];
const POOLS = [[130, 335], [532, 272], [75, 65]];

function Dressing() { // crown moulding, skirting and wall panels common to every wall
  return <><i className={styles.crown} /><i className={styles.skirt} /><i className={styles.panels} /></>;
}
const px = (o: Record<string, number>) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, `${v}px`])) as CSSProperties;

export default function RoomModel() {
  return (
          <div className={styles.iso}>
            <div className={styles.floor} style={win(0, 0.1)} />
            <div className={styles.shafts} />
            {GHOSTS.map(([x, y, w, d]) => <div key={`${x}-${y}`} className={styles.ghost} style={px({ '--x': x, '--y': y, '--w': w, '--d': d } as never)} />)}

            {/* Four walls, each with its own details; the sheet is single-sided so the near walls disappear */}
            <div className={`${styles.wall} ${styles.wBack}`} style={win(0.22, 0.38)}><div className={styles.sheet}>
              <Dressing />
              <div className={styles.window} style={px({ left: 90, top: 70, width: 170, height: 140 })} />
              <i className={styles.curtain} style={px({ left: 52, top: 56, height: 170 })} /><i className={styles.curtain} style={px({ left: 262, top: 56, height: 170 })} />
              <div className={styles.frame} style={px({ left: 360, top: 86, width: 110, height: 84 })} /><div className={`${styles.frame} ${styles.red}`} style={px({ left: 500, top: 100, width: 56, height: 76 })} />
              <i className={styles.sconce} style={px({ left: 330, top: 190 })} /><i className={styles.sconce} style={px({ left: 560, top: 190 })} />
            </div></div>
            <div className={`${styles.wall} ${styles.wSide} ${styles.flip}`} style={win(0.28, 0.44)}><div className={styles.sheet}>
              <Dressing />
              <div className={styles.arch} />
              <div className={styles.mirror} style={px({ left: 60, top: 70, width: 110, height: 110 })} />
              <div className={`${styles.frame} ${styles.green}`} style={px({ left: 500, top: 84, width: 90, height: 110 })} />
              <i className={styles.sconce} style={px({ left: 210, top: 190 })} /><i className={styles.sconce} style={px({ left: 470, top: 190 })} />
            </div></div>
            <div className={`${styles.wall} ${styles.wFront} ${styles.flip}`} style={win(0.32, 0.48)}><div className={styles.sheet}>
              <Dressing />
              <div className={styles.tv} style={px({ left: 230, top: 70, width: 240, height: 130 })} />
              <div className={styles.frame} style={px({ left: 80, top: 78, width: 90, height: 110 })} /><div className={`${styles.frame} ${styles.red}`} style={px({ left: 520, top: 78, width: 90, height: 110 })} />
              <i className={styles.sconce} style={px({ left: 180, top: 200 })} /><i className={styles.sconce} style={px({ left: 500, top: 200 })} />
            </div></div>
            <div className={`${styles.wall} ${styles.wSide2}`} style={win(0.36, 0.52)}><div className={styles.sheet}>
              <Dressing />
              <div className={styles.window} style={px({ left: 200, top: 60, width: 300, height: 150 })} />
              <i className={styles.curtain} style={px({ left: 158, top: 46, height: 190 })} /><i className={styles.curtain} style={px({ left: 504, top: 46, height: 190 })} />
              <div className={`${styles.frame} ${styles.green}`} style={px({ left: 60, top: 92, width: 70, height: 90 })} /><div className={styles.frame} style={px({ left: 560, top: 92, width: 80, height: 90 })} />
            </div></div>

            <div className={styles.rug} style={win(0.48, 0.56)} />
            {BOXES.map(([x, y, w, d, h, c, from, to, z0 = 0, lit = false, shadow = true], i) => (
              <div key={i} className={styles.item} style={{ ...win(from, to), ...px({ '--x': x, '--y': y, '--w': w, '--d': d, '--h': h, '--z0': z0 } as never), '--c': c } as CSSProperties}>
                {shadow && <i className={styles.sh} />}
                {FACES.map((f) => <i key={f} className={`${styles.f} ${styles[f]}`} />)}
                {lit && <i className={styles.glow} />}
              </div>
            ))}
            {POOLS.map(([x, y]) => <div key={`${x}-${y}`} className={styles.pool} style={px({ left: x - 130, top: y - 130 })} />)}
          </div>
  );
}
