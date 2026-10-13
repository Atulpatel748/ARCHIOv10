import { useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { NAV_LINKS, SITE } from '../../constants/site.js';
import EmailLink from '../common/EmailLink.jsx';

export default function MobileMenu({ open, onClose }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog ref={dialogRef} id="mobile-menu" data-lenis-prevent className="mobile-menu" aria-label="Menu" onClose={onClose}>
      {open && (
        <div className="mobile-menu__inner">
          <div className="mobile-menu__top">
            <button type="button" className="menu-toggle" aria-label="Close menu" onClick={onClose}>
              <span className="menu-toggle__icon menu-toggle__icon--close" aria-hidden="true"><i /><i /><i /></span>
            </button>
            <span className="brand" role="img" aria-label="Archió">
              <span className="wordmark" />
            </span>
          </div>
          <nav aria-label="Mobile">
            <ul className="mobile-menu__list">
              {NAV_LINKS.map((link) => (
                <li key={link.to}>
                  {/* Closing here too covers the page you are already on, where the path does not change. */}
                  <Link to={link.to} className="mobile-menu__link" onClick={onClose}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
          <address className="mobile-menu__contact">
            <EmailLink />
            <a href={`tel:${SITE.phone.replace(/\s/g, '')}`}>{SITE.phone}</a>
            {SITE.social.map((item) => (
              <a key={item.href} href={item.href} target="_blank" rel="noopener noreferrer">{item.label} {item.handle}</a>
            ))}
          </address>
        </div>
      )}
    </dialog>
  );
}
