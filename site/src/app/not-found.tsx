import Link from 'next/link';
import styles from './not-found.module.scss';

export default function NotFound() {
  return (
    <section className={styles.wrap}>
      <div className="container">
        <p className="label">Page not found</p>
        <h1 className="display">This page is not here.</h1>
        <p className={styles.text}>The address may have changed. The projects, services and studio are one step away.</p>
        <div className={styles.links}>
          <Link href="/projects" className="btn btn--light">View projects</Link>
          <Link href="/" className="btn btn--outline-light">Home</Link>
        </div>
      </div>
    </section>
  );
}
