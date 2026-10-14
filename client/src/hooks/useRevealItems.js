import { useCallback, useRef } from 'react';
import { revealChildren } from '../lib/reveal.js';

// A callback ref, so it works for containers that only mount once data has loaded:
//   <div ref={useRevealItems()} className="grid">…</div>
export function useRevealItems(options) {
  const cleanup = useRef(null);
  const stagger = options?.stagger;
  return useCallback(
    (node) => {
      cleanup.current?.();
      cleanup.current = node ? revealChildren(node, { stagger }) : null;
    },
    [stagger],
  );
}
