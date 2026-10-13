import { Outlet, ScrollRestoration } from 'react-router';
import Footer from '../components/layout/Footer.jsx';
import Header from '../components/layout/Header.jsx';
import PageTransition from '../components/layout/PageTransition.jsx';
import RouteAnnouncer from '../components/layout/RouteAnnouncer.jsx';
import { useSmoothScroll } from '../hooks/useSmoothScroll.js';

export default function MainLayout() {
  useSmoothScroll();
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">Skip to content</a>
      <Header />
      <main id="main" tabIndex={-1}>
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
      <Footer />
      <RouteAnnouncer />
      <ScrollRestoration />
    </div>
  );
}
