import { useEffect } from 'react';
import { SITE } from '../../constants/site.js';

function setMeta(attribute, key, content) {
  let element = document.head.querySelector(`meta[${attribute}="${key}"]`);
  if (!content) {
    element?.remove();
    return;
  }
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function setCanonical(href) {
  let link = document.head.querySelector('link[rel="canonical"]');
  if (!href) {
    link?.remove();
    return;
  }
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', href);
}

export default function Seo({ title, description = SITE.tagline, path = '/', image = '/og-image.png', noindex = false, jsonLd }) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE.name}` : `${SITE.name} | ${SITE.tagline}`;
    const url = `${SITE.url}${path}`;
    document.title = fullTitle;
    setMeta('name', 'description', description);
    setMeta('name', 'robots', noindex ? 'noindex, nofollow' : '');
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:url', url);
    setMeta('property', 'og:image', new URL(image, SITE.url).href);
    setCanonical(noindex ? '' : url);

    let script;
    if (jsonLd) {
      script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(jsonLd).replace(/</g, '\\u003c');
      document.head.appendChild(script);
    }
    return () => script?.remove();
  }, [title, description, path, image, noindex, jsonLd]);

  return null;
}
