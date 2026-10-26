import Image from 'next/image';
import Split from './Split';
import styles from './PageHero.module.scss';

type Props = {
  title: string;
  accent?: string;
  label?: string;
  intro?: string;
  image: { src: string; alt: string };
  caption?: string;
  size?: 'full' | 'tall';
  children?: React.ReactNode;
};

// Full-bleed image hero with the title set over a dark base (after both references).
export default function PageHero({ title, accent, label, intro, image, caption, size = 'tall', children }: Props) {
  return (
    <section className={`${styles.hero} ${size === 'full' ? styles.full : ''}`}>
      <Image src={image.src} alt={image.alt} fill priority sizes="100vw" className={styles.image} />
      <div className={styles.shade} aria-hidden="true" />
      <div className={`container ${styles.content}`}>
        {label && <p className="label">{label}</p>}
        <Split as="h1" className={size === 'full' ? styles.titleXl : styles.title} text={title} accent={accent} />
        {intro && <p className={styles.intro}>{intro}</p>}
        {children}
      </div>
      {caption && <p className={styles.caption}>{caption}</p>}
    </section>
  );
}
