import { readdirSync, statSync } from 'node:fs';
import sharp from 'sharp';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import widths from '../generated/image-widths.json';
import { modernImageUrl } from './images.js';

describe('modernImageUrl', () => {
  it('points local photos at their AVIF twin', () => {
    expect(modernImageUrl('/images/projects/a-b/01.jpg')).toBe('/images/projects/a-b/01.avif');
    expect(modernImageUrl('/images/team/x.JPEG')).toBe('/images/team/x.avif');
  });

  it('offers nothing for files that have no twin', () => {
    expect(modernImageUrl('https://example.com/images/a.jpg')).toBeNull(); // someone else's server
    expect(modernImageUrl('/brand/logo-mark.png')).toBeNull(); // not a photo
    expect(modernImageUrl('/images/projects/a/01.avif')).toBeNull(); // already modern
    expect(modernImageUrl('/other/folder/a.jpg')).toBeNull(); // outside /images
    expect(modernImageUrl(undefined)).toBeNull();
  });
});

describe('photos on disk', () => {
  const root = join(import.meta.dirname, '../../public/images');
  const walk = (dir) =>
    readdirSync(dir, { withFileTypes: true }).flatMap((entry) => (entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)]));
  const jpegs = walk(root).filter((file) => file.endsWith('.jpg'));

  it('finds the photos', () => {
    expect(jpegs.length).toBeGreaterThan(30);
  });

  it('gives every JPEG an AVIF twin that is actually smaller (run `npm run images` if this fails)', () => {
    const problems = [];
    for (const jpg of jpegs) {
      const avif = jpg.replace(/\.jpg$/, '.avif');
      let avifSize;
      try {
        avifSize = statSync(avif).size;
      } catch {
        problems.push(`missing ${avif.replace(root, '')}`);
        continue;
      }
      if (avifSize >= statSync(jpg).size) problems.push(`not smaller than the JPEG: ${avif.replace(root, '')}`);
    }
    expect(problems).toEqual([]);
  });

  it('lists in src/generated/image-widths.json the sizes that exist for every photo (run `npm run images` if this fails)', async () => {
    const problems = [];
    for (const jpg of jpegs) {
      const url = `/images${jpg.slice(root.length).replaceAll('\\', '/')}`;
      const steps = widths[url];
      if (!steps) {
        problems.push(`not listed: ${url}`);
        continue;
      }
      const { width } = await sharp(jpg).metadata();
      if (steps.at(-1) !== width) problems.push(`${url}: listed up to ${steps.at(-1)}, the photo is ${width} wide`);
      for (const step of steps.slice(0, -1)) {
        try {
          statSync(jpg.replace(/\.jpg$/, `-${step}.avif`));
        } catch {
          problems.push(`missing ${url} at ${step}`);
        }
      }
    }
    expect(problems).toEqual([]);
  });
});
