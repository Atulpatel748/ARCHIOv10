import { useCallback, useRef } from 'react';

const STAGGER_MS = 110;
const MAX_STEPS = 5; // a long list should not make the last item wait seconds

const motionAllowed = () =>
  typeof IntersectionObserver !== 'undefined' &&
  !(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);

// Reveals the direct children of `container` one after another as they scroll into view. Items that come into
// view together (a row of cards) are staggered; the rest reveal as the person reaches them. Children that are added
// later (a filter changing the results) are picked up too. Returns a cleanup function.
export function observeRevealItems(container, { stagger = STAGGER_MS } = {}) {
  if (!container || !motionAllowed()) return () => {};

  const tracked = new Set();
  const pendingTimers = new Set();

  const release = (element) => {
    element.classList.remove('reveal-item', 'reveal-item--visible');
    element.style.transitionDelay = '';
  };

  const reveal = (element, step) => {
    element.style.transitionDelay = `${Math.min(step, MAX_STEPS) * stagger}ms`;
    element.classList.add('reveal-item--visible');
    // Once it has settled the element is identical to an unstyled one, so drop the classes and the compositing layer.
    let settled = false;
    const settle = () => {
      if (settled) return;
      settled = true;
      element.removeEventListener('transitionend', onEnd);
      window.clearTimeout(timer);
      pendingTimers.delete(timer);
      tracked.delete(element);
      release(element);
    };
    const onEnd = (event) => {
      if (event.target === element && event.propertyName === 'transform') settle();
    };
    element.addEventListener('transitionend', onEnd);
    const timer = window.setTimeout(settle, 2200); // transitionend never fires in a hidden tab
    pendingTimers.add(timer);
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
    pendingTimers.forEach((timer) => window.clearTimeout(timer));
    tracked.forEach(release);
    tracked.clear();
  };
}

// A callback ref, so it works for containers that only mount once data has loaded:
//   <div ref={useRevealItems()} className="grid">…</div>
export function useRevealItems(options) {
  const cleanup = useRef(null);
  const stagger = options?.stagger;
  return useCallback(
    (node) => {
      cleanup.current?.();
      cleanup.current = node ? observeRevealItems(node, { stagger }) : null;
    },
    [stagger],
  );
}
