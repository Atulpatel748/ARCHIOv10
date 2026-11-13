import type { Metadata } from 'next';
import Link from 'next/link';
import Roll from '@/components/Roll';

export const metadata: Metadata = { title: 'Page not found' };

export default function NotFound() {
  return (
    <section className="not-found" data-dark-end>
      <div className="container">
        <p className="label">Page not found</p>
        <h1 className="display">This page is not here.</h1>
        <p className="not-found__text">The address may have changed. The projects, services and studio are one step away.</p>
        <div className="not-found__links">
          <Link prefetch={false} href="/projects" className="btn btn--light"><Roll>View projects</Roll></Link>
          <Link prefetch={false} href="/" className="btn btn--outline-light"><Roll>Home</Roll></Link>
        </div>
      </div>
    </section>
  );
}
