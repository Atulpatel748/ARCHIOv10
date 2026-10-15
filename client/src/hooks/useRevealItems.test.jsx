import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { revealChildren } from '../lib/reveal.js';
import { useRevealItems } from './useRevealItems.js';

vi.mock('../lib/reveal.js', () => ({ revealChildren: vi.fn() }));

function Grid({ stagger }) {
  const ref = useRevealItems({ stagger });
  return <div ref={ref} data-testid="grid" />;
}

afterEach(() => vi.clearAllMocks());

describe('useRevealItems', () => {
  it('reveals the children of the container it is attached to, and cleans up when it unmounts', () => {
    const cleanup = vi.fn();
    revealChildren.mockReturnValue(cleanup);
    const { unmount } = render(<Grid />);
    expect(revealChildren).toHaveBeenCalledWith(screen.getByTestId('grid'), { stagger: undefined });
    unmount();
    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  it('starts over with the new stagger when the option changes', () => {
    const first = vi.fn();
    revealChildren.mockReturnValueOnce(first).mockReturnValue(vi.fn());
    const { rerender } = render(<Grid stagger={50} />);
    rerender(<Grid stagger={200} />);
    expect(first).toHaveBeenCalledTimes(1);
    expect(revealChildren).toHaveBeenLastCalledWith(screen.getByTestId('grid'), { stagger: 200 });
  });

  it('does not replay on a container mounted later, such as a list a filter emptied and filled again', () => {
    revealChildren.mockReturnValue(vi.fn());
    function List({ shown }) {
      const ref = useRevealItems();
      return shown ? <div ref={ref} data-testid="grid" /> : <p>No projects match</p>;
    }
    const { rerender } = render(<List shown />);
    rerender(<List shown={false} />);
    rerender(<List shown />);
    expect(revealChildren).toHaveBeenCalledTimes(1);
  });
});
