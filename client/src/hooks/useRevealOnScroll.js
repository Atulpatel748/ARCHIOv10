
import { useEffect, useRef } from 'react';

// Reveals an element as it scrolls into view: a small upward fade, matching the reference site's
// scroll-driven motion. Runs once per element, and does nothing for people who asked for reduced motion.
export function useRevealOnScroll() {
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    element.classList.add('reveal');
    let cancelSettle = null;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          element.classList.add('reveal--visible');
          observer.disconnect();
          // Once it has settled, remove the classes: the end state is identical to the unstyled element,
          // and the browser can release the compositing layer that `will-change` was holding.
          const stop = () => {
            element.removeEventListener('transitionend', onEnd);
            window.clearTimeout(fallback);
            cancelSettle = null;
          };
          const settle = () => {
            stop();
            element.classList.remove('reveal', 'reveal--visible');
          };
          const onEnd = (event) => {
            if (event.target === element && event.propertyName === 'transform') settle();
          };
          element.addEventListener('transitionend', onEnd);
          const fallback = window.setTimeout(settle, 1200); // if transitionend never fires (hidden tab)
          cancelSettle = stop;
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -10% 0px' },
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
      if (cancelSettle) cancelSettle();
    };
  }, []);

  return ref;
}
