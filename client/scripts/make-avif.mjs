// Writes the modern-format files for every .jpg in public/images, so the site can offer smaller files to browsers that
// support them (see components/common/Picture.jsx). Run it whenever you add or replace a photo:
//
//   npm run images            only converts photos that have no .avif yet, or whose .jpg is newer
//   npm run images -- --force convert everything again (for example after changing QUALITY)
//
// For a photo NN.jpg it writes NN.avif at the photo's own size, and, when the photo is larger than a step in WIDTHS,
// a smaller NN-<width>.avif for each step below it (never an enlarged copy). It also writes
// src/generated/image-widths.json, which lists the widths that exist for each photo, so the page can offer the right
// one (srcset) instead of one size for every screen. Photos at or under the smallest step get only NN.avif.
//
// The .jpg stays in place as the fallback for older browsers and for anything that links to it directly.
import { mkdir, readdir, stat, writeFile } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';
import sharp from 'sharp';

// 50 keeps these architectural renders about 60 to 70 percent smaller than the JPEGs with only a slight
// softening of the very finest texture. Lower it to save more bytes, raise it (up to about 65) for more detail.
export const QUALITY = 50;
export const WIDTHS = [800, 1200, 1600, 2400];
const EFFORT = 6; // 0 fastest, 9 smallest; 6 is a good balance for a handful of photos

const publicDir = join(import.meta.dirname, '../public');
const root = join(publicDir, 'images');
const manifestFile = join(import.meta.dirname, '../src/generated/image-widths.json');
const force = process.argv.includes('--force');

async function* jpegs(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* jpegs(path);
    else if (/\.jpe?g$/i.test(entry.name)) yield path;
  }
}

const newer = async (a, b) => {
  try {
    return (await stat(a)).mtimeMs > (await stat(b)).mtimeMs;
  } catch {
    return true; // the .avif does not exist yet
  }
};

const urlOf = (file) => `/${relative(publicDir, file).replaceAll('\\', '/')}`;

let before = 0;
let after = 0;
let converted = 0;
let skipped = 0;
const manifest = {};
for await (const jpg of jpegs(root)) {
  const avif = jpg.replace(/\.jpe?g$/i, '.avif');
  const { width } = await sharp(jpg).metadata();
  const steps = [...WIDTHS.filter((step) => step < width), width];
  manifest[urlOf(jpg)] = steps;

  const stale = force || (await newer(jpg, avif));
  const missing = [];
  for (const step of steps.slice(0, -1)) {
    const variant = avif.replace(/\.avif$/, `-${step}.avif`);
    if (stale || (await newer(jpg, variant))) missing.push([step, variant]);
  }
  if (!stale && missing.length === 0) {
    skipped += 1;
    continue;
  }
  const jpgSize = (await stat(jpg)).size;
  const image = sharp(jpg);
  const buffer = await image.clone().avif({ quality: QUALITY, effort: EFFORT }).toBuffer();
  await writeFile(avif, buffer);
  for (const [step, variant] of missing) {
    await writeFile(variant, await image.clone().resize({ width: step }).avif({ quality: QUALITY, effort: EFFORT }).toBuffer());
  }
  converted += 1;
  before += jpgSize;
  after += buffer.length;
  console.log(`${relative(root, jpg).padEnd(52)} ${String(Math.round(jpgSize / 1024)).padStart(4)} KiB -> ${String(Math.round(buffer.length / 1024)).padStart(4)} KiB  widths ${steps.join(', ')}`);
}

await mkdir(dirname(manifestFile), { recursive: true });
const lines = Object.entries(manifest)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([url, steps]) => `  ${JSON.stringify(url)}: [${steps.join(', ')}]`);
await writeFile(manifestFile, `{\n${lines.join(',\n')}\n}\n`);

const kib = (n) => `${Math.round(n / 1024)} KiB`;
console.log(`\nconverted ${converted}, already up to date ${skipped}${converted ? `; ${kib(before)} -> ${kib(after)} (${Math.round((1 - after / before) * 100)}% smaller)` : ''}`);
console.log(`wrote ${relative(join(import.meta.dirname, '..'), manifestFile)} (${Object.keys(manifest).length} photos)`);
