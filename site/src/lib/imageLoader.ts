'use client';
// Every <Image> uses this loader (next.config.ts): it points at a copy made ahead of time by `npm run images`,
// so Vercel never resizes a photo on request (its free plan allows 300,000 resized-image reads a month).
// The hero has its own sizes and loader (HeroSlider.tsx).

// 256 is for small thumbnails (Services shows four at 200 px); 828 sits between 640 and 1080 so a photo shown
// about 650-830 px wide does not get the much heavier 1080 copy.
// 2560 and 3200 (the 4x AI-upscaled masters' full width, 24 Nov 2026) are only asked for by retina and 4K screens
export const SIZES = [256, 384, 640, 828, 1080, 1920, 2560, 3200];

export default function imageLoader({ src, width }: { src: string; width: number; quality?: number }): string {
  if (!src.startsWith('/images/') || !src.endsWith('.webp')) return src; // anything else is served as it is
  // A 3x phone asks for 1200: the 1080 copy is half the weight of the 1920 one, and a phone screen cannot show the difference
  const want = width > 1080 && width <= 1200 ? 1080 : width;
  const size = SIZES.find((s) => s >= want) ?? SIZES[SIZES.length - 1];
  return src.replace(/\.webp$/, `-${size}.webp`);
}
