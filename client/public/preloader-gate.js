// The loading screen plays once per browser tab. sessionStorage belongs to one tab and survives a reload, so a reload
// (or another visit in the same tab) skips the screen, while a new tab plays it again. This runs before the page is
// drawn, so a skipped screen never flashes. It is a file rather than an inline script because the site's CSP allows
// scripts from its own origin only.
try {
  if (sessionStorage.getItem('archio-preloader-seen')) document.documentElement.setAttribute('data-preloader-seen', '');
  else sessionStorage.setItem('archio-preloader-seen', '1');
} catch {
  // Storage blocked (some private modes): show the loading screen every time, as before.
}

// The home page opens on the hero photo, so start its download at once, alongside the script instead of after it. Only
// there: on any other page the preload would go unused. The placeholder below is filled at build time with the first
// featured project's AVIF (hero-photo.js); it is empty when there is nothing to preload.
const HERO_PHOTO = '__HERO_PHOTO__';
if (location.pathname === '/' && HERO_PHOTO.startsWith('/')) {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.type = 'image/avif';
  link.href = HERO_PHOTO;
  link.fetchPriority = 'high';
  document.head.appendChild(link);
}
