// Run with `npm test`. Checks that the loader picks the right ready-made copy, and that every copy it can point to exists.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import imageLoader, { SIZES } from './imageLoader.ts';

test('picks the smallest ready-made size that is at least as wide as asked', () => {
  const src = '/images/projects/jlt-office/boardroom.webp';
  assert.equal(imageLoader({ src, width: 100 }), '/images/projects/jlt-office/boardroom-256.webp');
  assert.equal(imageLoader({ src, width: 300 }), '/images/projects/jlt-office/boardroom-384.webp');
  assert.equal(imageLoader({ src, width: 384 }), '/images/projects/jlt-office/boardroom-384.webp');
  assert.equal(imageLoader({ src, width: 385 }), '/images/projects/jlt-office/boardroom-640.webp');
  assert.equal(imageLoader({ src, width: 750 }), '/images/projects/jlt-office/boardroom-828.webp');
  assert.equal(imageLoader({ src, width: 1200 }), '/images/projects/jlt-office/boardroom-1920.webp');
  assert.equal(imageLoader({ src, width: 3840 }), '/images/projects/jlt-office/boardroom-1920.webp'); // never larger than the biggest copy
});

test('leaves anything that is not a photo in public/images alone', () => {
  assert.equal(imageLoader({ src: '/brand/logo-wordmark.svg', width: 640 }), '/brand/logo-wordmark.svg');
  assert.equal(imageLoader({ src: '/images/team/photo.png', width: 640 }), '/images/team/photo.png');
});

test('every photo has all its ready-made sizes (run `npm run images` if this fails)', () => {
  const root = path.resolve(import.meta.dirname, '../../public/images');
  const walk = (dir: string): string[] => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]));
  const originals = walk(root).filter((f) => f.endsWith('.webp') && !/-\d+\.webp$/.test(f) && !f.includes(`${path.sep}hero${path.sep}`));
  assert.ok(originals.length > 0, 'no photos found');
  const missing = originals.flatMap((f) => SIZES.map((s) => f.replace(/\.webp$/, `-${s}.webp`))).filter((f) => !fs.existsSync(f));
  assert.deepEqual(missing.map((f) => path.relative(root, f)), []);
});
