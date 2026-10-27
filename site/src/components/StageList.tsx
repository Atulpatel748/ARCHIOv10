'use client';

import Image from 'next/image';
import { useState } from 'react';
import styles from './StageList.module.scss';

type Stage = { name: string; image: string; alt: string; items: { title: string; text: string }[] };

// The three stages as panels that open like an accordion: side by side on a desktop (hover or focus one and it widens to show its
// services), stacked on phones and tablets (tap to open). One is always open, so the section never looks empty.
export default function StageList({ stages }: { stages: Stage[] }) {
  const [active, setActive] = useState(0);

  return (
    <ol className={styles.panels}>
      {stages.map((s, i) => (
        <li key={s.name} className={i === active ? styles.open : undefined} onMouseEnter={() => setActive(i)}>
          <Image src={s.image} alt={s.alt} fill sizes="(max-width: 1023px) 100vw, 60vw" />
          <div className={styles.veil} aria-hidden="true" />
          <h3 className={styles.head}>
            <button type="button" aria-expanded={i === active} onClick={() => setActive(i)} onFocus={() => setActive(i)}>
              <span className={styles.num} aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
              <span className={styles.vName}>{s.name}</span>
              <span className={styles.hName} aria-hidden="true">{s.name}</span>
            </button>
          </h3>
          <div className={styles.items}>
            {s.items.map((it) => (
              <div key={it.title}>
                <h4>{it.title}</h4>
                <p>{it.text}</p>
              </div>
            ))}
          </div>
        </li>
      ))}
    </ol>
  );
}
