import type { CSSProperties } from 'react';
import Link from 'next/link';
import Sequence from './Sequence';
import Elevation from './Elevation';
import Split from './Split';
import Roll from './Roll';
import styles from './RoomJourney.module.scss';

type Step = { title: string; text: string };

// "How it goes": the four steps beside a line drawing of a building that draws itself while you scroll (see Elevation). <Sequence>
// publishes the scroll progress as --progress. The drawing is pure CSS, so it costs no script.

const LABELS = ['Brief', 'Strategy', 'Decisions', 'Execution'];
const vars = (o: Record<string, string | number>) => o as CSSProperties;

export default function RoomJourney({ steps }: { steps: Step[] }) {
  return (
    <Sequence className={styles.track}>
      <div className={styles.stage}>
        <div className={styles.steps}>
          <p className="label">How it goes</p>
          <Split className={styles.big} text="From the first conversation" accent="to the final design." />
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

        <Elevation />

        <p className={`label ${styles.tag}`}>Illustration</p>
      </div>
    </Sequence>
  );
}
