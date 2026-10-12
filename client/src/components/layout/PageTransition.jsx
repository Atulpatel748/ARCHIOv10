import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router';

// One element per page. Every client-side navigation mounts a fresh one, which fades and lifts in (see `.page--enter`).
// It is skipped for the very first page load so the landing page is never held back by an animation (LCP), and it is
// decided once per element, so changing a filter on the same page never replays it.
function Page({ animate, children }) {
  const [enter] = useState(animate);
  return <div className={enter ? 'page page--enter' : 'page'}>{children}</div>;
}

export default function PageTransition({ children }) {
  const { pathname } = useLocation();
  const isFirstRender = useRef(true);
  const animate = !isFirstRender.current;
  useEffect(() => {
    isFirstRender.current = false;
  }, []);
  return <Page key={pathname} animate={animate}>{children}</Page>;
}
