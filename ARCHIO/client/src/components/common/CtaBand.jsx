import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { CALL_TO_ACTION } from '../../constants/content.js';
import { ROUTES } from '../../constants/routes.js';
import ArrowIcon from '../ui/ArrowIcon.jsx';
import Button from '../ui/Button.jsx';
import RollText from '../ui/RollText.jsx';

// The page decides whether it closes with a call to action (and its wording); the band itself is drawn at the top of
// the footer (#footer-cta), so statement, links and wordmark read as one closing screen.
export default function CtaBand({ title = CALL_TO_ACTION.title, children = CALL_TO_ACTION.text }) {
  const [slot, setSlot] = useState(null);
  useEffect(() => setSlot(document.getElementById('footer-cta')), []);
  if (!slot) return null;
  // The last word of the statement is set in the lighter maroon accent.
  const lastSpace = title.lastIndexOf(' ');
  return createPortal(
    <section className="cta-band" aria-labelledby="cta-title">
      <div className="container cta-band__inner">
        <p className="eyebrow t-label cta-band__eyebrow">{CALL_TO_ACTION.eyebrow}</p>
        <h2 id="cta-title" className="t-h2 cta-band__title">
          {title.slice(0, lastSpace + 1)}<span className="cta-band__accent">{title.slice(lastSpace + 1)}</span>
        </h2>
        <div className="cta-band__aside">
          {children && <p>{children}</p>}
          <Button to={ROUTES.contact}><RollText>Let’s talk</RollText> <ArrowIcon /></Button>
        </div>
      </div>
    </section>,
    slot,
  );
}
