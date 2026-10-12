import { Link } from 'react-router';
import { NAV_LINKS, SITE } from '../../constants/site.js';
import { ROUTES } from '../../constants/routes.js';

// The wordmark and a line about the studio, then the contact, studio, legal and follow columns (site.css), and the
// copyright and company line at the base. Contact is left out of the studio column: the closing band and the
// header already lead there.
export default function Footer() {
  return (
    <footer className="site-footer">
      {/* A page's call-to-action band (CtaBand) is drawn here, above the links. */}
      <div id="footer-cta" />
      <div className="container footer-grid">
        <div className="footer-brand">
          <span className="wordmark footer-wordmark" aria-hidden="true" />
          <p className="footer-tagline">{SITE.summary}</p>
        </div>
        <div className="footer-col footer-contact">
          <h2>Contact</h2>
          <a className="footer-mail" href={`mailto:${SITE.email}`}>{SITE.email}</a>
          <a href={`tel:${SITE.phone.replace(/\s/g, '')}`}>
            <svg className="icon-whatsapp" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M20 11.7a8 8 0 0 1-11.8 7L4 20l1.4-4A8 8 0 1 1 20 11.7Z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
              <path d="M9 8.2c.2-.4.5-.4.8-.4h.4c.2 0 .3.1.4.4l.7 1.6c.1.2.1.4-.1.6l-.5.6c-.2.2-.2.4 0 .6.5.9 1.2 1.5 2.1 2 .2.1.4.1.6-.1l.7-.8c.2-.2.4-.2.6-.1l1.5.7c.3.1.4.3.4.5 0 .4-.2 1.1-.6 1.4-.4.4-1.1.6-1.8.4-1.1-.3-2.4-1-3.5-2-1.1-1.1-1.8-2.4-2-3.4-.2-.8.1-1.5.3-2Z" fill="currentColor" />
            </svg>
            {SITE.phone}
          </a>
        </div>
        <div className="footer-col">
          <h2>Studio</h2>
          <ul className="footer-list">
            {NAV_LINKS.filter((link) => link.to !== ROUTES.contact).map((link) => (
              <li key={link.to}><Link to={link.to}>{link.label}</Link></li>
            ))}
          </ul>
        </div>
        <nav className="footer-col" aria-label="Legal">
          <h2>Legal</h2>
          <ul className="footer-list">
            <li><Link to={ROUTES.privacy}>Privacy notice</Link></li>
            <li><Link to={ROUTES.terms}>Terms of service</Link></li>
            <li><Link to={ROUTES.cookies}>Cookie policy</Link></li>
          </ul>
        </nav>
        <div className="footer-col footer-follow">
          <h2>Follow</h2>
          <ul className="footer-list">
            {SITE.social.map((item) => (
              <li key={item.label}>
                <a href={item.href} target="_blank" rel="noopener noreferrer">{item.label}</a>
              </li>
            ))}
          </ul>
        </div>
        <div className="footer-legal">
          <p>&copy; {new Date().getFullYear()} {SITE.name}. {SITE.address}.</p>
          <p>{SITE.licenceNumber && <>Trade Licence: {SITE.licenceNumber} &nbsp;·&nbsp; </>}{SITE.parent}</p>
        </div>
      </div>
    </footer>
  );
}
