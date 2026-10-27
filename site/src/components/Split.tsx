import type { ElementType, ReactNode } from 'react';

type Props = { as?: ElementType; text: string; accent?: string; className?: string; id?: string };

// Renders headings with an optional accent phrase; [data-split] lets Reveals fade the whole heading in.
// An optional `accent` phrase follows, in the heading's own colour (`.accent`).
// Splitting happens in React, never by rewriting the DOM; screen readers get the plain text once.
export default function Split({ as: Tag = 'h2', text, accent, className, id }: Props): ReactNode {
  const words = [...text.trim().split(/\s+/).map((w) => ({ w, a: false })), ...(accent ? accent.trim().split(/\s+/).map((w) => ({ w, a: true })) : [])];
  return (
    <Tag className={className} id={id} data-split>
      <span className="visually-hidden">{accent ? `${text} ${accent}` : text}</span>
      <span aria-hidden="true">
        {words.map(({ w, a }, i) => (
          <span key={i} className={a ? 'accent' : undefined}>{w}{i < words.length - 1 ? ' ' : ''}</span>
        ))}
      </span>
    </Tag>
  );
}
