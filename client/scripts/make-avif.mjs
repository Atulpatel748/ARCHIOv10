// Writes an .avif next to every .jpg in public/images, so the site can offer the smaller file to browsers
// that support it (see components/common/Picture.jsx). Run it whenever you add or replace a photo:
//
//   npm run images            only converts photos that have no .avif yet, or whose .jpg is newer
//   npm run images -- --force convert everything again (for example after changing QUALITY)
//
// The .jpg stays in place as the fallback for older browsers and for anything that links to it directly.
import { readdir, stat, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import sharp from 'sharp';

// 50 keeps these 800 px architectural renders about 60 to 70 percent smaller than the JPEGs with only a slight
// softening of the very finest texture. Lower it to save more bytes, raise it (up to about 65) for more detail.
export const QUALITY = 50;
const EFFORT = 6; // 0 fastest, 9 smallest; 6 is a good balance for a handful of photos

const root = join(import.meta.dirname, '../public/images');
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

let before = 0;
let after = 0;
let converted = 0;
let skipped = 0;
for await (const jpg of jpegs(root)) {
  const avif = jpg.replace(/\.jpe?g$/i, '.avif');
  const jpgSize = (await stat(jpg)).size;
  if (!force && !(await newer(jpg, avif))) {
    skipped += 1;
    continue;
  }
  const buffer = await sharp(jpg).avif({ quality: QUALITY, effort: EFFORT }).toBuffer();
  await writeFile(avif, buffer);
  converted += 1;
  before += jpgSize;
  after += buffer.length;
  console.log(`${relative(root, jpg).padEnd(52)} ${String(Math.round(jpgSize / 1024)).padStart(4)} KiB -> ${String(Math.round(buffer.length / 1024)).padStart(4)} KiB`);
}
const kib = (n) => `${Math.round(n / 1024)} KiB`;
console.log(`\nconverted ${converted}, already up to date ${skipped}${converted ? `; ${kib(before)} -> ${kib(after)} (${Math.round((1 - after / before) * 100)}% smaller)` : ''}`);
