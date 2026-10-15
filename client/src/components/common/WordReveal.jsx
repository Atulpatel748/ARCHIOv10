import { useEffect, useRef } from 'react';

// A statement that lights up word by word as it scrolls through the middle of the screen, the way a single
// emphatic line reads on the reference site, instead of a flat fade-in of the whole sentence. Falls back to a
// plain, fully-coloured line when reduced motion is requested.
export default function WordReveal({ text, as: Tag = 'p', className = '', id }) {
  const ref = useRef(null);
  const words = text.split(' ');

  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const spans = element.querySelectorAll('.word-reveal__word');
    if (!spans.length) return undefined;

    let frame = 0;
    let lit = -1;
    // 0 when the line's top reaches 80% of the screen height, 1 when its bottom reaches 55%.
    const update = () => {
      frame = 0;
      const { top, height } = element.getBoundingClientRect();
      const screen = window.innerHeight;
      const progress = Math.min(Math.max((screen * 0.8 - top) / (height + screen * 0.25), 0), 1);
      const next = Math.round(progress * spans.length);
      if (next === lit) return;
      lit = next;
      spans.forEach((span, index) => span.classList.toggle('word-reveal__word--lit', index < lit));
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    element.classList.add('word-reveal--armed');
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      window.cancelAnimationFrame(frame);
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
