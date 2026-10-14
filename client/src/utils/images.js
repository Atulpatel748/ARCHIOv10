import widths from '../generated/image-widths.json' with { type: 'json' };

// Photos that live in /images/ come in two files: the original .jpg and a much smaller .avif made by
// `npm run images`, which also makes a smaller .avif for every size step below the photo's own width (NN-1200.avif)
// and lists the widths in src/generated/image-widths.json. Anything else (an https:// address in the portfolio data,
// a PNG logo) has no sibling, so it is shown as it is.
const LOCAL_JPEG = /^\/images\/.+\.jpe?g$/i;

const avifOf = (url) => url.replace(/\.jpe?g$/i, '.avif');
// The largest size is the plain NN.avif; the steps below it carry their width in the name.
const fileAt = (url, list, width) => (width === list.at(-1) ? avifOf(url) : avifOf(url).replace(/\.avif$/, `-${width}.avif`));

/** The AVIF twin of a local photo, or null. With `wanted` (pixels), the smallest size that is at least that wide. */
export function modernImageUrl(url, wanted) {
  if (typeof url !== 'string' || !LOCAL_JPEG.test(url)) return null;
  const list = widths[url];
  if (!wanted || !list || list.length < 2) return avifOf(url);
  return fileAt(url, list, list.find((width) => width >= wanted) ?? list.at(-1));
}

/** A srcset of every AVIF size that exists for a local photo, or null when there is only one. */
export function modernSrcSet(url) {
  if (typeof url !== 'string' || !LOCAL_JPEG.test(url)) return null;
  const list = widths[url];
  return list && list.length > 1 ? list.map((width) => `${fileAt(url, list, width)} ${width}w`).join(', ') : null;
}
