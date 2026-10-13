// A drawn arrow rather than the "\u2192" character: the display typeface has no arrow glyph, and relying on a fallback
// font would render an empty box on some devices.
export default function ArrowIcon() {
  return (
    <svg className="icon-arrow" viewBox="0 0 16 16" width="1em" height="1em" aria-hidden="true" focusable="false">
      <path d="M2 8h11M9 3.5 13.5 8 9 12.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
    </svg>
  );
}
