import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router';

// Moves focus to <main> after client-side navigation so keyboard and screen-reader
// users land on the new content. It compares against the previous pathname (rather
// than a "first render" flag) so React StrictMode's double-invoked effects in
// development never steal focus on the initial page load.
export default function RouteAnnouncer() {
  const { pathname } = useLocation();
  const previousPathname = useRef(pathname);

  useEffect(() => {
    if (previousPathname.current === pathname) return;
    previousPathname.current = pathname;
    document.getElementById('main')?.focus({ preventScroll: true });
  }, [pathname]);

  return null;
}
