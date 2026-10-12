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
