import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import WordReveal from './WordReveal.jsx';

const TEXT = 'one two three four';
let top;

beforeEach(() => {
  window.innerHeight = 1000;
  // Runs the frame at once; returns 0 so the component sees no frame still pending, as after a real frame.
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => { callback(); return 0; });
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(() => ({ top, height: 100 }));
});
afterEach(() => vi.restoreAllMocks());

const litCount = (container) => container.querySelectorAll('.word-reveal__word--lit').length;
const scrollTo = (nextTop) => act(() => {
  top = nextTop;
  window.dispatchEvent(new Event('scroll'));
});

describe('WordReveal', () => {
  it('lights the words one by one between 80% and 55% of the screen', () => {
    top = 900; // below the start line
    const { container } = render(<WordReveal text={TEXT} />);
    expect(container.firstChild).toHaveClass('word-reveal--armed');
    expect(litCount(container)).toBe(0);

    scrollTo(625); // halfway: (800 - 625) / (100 + 250)
    expect(litCount(container)).toBe(2);

    scrollTo(400); // its bottom has passed the end line
    expect(litCount(container)).toBe(4);
  });

  it('leaves the line plain under reduced motion', () => {
    vi.spyOn(window, 'matchMedia').mockImplementation((query) => ({ matches: query.includes('reduce'), addEventListener() {}, removeEventListener() {} }));
    top = 625;
    const { container } = render(<WordReveal text={TEXT} />);
    expect(container.firstChild).not.toHaveClass('word-reveal--armed');
    expect(litCount(container)).toBe(0);
  });
});
