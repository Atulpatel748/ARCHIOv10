import { modernImageUrl, modernSrcSet } from '../../utils/images.js';

// A normal <img> that also offers the smaller AVIF version of local photos. Browsers that understand AVIF take
// it; every other browser falls back to the JPEG in `src`. Pass the same props you would pass to <img>.
// When the photo exists in several sizes (see utils/images.js) the AVIF source gets a srcset, and `sizes` tells the
// browser how wide the picture is laid out. Defaults keep non-hero images lazy and decoded asynchronously so the
// initial page stays light while preserving eager loading where a specific component opts in.
export default function Picture({ src, sizes, loading = 'lazy', decoding = 'async', ...imageProps }) {
  const avif = modernImageUrl(src);
  const srcSet = modernSrcSet(src);
  const image = <img src={src} loading={loading} decoding={decoding} {...imageProps} />;
  if (!avif) return image;
  return (
    <picture>
      <source type="image/avif" srcSet={srcSet ?? avif} sizes={srcSet ? sizes : undefined} />
      {image}
    </picture>
  );
}
