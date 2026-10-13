import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useScrollSequence } from './useScrollSequence.js';

function Section() {
  const ref = useScrollSequence();
  return <section ref={ref} data-testid="section">We do</section>;
}

let top;

beforeEach(() => {
  top = 500;
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => { callback(0); return 1; });
  vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(() => ({ top }));
  document.documentElement.style.setProperty('--header-h', '60px');
  Object.defineProperty(window, 'innerHeight', { value: 1000, configurable: true });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useScrollSequence', () => {
  it('reports the scroll distance since the section touched the header, in svh, and follows scrolling', () => {
    render(<Section />);
    const section = screen.getByTestId('section');
    expect(section).toHaveAttribute('data-seq');
    expect(section.style.getPropertyValue('--seq')).toBe('-44.00'); // 440px before the header, 10px per svh
    top = -40;
    act(() => { window.dispatchEvent(new Event('scroll')); });
    expect(section.style.getPropertyValue('--seq')).toBe('10.00');
  });

  it('leaves the finished state alone for people who asked for less motion, and cleans up on unmount', () => {
    vi.spyOn(window, 'matchMedia').mockImplementation((query) => ({ matches: query.includes('reduce'), media: query, addEventListener() {}, removeEventListener() {} }));
    const { unmount } = render(<Section />);
    expect(screen.getByTestId('section')).not.toHaveAttribute('data-seq');
    unmount();
    vi.restoreAllMocks();
    const second = render(<Section />);
    const section = screen.getByTestId('section');
    second.unmount();
    expect(section).not.toHaveAttribute('data-seq');
    expect(section.style.getPropertyValue('--seq')).toBe('');
  });
});
