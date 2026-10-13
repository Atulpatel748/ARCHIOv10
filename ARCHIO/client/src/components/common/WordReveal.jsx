import { useEffect, useRef } from 'react';
import { loadGsap } from '../../lib/gsapLoader.js';

// A statement that lights up word by word as it scrolls through the middle of the screen, the way a single
// emphatic line reads on the reference site, instead of a flat fade-in of the whole sentence. Falls back to a
// plain, fully-coloured line when reduced motion is requested; also plain and untouched in tests, where
// matchMedia is mocked to always report reduced motion.
export default function WordReveal({ text, as: Tag = 'p', className = '', id }) {
  const ref = useRef(null);
  const words = text.split(' ');

  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const spans = element.querySelectorAll('.word-reveal__word');
    if (!spans.length) return undefined;

    let cancelled = false;
    let trigger;
    loadGsap().then(({ ScrollTrigger }) => {
      if (cancelled) return;
      element.classList.add('word-reveal--armed');
      trigger = ScrollTrigger.create({
        trigger: element,
        start: 'top 80%',
        end: 'bottom 55%',
        scrub: 0.3,
        onUpdate: (self) => {
          const lit = Math.round(self.progress * spans.length);
          spans.forEach((span, index) => span.classList.toggle('word-reveal__word--lit', index < lit));
        },
      });
    });

    return () => {
      cancelled = true;
      trigger?.kill();
      element.classList.remove('word-reveal--armed');
    };
  }, [text]);

  return (
    <Tag ref={ref} id={id} className={`word-reveal ${className}`.trim()}>
      {words.map((word, index) => (
        <span className="word-reveal__word" key={`${word}-${index}`}>
          {word}
          {index < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </Tag>
  );
}
