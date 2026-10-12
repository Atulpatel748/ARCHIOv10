// Photos that live in /images/ come in two files: the original .jpg and a much smaller .avif made by
// `npm run images`. Anything else (an https:// address in the portfolio data, a PNG logo) has no sibling, so
// it is shown as it is.
const LOCAL_JPEG = /^\/images\/.+\.jpe?g$/i;

export function modernImageUrl(url) {
  return typeof url === 'string' && LOCAL_JPEG.test(url) ? url.replace(/\.jpe?g$/i, '.avif') : null;
}
