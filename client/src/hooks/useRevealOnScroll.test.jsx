import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { revealElement } from '../lib/reveal.js';
import { useRevealOnScroll } from './useRevealOnScroll.js';

vi.mock('../lib/reveal.js', () => ({ revealElement: vi.fn() }));

function Section() {
  const ref = useRevealOnScroll();
  return <section ref={ref} data-testid="section">Hello</section>;
}

afterEach(() => vi.clearAllMocks());

describe('useRevealOnScroll', () => {
  it('reveals the element it is attached to, and cleans up when it unmounts', () => {
    const cleanup = vi.fn();
    revealElement.mockReturnValue(cleanup);
    const { unmount } = render(<Section />);
    expect(revealElement).toHaveBeenCalledWith(screen.getByTestId('section'));
    expect(cleanup).not.toHaveBeenCalled();
    unmount();
    expect(cleanup).toHaveBeenCalledTimes(1);
  });
});
