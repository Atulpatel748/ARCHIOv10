// Scroll-reveal for the whole site: things fade and lift into place as they enter the viewport. Two entry points share
// one implementation of observe -> reveal -> settle:
//   revealElement(element)            one section
//   revealChildren(container, opts)   the direct children of a container, one after another
// Both do nothing for people who asked for reduced motion or where IntersectionObserver is missing, so content is never
// hidden. Both return a cleanup function. The classes (reveal, reveal-item, ...) are styled in styles/base.css.

const STAGGER_MS = 110;
const MAX_STEPS = 5; // a long list should not make the last item wait seconds
const FALLBACK_SLACK_MS = 600;
const FALLBACK_DEFAULT_MS = 1200; // CSS declares no transition: there is nothing to wait for

const motionAllowed = () =>
  typeof IntersectionObserver !== 'undefined' &&
  !(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);

const toMs = (value) => (value.trim().endsWith('ms') ? parseFloat(value) : parseFloat(value) * 1000) || 0;

// How long the element's own transition can take (the longest property, delay included) plus some slack, so the
// timeout below follows the CSS instead of repeating its durations.
function fallbackMs(element) {
  const style = getComputedStyle(element);
  const delays = style.transitionDelay.split(',');
  const longest = Math.max(0, ...style.transitionDuration.split(',').map((duration, i) => toMs(duration) + toMs(delays[i % delays.length])));
  return longest ? longest + FALLBACK_SLACK_MS : FALLBACK_DEFAULT_MS;
}

// Calls `done` once the element's transform transition ends, or after the fallback if transitionend never fires (a
// hidden tab). Returns a function that cancels it.
function whenSettled(element, done) {
  const stop = () => {
    element.removeEventListener('transitionend', onEnd);
    window.clearTimeout(timer);
  };
  const finish = () => {
    stop();
    done();
  };
  const onEnd = (event) => {
    if (event.target === element && event.propertyName === 'transform') finish();
  };
  element.addEventListener('transitionend', onEnd);
  const timer = window.setTimeout(finish, fallbackMs(element));
  return stop;
}

// A small upward fade for one section. Once it has settled the classes are removed: the end state is identical to the
// unstyled element, and the browser can release the compositing layer that `will-change` was holding.
export function revealElement(element) {
  if (!element || !motionAllowed()) return () => {};

  element.classList.add('reveal');
  let cancelSettle = () => {};
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      element.classList.add('reveal--visible');
      cancelSettle = whenSettled(element, () => element.classList.remove('reveal', 'reveal--visible'));
    },
    { threshold: 0.15, rootMargin: '0px 0px -10% 0px' },
  );
  observer.observe(element);
  return () => {
    observer.disconnect();
    cancelSettle();
  };
}

// The direct children of `container` come in one after another. Items that arrive together (a row of cards) are
// staggered; the rest reveal as the person reaches them. Children added later (a filter changing the results) are
// picked up too.
export function revealChildren(container, { stagger = STAGGER_MS } = {}) {
  if (!container || !motionAllowed()) return () => {};

  const tracked = new Set();
  const pending = new Set();

  const release = (element) => {
    element.classList.remove('reveal-item', 'reveal-item--visible');
    element.style.transitionDelay = '';
  };

  const reveal = (element, step) => {
    element.style.transitionDelay = `${Math.min(step, MAX_STEPS) * stagger}ms`;
    element.classList.add('reveal-item--visible');
    const stop = whenSettled(element, () => {
      pending.delete(stop);
      tracked.delete(element);
      release(element);
    });
    pending.add(stop);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      const arriving = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.left - b.boundingClientRect.left || a.boundingClientRect.top - b.boundingClientRect.top);
      arriving.forEach((entry, step) => {
        observer.unobserve(entry.target);
        reveal(entry.target, step);
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
  );

  const track = (element) => {
    if (!(element instanceof HTMLElement) || tracked.has(element)) return;
    tracked.add(element);
    element.classList.add('reveal-item');
    observer.observe(element);
  };

  Array.from(container.children).forEach(track);
  const mutations = new MutationObserver((records) => {
    records.forEach((record) => record.addedNodes.forEach(track));
  });
  mutations.observe(container, { childList: true });

  return () => {
    observer.disconnect();
    mutations.disconnect();
    pending.forEach((stop) => stop());
    tracked.forEach(release);
    tracked.clear();
  };
}
