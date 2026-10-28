import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: { formats: ['image/webp'] }, // WebP only: AVIF takes far longer to encode on a first request
  poweredByHeader: false,
  async headers() {
    const headers: { key: string; value: string }[] = [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
    ];
    // HSTS must not be enabled for local HTTP development; production is expected to use HTTPS.
    if (process.env.NODE_ENV === 'production') {
      headers.push({ key: 'Strict-Transport-Security', value: 'max-age=31536000' });
    }
    return [{ source: '/:path*', headers }];
  },
};

export default nextConfig;
