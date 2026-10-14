import { useEffect, useRef } from 'react';
import { revealElement } from '../lib/reveal.js';

// Reveals the element it is attached to as it scrolls into view (see lib/reveal.js).
export function useRevealOnScroll() {
  const ref = useRef(null);
  useEffect(() => revealElement(ref.current), []);
  return ref;
}
