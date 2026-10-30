// Makes the fixed image sizes the site serves (see src/lib/imageLoader.ts), so Vercel never has to resize a photo on request.
// Run `npm run images` after adding or replacing a photo in public/images; commit the files it writes.
// shortcut: uses the sharp copy that Next.js installs; add sharp as a devDependency if Next.js ever stops shipping it.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { SIZES } from '../src/lib/imageLoader.ts';

const root = path.resolve(import.meta.dirname, '../public/images');
const force = process.argv.includes('--force'); // remake every copy, e.g. after changing the quality below
const isSizedCopy = (file) => /-\d+\.webp$/.test(file);
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]));

// The hero keeps its own hand-made sizes (640 to 2560); every other photo gets the shared sizes.
const originals = walk(root).filter((f) => f.endsWith('.webp') && !isSizedCopy(f) && !f.includes(`${path.sep}hero${path.sep}`));
let written = 0;
for (const file of originals) {
  for (const size of SIZES) {
    const out = file.replace(/\.webp$/, `-${size}.webp`);
    if (!force && fs.existsSync(out) && fs.statSync(out).mtimeMs >= fs.statSync(file).mtimeMs) continue; // already up to date
    await sharp(file).resize({ width: size, withoutEnlargement: true }).webp({ quality: 70, effort: 6 }).toFile(out);
    written++;
  }
}
console.log(`${originals.length} photos, ${SIZES.length} sizes each: ${written} files written, the rest were already up to date.`);
