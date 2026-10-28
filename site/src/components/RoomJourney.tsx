import type { CSSProperties } from 'react';
import Link from 'next/link';
import Sequence from './Sequence';
import RoomScene from './RoomScene';
import Split from './Split';
import Roll from './Roll';
import styles from './RoomJourney.module.scss';

type Step = { title: string; text: string };

// "How it goes" as a 3D room that builds itself and turns one full circle while you scroll through the four steps (an illustration
// in thin lines, after Wood & Weave's process section). Plain CSS 3D, no library: <Sequence> publishes the scroll progress as
// --progress, and every piece computes its own build state from it in CSS, so no script runs per frame. Only the walls on the far
// side are drawn (single-sided), so you always look inside. With reduced motion, or when not pinned (phones, small windows), it is the
// finished room, standing still. The room itself loads only when you near it (RoomScene), so it costs nothing at page load.

const LABELS = ['Brief', 'Strategy', 'Decisions', 'Execution'];
const vars = (o: Record<string, string | number>) => o as CSSProperties;

export default function RoomJourney({ steps }: { steps: Step[] }) {
  return (
    <Sequence className={styles.track}>
      <div className={styles.stage}>
        <div className={styles.steps}>
          <p className="label">How it goes</p>
          <Split className={styles.big} text="From the first conversation" accent="to the final handover." />
          <ol>
            {steps.map((s, i) => (
              <li key={s.title} style={vars({ '--at': i * 0.25, '--next': i < 3 ? (i + 1) * 0.25 : 2 })}>
                <span className={styles.eyebrow}>{String(i + 1).padStart(2, '0')} · {LABELS[i]}</span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </li>
            ))}
          </ol>
          <Link prefetch={false} href="/contact" className="btn btn--solid"><Roll>Start a project</Roll></Link>
        </div>

        <RoomScene />

        <p className={`label ${styles.tag}`}>Illustration</p>
      </div>
    </Sequence>
  );
}
