import { Link } from 'react-router';
import { SITE } from '../../constants/site.js';
import EmailLink from '../common/EmailLink.jsx';
import { ROUTES } from '../../constants/routes.js';

// The wordmark and a line about the studio, then two columns: how to reach the studio (email, phone, Instagram) and the
// legal pages (site.css), with the copyright and company line at the base. The site's own pages are not listed again:
// the header carries them on every screen.
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
          <EmailLink className="footer-mail" />
          <a href={`tel:${SITE.phone.replace(/\s/g, '')}`}>
            <svg className="icon-phone" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M6.6 3.5h2.9l1.6 4-2 1.6a11.6 11.6 0 0 0 5.8 5.8l1.6-2 4 1.6v2.9a2 2 0 0 1-2.1 2A16.5 16.5 0 0 1 4.6 5.6a2 2 0 0 1 2-2.1Z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
            </svg>
            {SITE.phone}
          </a>
          {SITE.social.map((item) => (
            <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer">{item.label}</a>
          ))}
        </div>
        <nav className="footer-col" aria-label="Legal">
          <h2>Legal</h2>
          <ul className="footer-list">
            <li><Link to={ROUTES.privacy}>Privacy notice</Link></li>
            <li><Link to={ROUTES.terms}>Terms of service</Link></li>
            <li><Link to={ROUTES.cookies}>Cookie policy</Link></li>
          </ul>
        </nav>
        <div className="footer-legal">
          <p>&copy; {new Date().getFullYear()} {SITE.name}. {SITE.address}.</p>
          <p>{SITE.licenceNumber && <>Trade Licence: {SITE.licenceNumber} &nbsp;·&nbsp; </>}{SITE.parent}</p>
        </div>
      </div>
    </footer>
  );
}
