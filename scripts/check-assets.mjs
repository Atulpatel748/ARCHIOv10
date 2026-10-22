import { readdir, readFile, stat } from 'node:fs/promises';
import { extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const publicDir = join(root, 'client', 'public');
const imagesDir = join(publicDir, 'images');
const manifestPath = join(root, 'client', 'src', 'generated', 'image-widths.json');
const errors = [];
const allFiles = [];

async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) await walk(full);
    else allFiles.push(full);
  }
}

const starts = (buffer, signature) => signature.every((value, index) => buffer[index] === value);
const isJpeg = (b) => b.length >= 3 && starts(b, [0xff, 0xd8, 0xff]);
const isPng = (b) => b.length >= 8 && starts(b, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const isWebp = (b) => b.length >= 12 && b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP';
const isAvif = (b) => b.length >= 12 && b.toString('ascii', 4, 8) === 'ftyp' && ['avif', 'avis'].includes(b.toString('ascii', 8, 12));
const rel = (file) => relative(root, file).replaceAll('\\', '/');

await walk(publicDir);
const filesSet = new Set(allFiles);
for (const file of allFiles) {
  const ext = extname(file).toLowerCase();
  const buffer = await readFile(file);
  const valid = ext === '.jpg' || ext === '.jpeg' ? isJpeg(buffer)
    : ext === '.png' ? isPng(buffer)
    : ext === '.webp' ? isWebp(buffer)
    : ext === '.avif' ? isAvif(buffer)
    : true;
  if (!valid) errors.push(`${rel(file)}: file contents do not match .${ext.slice(1)} extension`);
  if (ext === '.jpg' || ext === '.jpeg') {
    const avif = file.replace(/\.jpe?g$/i, '.avif');
    if (!filesSet.has(avif)) errors.push(`${rel(file)}: missing matching AVIF ${rel(avif)}`);
  }
}

let manifest;
try {
  manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
} catch (error) {
  errors.push(`Cannot read image width manifest: ${error.message}`);
  manifest = {};
}
const jpegFiles = allFiles.filter((file) => file.startsWith(imagesDir + '/') && /\.jpe?g$/i.test(file));
for (const file of jpegFiles) {
  const url = '/' + relative(publicDir, file).replaceAll('\\', '/');
  if (!Object.hasOwn(manifest, url)) errors.push(`${url}: missing entry in image-widths.json`);
}
for (const [url, widths] of Object.entries(manifest)) {
  const source = join(publicDir, url.replace(/^\//, ''));
  try { await stat(source); } catch { errors.push(`${url}: image-width manifest points to a missing source file`); continue; }
  if (!Array.isArray(widths) || widths.length === 0 || widths.some((w, i) => !Number.isInteger(w) || w <= 0 || (i > 0 && w <= widths[i - 1]))) {
    errors.push(`${url}: widths must be positive, unique and ascending`);
    continue;
  }
  const stem = source.replace(/\.jpe?g$/i, '.avif');
  for (let i = 0; i < widths.length; i += 1) {
    const variant = i === widths.length - 1 ? stem : stem.replace(/\.avif$/i, `-${widths[i]}.avif`);
    try { await stat(variant); } catch { errors.push(`${url}: missing responsive variant ${rel(variant)}`); }
  }
}

if (errors.length) {
  console.error(`Asset integrity check failed (${errors.length} issue${errors.length === 1 ? '' : 's'}):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(`Asset integrity check passed: ${allFiles.length} image assets, ${jpegFiles.length} JPEG sources, matching AVIF files and responsive manifest.`);
}
