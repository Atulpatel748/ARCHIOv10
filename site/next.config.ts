import type { NextConfig } from 'next';

const dev = process.env.NODE_ENV !== 'production';

// Everything the site loads comes from its own origin (fonts are self-hosted by next/font, images are local).
// script-src keeps 'unsafe-inline': Next.js writes inline scripts for hydration and the layout has an inline preloader script,
// and allowing them by nonce would make every page dynamic. style-src needs 'unsafe-inline' for the style attributes GSAP,
// the preloader and React set. blob: and data: cover three.js textures and inline SVG images. The dev server also needs
// eval (React's dev tools) and a websocket (hot reload), so those are added only outside production. challenges.cloudflare.com is
// Cloudflare Turnstile, the contact form's spam check: its script, the frame it draws in, and its calls home.
const turnstile = 'https://challenges.cloudflare.com';
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' ${turnstile}${dev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data:",
  "font-src 'self' data:",
  `connect-src 'self' ${turnstile}${dev ? ' ws:' : ''}`,
  `frame-src ${turnstile}`,
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

const nextConfig: NextConfig = {
  // Photos are resized ahead of time (npm run images) and picked by src/lib/imageLoader.ts, so Vercel never resizes on request.
  // 65 stays listed because the gallery thumbnails still ask for it; the fixed copies are all made at 70.
  images: { loader: 'custom', loaderFile: './src/lib/imageLoader.ts', qualities: [65, 75] },
  poweredByHeader: false,
  async headers() {
    const headers: { key: string; value: string }[] = [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      { key: 'Content-Security-Policy', value: csp },
    ];
    // HSTS must not be enabled for local HTTP development; production is expected to use HTTPS.
    if (!dev) {
      headers.push({ key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' });
    }
    // The photos and logos keep their file names when replaced, so a long "immutable" lifetime is not safe: a day, then a quiet refresh.
    const assetCache = { key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' };
    return [
      { source: '/:path*', headers },
      { source: '/images/:path*', headers: [assetCache] },
      { source: '/brand/:path*', headers: [assetCache] },
    ];
  },
};

export default nextConfig;
