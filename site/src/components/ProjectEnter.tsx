'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import Preloader from './Preloader';

// Clicking a link to a project page does not reload the page, so the preloader's drawing never plays. Here the click is caught: the
// paper overlay fades in over the page, the route changes underneath it, and the room draws and opens onto the project's hero photo.
// Not with reduced motion, and not for modified clicks (new tab) or links to the page you are on.
export default function ProjectEnter() {
  const router = useRouter();
  const pathname = usePathname();
  const playing = useRef(false);
  const [go, setGo] = useState<{ path: string; key: number } | null>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element).closest('a');
      if (!a || a.target || a.origin !== location.origin || !/^\/projects\/[^/]+\/?$/.test(a.pathname) || a.pathname === location.pathname) return;
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      e.preventDefault();
      e.stopPropagation(); // before the router's own click handler
      setGo((cur) => cur ?? { path: a.pathname, key: Date.now() }); // a second click while it plays is ignored
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);

  // The flag stays on after the overlay has gone (removing it would restart the photo's fade-in) and is cleared on the next route change
  useEffect(() => { if (!playing.current) delete document.documentElement.dataset.entering; }, [pathname]);

  useEffect(() => {
    playing.current = !!go;
    if (!go) return;
    document.documentElement.dataset.entering = ''; // the project's hero photo skips its own fade-in
    const t = setTimeout(() => router.push(go.path), 320); // after the overlay has faded in
    return () => clearTimeout(t);
  }, [go, router]);

  if (!go) return null;
  return <Preloader key={go.key} enter={go.path} onDone={() => setGo(null)} />;
}
