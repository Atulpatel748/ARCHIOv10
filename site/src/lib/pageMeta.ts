import type { Metadata } from 'next';

export const shareImage = '/images/projects/dubai-marina-residence/main-bedroom.webp';

// Next.js replaces the root layout's openGraph whole when a page sets its own, so every page repeats the site-wide fields.
// They live here once, so a new share image or locale is a one-line change.
export const pageOpenGraph = (title: string, description: string, images: string[] = [shareImage]): Metadata['openGraph'] =>
  ({ type: 'website', siteName: 'Archió Interior Design Studio', locale: 'en_AE', images, title, description });
