export const SITE = Object.freeze({
  name: 'Archió',
  tagline: 'Interior design studio',
  summary: 'An interior design consultancy in Dubai, for residential, commercial and landscape spaces.',
  parent: 'Beracah Trading',
  // Update address, licence number, and email with the actual registered details before launch.
  address: 'Dubai, United Arab Emirates',
  licenceNumber: '', // TODO: add the studio's UAE trade licence number; the footer shows the licence line once this is set
  url: (import.meta.env.VITE_SITE_URL ?? 'http://localhost:5173').replace(/\/$/, ''),
  email: 'info@beracahlogistics.com',
  phone: '+971 55 654 1410',
  logo: '/brand/logo-mark.png',
  social: [
    { label: 'Instagram', handle: '@Archio_designstudio', href: 'https://www.instagram.com/archio_designstudio/' },
  ],
});

export const NAV_LINKS = Object.freeze([
  { to: '/projects', label: 'Projects' },
  { to: '/services', label: 'Services' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]);

// The first image on the home page: the first featured project's cover, downloaded early by the <link rel="preload">
// that client/public/preloader-gate.js adds (a test keeps the two in step). If a different project becomes the first featured one, update
// both, or the early download is wasted.
export const HERO_IMAGE = '/images/projects/dubai-marina-residence/01.jpg';
