import type { Metadata, Viewport } from 'next';
import { preload } from 'react-dom';
import { Belleza, Lora, Public_Sans } from 'next/font/google';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BackToTop from '@/components/BackToTop';
import Cursor from '@/components/Cursor';
import Reveals from '@/components/Reveals';
import Preloader from '@/components/Preloader';
import { site } from '@/content/site';
import './globals.scss';

// Belleza stands in for Optima (not licensed for web); Public Sans and Lora are the brand kit's own fonts.
// Latin only: every page is English, and a preloaded "latin-ext" file (letters like ł, č, ő) was downloaded on every visit
// although no page used it (about 38 KB). If copy with such letters is ever added, put 'latin-ext' back.
const display = Belleza({ weight: '400', subsets: ['latin'], variable: '--font-display', display: 'swap' });
const ui = Public_Sans({ weight: ['300', '400', '500'], subsets: ['latin'], variable: '--font-ui', display: 'swap' });
const body = Lora({ weight: '400', subsets: ['latin'], variable: '--font-body', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: 'Archió | Interior Design Studio in Dubai', template: '%s | Archió Interior Design Studio' },
  description: 'Archió is a consultancy-led interior design studio in Dubai for residential, commercial, mixed-use and landscape projects.',
  openGraph: { type: 'website', siteName: 'Archió Interior Design Studio', locale: 'en_AE', images: ['/images/projects/dubai-marina-residence/main-bedroom.webp'] },
  twitter: { card: 'summary_large_image' },
};

export const viewport: Viewport = { themeColor: '#4C1114' };

const organization = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Archió Interior Design Studio',
  alternateName: ['ARCHIÓ', 'Archio'],
  url: site.url,
  logo: `${site.url}/brand/logo-lockup.svg`,
  email: site.email,
  telephone: site.phone,
  sameAs: [site.instagramHref],
  areaServed: 'Dubai, United Arab Emirates',
  parentOrganization: { '@type': 'Organization', name: 'Beracah Trading' },
  founder: [
    { '@type': 'Person', name: 'Pooja Vijayakumar', jobTitle: 'Co-Founder, Design' },
    { '@type': 'Person', name: 'S. Harshitha', jobTitle: 'Co-Founder, Strategy & Growth' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  preload('/brand/logo-wordmark.svg', { as: 'image', crossOrigin: 'anonymous' }); // the wordmark is a CSS mask, which the browser would otherwise find late; mask images load in CORS mode, so the preload must too
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth" className={`${display.variable} ${ui.variable} ${body.variable}`}>
      <head>
        {/* The preloader is for the landing page, the first time the site is opened in a tab: every other page and every later visit skips it, before first paint. */}
        <script dangerouslySetInnerHTML={{ __html: "(function(){var d=document.documentElement,f=1;try{var k='archio-seen';f=!sessionStorage.getItem(k);sessionStorage.setItem(k,'1')}catch(e){}if(!f||location.pathname!=='/')d.setAttribute('data-no-preloader','')})()" }} />
      </head>
      <body>
        <a className="skip-link" href="#main">Skip to content</a>
        <Preloader />
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <BackToTop />
        <Reveals />
        <Cursor />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }} />
      </body>
    </html>
  );
}
