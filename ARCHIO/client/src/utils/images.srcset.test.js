import { describe, expect, it, vi } from 'vitest';

// A photo that exists at several sizes: 800 and 1600 are smaller steps, 2400 is the photo's own size.
vi.mock('../generated/image-widths.json', () => ({ default: { '/images/p/big.jpg': [800, 1600, 2400], '/images/p/small.jpg': [707] } }));
const { modernImageUrl, modernSrcSet } = await import('./images.js');

describe('photos in several sizes', () => {
  it('offers every size in a srcset, the largest as the plain .avif', () => {
    expect(modernSrcSet('/images/p/big.jpg')).toBe('/images/p/big-800.avif 800w, /images/p/big-1600.avif 1600w, /images/p/big.avif 2400w');
  });

  it('picks the smallest size that is wide enough, and the largest when none is', () => {
    expect(modernImageUrl('/images/p/big.jpg', 700)).toBe('/images/p/big-800.avif');
    expect(modernImageUrl('/images/p/big.jpg', 1200)).toBe('/images/p/big-1600.avif');
    expect(modernImageUrl('/images/p/big.jpg', 5000)).toBe('/images/p/big.avif');
    expect(modernImageUrl('/images/p/big.jpg')).toBe('/images/p/big.avif');
  });

  it('keeps a photo with one size as a single file', () => {
    expect(modernSrcSet('/images/p/small.jpg')).toBeNull();
    expect(modernImageUrl('/images/p/small.jpg', 2000)).toBe('/images/p/small.avif');
  });
});
