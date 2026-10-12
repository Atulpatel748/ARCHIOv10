import { modernImageUrl } from '../../utils/images.js';

// A normal <img> that also offers the smaller AVIF version of local photos. Browsers that understand AVIF take
// it; every other browser falls back to the JPEG in `src`. Pass the same props you would pass to <img>.
// Defaults keep non-hero images lazy and decoded asynchronously so the initial page stays light while preserving
// eager loading where a specific component opts in.
export default function Picture({ src, loading = 'lazy', decoding = 'async', ...imageProps }) {
  const avif = modernImageUrl(src);
  const image = <img src={src} loading={loading} decoding={decoding} {...imageProps} />;
  if (!avif) return image;
  return (
    <picture>
      <source type="image/avif" srcSet={avif} />
      {image}
    </picture>
  );
}
