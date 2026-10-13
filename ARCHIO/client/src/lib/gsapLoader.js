// Loads GSAP + ScrollTrigger only when something actually needs them, and only once: HomePage is
// shipped in the main bundle (see routes/index.jsx), so importing gsap at the top of a module used
// there would add it to every single page's first load. Dynamic import keeps it in its own chunk,
// fetched lazily and only for the people who will actually see the scroll effect.
let loadPromise;

export function loadGsap() {
  loadPromise ??= Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(([gsapModule, scrollTriggerModule]) => {
    const { gsap } = gsapModule;
    const { ScrollTrigger } = scrollTriggerModule;
    gsap.registerPlugin(ScrollTrigger);
    return { gsap, ScrollTrigger };
  }).catch(() => {
    // The chunk failed (offline, or an old deploy's file is gone): the effects are decoration, so skip them quietly
    // instead of raising an unhandled rejection in every caller, and let the next caller try again.
    loadPromise = undefined;
    return new Promise(() => {});
  });
  return loadPromise;
}
