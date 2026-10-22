import { GMAIL_COMPOSE_URL, SITE } from '../../constants/site.js';

const MOUSE = '(hover: hover) and (pointer: fine)';

// A mailto: link opens whatever mail program the computer has set, which on a PC is often none. For mouse and trackpad
// users a plain click opens a Gmail compose window instead. The mailto: address stays as the link, so phones, copying
// the link and modified clicks (new tab, new window) still behave as usual.
export default function EmailLink({ children = SITE.email, ...props }) {
  const open = (event) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (!window.matchMedia(MOUSE).matches) return;
    event.preventDefault();
    window.open(GMAIL_COMPOSE_URL, '_blank', 'noopener,noreferrer');
  };

  return <a href={`mailto:${SITE.email}`} onClick={open} {...props}>{children}</a>;
}
