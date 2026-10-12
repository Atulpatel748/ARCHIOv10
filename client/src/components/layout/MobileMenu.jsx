import { useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { NAV_LINKS } from '../../constants/site.js';

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
        </div>
      )}
    </dialog>
  );
}
