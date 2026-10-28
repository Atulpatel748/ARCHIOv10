import Split from './Split';
import styles from './PageHead.module.scss';

type Props = { label: string; title: string; accent?: string; intro?: string; children?: React.ReactNode };

// A plain page opening with no photograph behind it: the label and a large uppercase title on the left, the introduction and
// any actions beside it on the right (stacked on narrow screens).
export default function PageHead({ label, title, accent, intro, children }: Props) {
  return (
    <section className={styles.head}>
      <div className={`container ${styles.grid}`}>
        <div className={styles.main}>
          <p className="label" data-reveal>{label}</p>
          <Split as="h1" className={styles.title} text={title} accent={accent} />
        </div>
        {(intro || children) && (
          <div className={styles.side} data-reveal>
            {intro && <p className={styles.intro}>{intro}</p>}
            {children}
          </div>
        )}
      </div>
    </section>
  );
}
