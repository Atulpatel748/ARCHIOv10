import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router';
import { NAV_LINKS } from '../../constants/site.js';
import { ROUTES } from '../../constants/routes.js';
import ArrowIcon from '../ui/ArrowIcon.jsx';
import Button from '../ui/Button.jsx';
import RollText from '../ui/RollText.jsx';
import MobileMenu from './MobileMenu.jsx';

const PRIMARY_LINKS = NAV_LINKS.filter((link) => link.to !== ROUTES.contact);

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef(null);
  const { pathname } = useLocation();

  useEffect(() => setMenuOpen(false), [pathname]);

  // Only the immersive home hero uses a transparent overlay; case-study pages keep a solid header.
  const onHome = pathname === ROUTES.home;
  const overlayPage = onHome;
  const [heroBehindHeader, setHeroBehindHeader] = useState(true);
  useEffect(() => {
    if (!overlayPage) return undefined;
    const update = () => {
      const header = headerRef.current;
      const hero = document.querySelector('.hero-portal');
      setHeroBehindHeader(Boolean(hero && header && hero.getBoundingClientRect().bottom > header.getBoundingClientRect().bottom));
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [onHome, overlayPage]);
  const clear = overlayPage && heroBehindHeader && !menuOpen;

  return (
    <header ref={headerRef} className={`site-header${overlayPage ? ' site-header--overlay' : ''}${clear ? ' site-header--clear' : ''}`}>
      <div className="container site-header__bar">
        <button
          type="button"
          className="menu-toggle"
          aria-label="Menu"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen(true)}
        >
          <span className="menu-toggle__icon" aria-hidden="true"><i /><i /><i /></span>
        </button>

        {/* Before the logo in the source, so the Tab order follows the screen: links on the left, logo, then "Let’s talk". */}
        <nav className="site-nav" aria-label="Primary">
          <ul className="nav-list">
            {PRIMARY_LINKS.map((link) => (
              <li key={link.to}>
                <NavLink to={link.to} className="nav-link"><RollText>{link.label}</RollText></NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <Link to={ROUTES.home} className="brand" aria-label="Archió, home">
          <span className="wordmark" aria-hidden="true" />
        </Link>

        <div className="site-header__actions">
          <Button to={ROUTES.contact} size="sm" variant="secondary" className="header-cta">
            <RollText>Let&rsquo;s talk</RollText>
            <ArrowIcon />
            {/* Phones show only this paper plane; the label above stays as the accessible name. */}
            <svg className="header-cta__icon" viewBox="0 0 16 16" width="22" height="22" aria-hidden="true" focusable="false">
              <path d="M14.5 1.5 1.5 6.8l5.6 2.1 2.1 5.6zM7.1 8.9l3.6-3.6" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
            </svg>
          </Button>
        </div>
      </div>
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </header>
  );
}
