import type { ElementType, ReactNode } from 'react';

type Props = { as?: ElementType; text: string; accent?: string; className?: string; id?: string };

// Renders text as word spans so headings can rise word by word (animated by Reveals via [data-split]).
// An optional `accent` phrase follows in italic (after Wood & Weave's italic phrases).
// Splitting happens in React, never by rewriting the DOM; screen readers get the plain text once.
export default function Split({ as: Tag = 'h2', text, accent, className, id }: Props): ReactNode {
  const words = [...text.trim().split(/\s+/).map((w) => ({ w, a: false })), ...(accent ? accent.trim().split(/\s+/).map((w) => ({ w, a: true })) : [])];
  return (
    <Tag className={className} id={id} data-split>
      <span className="visually-hidden">{accent ? `${text} ${accent}` : text}</span>
      <span aria-hidden="true">
        {words.map(({ w, a }, i) => (
          <span key={i}><span className="split-word"><span className={a ? 'accent' : undefined}>{w}</span></span>{i < words.length - 1 ? ' ' : ''}</span>
        ))}
      </span>
    </Tag>
  );
}
