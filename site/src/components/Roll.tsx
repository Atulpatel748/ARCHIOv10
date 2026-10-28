// Link or button label that rolls up to an identical copy on hover and keyboard focus (styles in globals.scss).
// The copy is drawn by CSS from data-text, so screen readers hear the label once.
export default function Roll({ children }: { children: string }) {
  return <span className="roll"><span data-text={children}>{children}</span></span>;
}
