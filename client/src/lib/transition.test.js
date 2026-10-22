import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { whenTransitionEnds } from './transition.js';

const transitionEnd = (target, propertyName) => {
  const event = new Event('transitionend', { bubbles: true });
  event.propertyName = propertyName;
  target.dispatchEvent(event);
};

let el;
beforeEach(() => {
  vi.useFakeTimers();
  el = document.body.appendChild(document.createElement('div'));
});
afterEach(() => {
  document.body.innerHTML = '';
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('whenTransitionEnds', () => {
  it('calls done once, when the named property finishes', () => {
    const done = vi.fn();
    whenTransitionEnds(el, 'opacity', done);
    transitionEnd(el, 'transform');
    expect(done).not.toHaveBeenCalled();
    transitionEnd(el, 'opacity');
    transitionEnd(el, 'opacity');
    expect(done).toHaveBeenCalledTimes(1);
  });

  it('ignores a child element\'s transition bubbling up', () => {
    const done = vi.fn();
    whenTransitionEnds(el, 'opacity', done);
    transitionEnd(el.appendChild(document.createElement('span')), 'opacity');
    expect(done).not.toHaveBeenCalled();
  });

  it('gives up after a short default when CSS declares no transition', () => {
    const done = vi.fn();
    whenTransitionEnds(el, 'opacity', done);
    vi.advanceTimersByTime(1100);
    expect(done).not.toHaveBeenCalled();
    vi.advanceTimersByTime(200);
    expect(done).toHaveBeenCalledTimes(1);
  });

  it('waits as long as the CSS transition (delay included) plus slack before giving up', () => {
    vi.spyOn(window, 'getComputedStyle').mockReturnValue({ transitionDuration: '0.3s, 1s', transitionDelay: '0.55s' });
    const done = vi.fn();
    whenTransitionEnds(el, 'opacity', done);
    vi.advanceTimersByTime(2100); // 1s + 0.55s + 600ms slack = 2150ms
    expect(done).not.toHaveBeenCalled();
    vi.advanceTimersByTime(100);
    expect(done).toHaveBeenCalledTimes(1);
  });

  it('can be cancelled, and then never calls done', () => {
    const done = vi.fn();
    const cancel = whenTransitionEnds(el, 'opacity', done);
    cancel();
    transitionEnd(el, 'opacity');
    vi.advanceTimersByTime(5000);
    expect(done).not.toHaveBeenCalled();
  });
});
