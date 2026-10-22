// Scroll-reveal for the whole site: things fade and lift into place as they enter the viewport. Two entry points share
// one implementation of observe -> reveal -> settle:
//   revealElement(element)            one section
//   revealChildren(container, opts)   the direct children of a container, one after another
// Both do nothing for people who asked for reduced motion or where IntersectionObserver is missing, so content is never
// hidden. Both return a cleanup function. The classes (reveal, reveal-item, ...) are styled in styles/base.css.

import { whenTransitionEnds } from './transition.js';

const STAGGER_MS = 60;
const MAX_STEPS = 5; // a long list should not make the last item wait seconds

const motionAllowed = () =>
  typeof IntersectionObserver !== 'undefined' &&
  !(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);

// A small upward fade for one section. Once it has settled the classes are removed: the end state is identical to the
// unstyled element. It starts as soon as the section's top passes 85% of the screen height, not after a share of the
// section is visible: a share of a tall section (three project rows) would leave a blank band under the one above.
export function revealElement(element) {
  if (!element || !motionAllowed()) return () => {};

  element.classList.add('reveal');
  let cancelSettle = () => {};
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      element.classList.add('reveal--visible');
      cancelSettle = whenTransitionEnds(element, 'transform', () => element.classList.remove('reveal', 'reveal--visible'));
    },
    { threshold: 0, rootMargin: '0px 0px -15% 0px' },
  );
  observer.observe(element);
  return () => {
    observer.disconnect();
    cancelSettle();
  };
}

// The direct children of `container` come in one after another. Items that arrive together (a row of cards) are
// staggered; the rest reveal as the person reaches them. Children added later (a filter changing the results) are left
// alone and simply show: a filter is used again and again, and its results must not wait for an entrance each time.
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
    const stop = whenTransitionEnds(element, 'transform', () => {
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

  Array.from(container.children).forEach((element) => {
    tracked.add(element);
    element.classList.add('reveal-item');
    observer.observe(element);
  });

  return () => {
    observer.disconnect();
    pending.forEach((stop) => stop());
    tracked.forEach(release);
    tracked.clear();
  };
}
