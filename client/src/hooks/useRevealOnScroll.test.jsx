import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useRevealOnScroll } from './useRevealOnScroll.js';

function Section() {
  const ref = useRevealOnScroll();
  return (
    <section ref={ref} data-testid="section">
      Hello
    </section>
  );
}

let observers;
let reducedMotion;

beforeEach(() => {
  observers = [];
  reducedMotion = false;
  vi.useFakeTimers();
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(callback) {
        this.callback = callback;
        this.disconnected = false;
        observers.push(this);
      }
      observe() {}
      disconnect() {
        this.disconnected = true;
      }
    },
  );
  vi.spyOn(window, 'matchMedia').mockImplementation((query) => ({
    matches: reducedMotion && query.includes('prefers-reduced-motion'),
    media: query,
    addEventListener() {},
    removeEventListener() {},
  }));
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const scrollIntoView = () => act(() => observers.at(-1).callback([{ isIntersecting: true }]));

describe('useRevealOnScroll', () => {
  it('hides the section until it scrolls into view, then reveals it', () => {
    render(<Section />);
    const el = screen.getByTestId('section');
    expect(el).toHaveClass('reveal');
    expect(el).not.toHaveClass('reveal--visible');

    scrollIntoView();
    expect(el).toHaveClass('reveal--visible');
    expect(observers.at(-1).disconnected).toBe(true);
  });

  it('does nothing for people who prefer reduced motion', () => {
    reducedMotion = true;
    render(<Section />);
    const el = screen.getByTestId('section');
    expect(el).not.toHaveClass('reveal');
    expect(observers).toHaveLength(0);
  });

  it('removes its classes once the transform transition ends, so will-change is released', () => {
    render(<Section />);
    const el = screen.getByTestId('section');
    scrollIntoView();

    // A different property finishing, or a child element's transition bubbling up, must not end it.
    act(() => {
      const opacity = new Event('transitionend', { bubbles: true });
      opacity.propertyName = 'opacity';
      el.dispatchEvent(opacity);
    });
    expect(el).toHaveClass('reveal');

    act(() => {
      const transform = new Event('transitionend', { bubbles: true });
      transform.propertyName = 'transform';
      el.dispatchEvent(transform);
    });
    expect(el).not.toHaveClass('reveal');
    expect(el).not.toHaveClass('reveal--visible');
  });

  it('still settles if transitionend never fires', () => {
    render(<Section />);
    const el = screen.getByTestId('section');
    scrollIntoView();
    expect(el).toHaveClass('reveal');
    act(() => vi.advanceTimersByTime(1300));
    expect(el).not.toHaveClass('reveal');
  });

  it('cancels a pending settle when it unmounts', () => {
    const clear = vi.spyOn(window, 'clearTimeout');
    const { unmount } = render(<Section />);
    scrollIntoView();
    unmount();
    expect(clear).toHaveBeenCalled();
  });
});
