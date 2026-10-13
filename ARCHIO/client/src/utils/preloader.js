// The static #app-preloader (index.html, styled by styles/preloader.css) covers the screen until the first screen
// is really ready. It leaves when React has painted AND nothing is still holding it. The home page holds it until
// the hero's first photo is on the canvas, so the visitor never sees the black box the gallery sits on while that
// photo loads. A hold can never trap the visitor: the preloader leaves after MAX_WAIT_MS whatever happens (slow
// network, a photo that fails).
export const MAX_WAIT_MS = 4000;
export const EXIT_MS = 300; // fade duration in preloader.css

const holds = new Set();
let painted = false;
let gone = false;

function leave() {
  if (gone) return;
  gone = true;
  const element = document.getElementById('app-preloader');
  if (!element) return;
  element.classList.add('is-hidden');
  setTimeout(() => element.remove(), EXIT_MS);
}

function check() {
  if (painted && holds.size === 0) leave();
}

/** Keeps the preloader up until releasePreloader(name) is called. Call before the app renders. */
export function holdPreloader(name) {
  if (!gone) holds.add(name);
}

export function releasePreloader(name) {
  holds.delete(name);
  check();
}

/** Called once React has painted. The preloader leaves now, or as soon as the last hold is released. */
export function preloaderPainted() {
  painted = true;
  check();
  setTimeout(leave, MAX_WAIT_MS);
}

/** Test helper: back to the initial state. */
export function resetPreloaderForTests() {
  holds.clear();
  painted = false;
  gone = false;
}
