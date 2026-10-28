import type { Metadata, Viewport } from 'next';
import { preload } from 'react-dom';
import { Belleza, Lora, Public_Sans } from 'next/font/google';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BackToTop from '@/components/BackToTop';
import Cursor from '@/components/Cursor';
import Reveals from '@/components/Reveals';
import { site } from '@/content/site';
import './globals.scss';

// Belleza stands in for Optima (not licensed for web); Public Sans and Lora are the brand kit's own fonts.
const display = Belleza({ weight: '400', subsets: ['latin', 'latin-ext'], variable: '--font-display', display: 'swap' });
const ui = Public_Sans({ weight: ['300', '400', '500'], subsets: ['latin', 'latin-ext'], variable: '--font-ui', display: 'swap' });
const body = Lora({ weight: '400', subsets: ['latin', 'latin-ext'], variable: '--font-body', display: 'swap' });

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
  preload('/brand/logo-wordmark.svg', { as: 'image' }); // the wordmark is a CSS mask, which the browser would otherwise find late
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth" className={`${display.variable} ${ui.variable} ${body.variable}`}>
      <body>
        <a className="skip-link" href="#main">Skip to content</a>
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
