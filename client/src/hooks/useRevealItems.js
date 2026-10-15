import { useCallback, useRef } from 'react';
import { revealChildren } from '../lib/reveal.js';

// A callback ref, so it works for containers that only mount once data has loaded:
//   <div ref={useRevealItems()} className="grid">…</div>
// Only the first container this page mounts comes in. One mounted later (a filter that emptied the list and then
// filled it again) simply shows, so the entrance never replays on a filter.
export function useRevealItems(options) {
  const cleanup = useRef(null);
  const first = useRef(null);
  const stagger = options?.stagger;
  return useCallback(
    (node) => {
      cleanup.current?.();
      cleanup.current = null;
      if (!node || (first.current && first.current !== node)) return;
      first.current = node;
      cleanup.current = revealChildren(node, { stagger });
    },
    [stagger],
  );
}
