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

// A mailto: link opens whatever mail program the computer has set (often none on a PC), so desktop visitors also get
// this link, which opens a Gmail compose window addressed to the studio.
export const GMAIL_COMPOSE_URL = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(SITE.email)}`;

export const NAV_LINKS =Object.freeze([
  { to: '/projects', label: 'Projects' },
  { to: '/services', label: 'Services' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]);

