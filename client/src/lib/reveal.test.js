import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { revealChildren, revealElement } from './reveal.js';

let observers;
class FakeIntersectionObserver {
  constructor(callback) { this.callback = callback; this.watched = new Set(); observers.push(this); }
  observe(el) { this.watched.add(el); }
  unobserve(el) { this.watched.delete(el); }
  disconnect() { this.watched.clear(); }
  emit(...elements) {
    this.callback(elements.map((target, i) => ({ target, isIntersecting: true, boundingClientRect: { left: i * 100, top: 0 } })));
  }
}

const setReducedMotion = (reduced) => {
  window.matchMedia = (query) => ({ matches: reduced && query.includes('prefers-reduced-motion'), media: query, addEventListener() {}, removeEventListener() {} });
};

function makeGrid(count = 3) {
  const grid = document.createElement('div');
  for (let i = 0; i < count; i += 1) grid.appendChild(document.createElement('article'));
  document.body.appendChild(grid);
  return grid;
}

// The two entry points behave alike: hidden, revealed on arrival, settled once the transform transition ends.
const ENTRIES = [
  {
    name: 'revealElement', hidden: 'reveal', shown: 'reveal--visible',
    setup() {
      const el = document.createElement('section');
      document.body.appendChild(el);
      return { el, start: () => revealElement(el) };
    },
  },
  {
    name: 'revealChildren', hidden: 'reveal-item', shown: 'reveal-item--visible',
    setup() {
      const grid = makeGrid(1);
      return { el: grid.children[0], start: () => revealChildren(grid) };
    },
  },
];

const transitionEnd = (el, propertyName, target = el) => {
  const event = new Event('transitionend', { bubbles: true });
  event.propertyName = propertyName;
  target.dispatchEvent(event);
};

beforeEach(() => {
  observers = [];
  globalThis.IntersectionObserver = FakeIntersectionObserver;
  setReducedMotion(false);
  vi.useFakeTimers();
});
afterEach(() => {
  document.body.innerHTML = '';
  delete globalThis.IntersectionObserver;
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe.each(ENTRIES)('$name', ({ hidden, shown, setup }) => {
  it('hides the element until it scrolls into view, then reveals it', () => {
    const { el, start } = setup();
    start();
    expect(el).toHaveClass(hidden);
    expect(el).not.toHaveClass(shown);

    observers[0].emit(el);
    expect(el).toHaveClass(shown);
  });

  it('does nothing for people who prefer reduced motion', () => {
    setReducedMotion(true);
    const { el, start } = setup();
    const cleanup = start();
    expect(observers).toHaveLength(0);
    expect(el.className).toBe('');
    expect(typeof cleanup).toBe('function');
  });

  it('does nothing where IntersectionObserver does not exist', () => {
    delete globalThis.IntersectionObserver;
    const { el, start } = setup();
    expect(() => start()()).not.toThrow();
    expect(el.className).toBe('');
  });

  it('removes its classes once the transform transition ends, leaving a plain element', () => {
    const { el, start } = setup();
    start();
    observers[0].emit(el);

    // A different property finishing, or a child element's transition bubbling up, must not end it.
    transitionEnd(el, 'opacity');
    expect(el).toHaveClass(shown);
    const child = el.appendChild(document.createElement('span'));
    transitionEnd(el, 'transform', child);
    expect(el).toHaveClass(shown);

    transitionEnd(el, 'transform');
    expect(el.className).toBe('');
  });

  it('still settles if transitionend never fires (CSS declares no transition: a short default)', () => {
    const { el, start } = setup();
    start();
    observers[0].emit(el);
    vi.advanceTimersByTime(1300);
    expect(el.className).toBe('');
  });

  it('waits as long as the CSS transition (delay included) plus slack before giving up', () => {
    vi.spyOn(window, 'getComputedStyle').mockReturnValue({ transitionDuration: '0.6s, 1s', transitionDelay: '0.55s' });
    const { el, start } = setup();
    start();
    observers[0].emit(el);
    vi.advanceTimersByTime(2100); // 1s + 0.55s + 600ms slack = 2150ms
    expect(el).toHaveClass(shown);
    vi.advanceTimersByTime(100);
    expect(el.className).toBe('');
  });

  it('cancels a pending settle when it is cleaned up', () => {
    const clear = vi.spyOn(window, 'clearTimeout');
    const { el, start } = setup();
    const cleanup = start();
    observers[0].emit(el);
    clear.mockClear();
    cleanup();
    expect(clear).toHaveBeenCalled();
  });
});

describe('revealChildren', () => {
  it('reveals the children that arrive together in a staggered order', () => {
    const grid = makeGrid(3);
    revealChildren(grid, { stagger: 100 });
    const [a, b, c] = grid.children;
    observers[0].emit(a, b);
    expect(a.style.transitionDelay).toBe('0ms');
    expect(b.style.transitionDelay).toBe('100ms');
    expect(c).not.toHaveClass('reveal-item--visible');

    observers[0].emit(c);
    expect(c.style.transitionDelay).toBe('0ms'); // alone, so it does not wait
  });

  it('caps the stagger so a long row never waits seconds', () => {
    const grid = makeGrid(9);
    revealChildren(grid, { stagger: 100 });
    observers[0].emit(...grid.children);
    expect(grid.children[8].style.transitionDelay).toBe('500ms');
  });

  it('clears the transition delay along with the classes once an item has settled', () => {
    const grid = makeGrid(1);
    revealChildren(grid);
    const el = grid.children[0];
    observers[0].emit(el);
    vi.advanceTimersByTime(1300);
    expect(el.style.transitionDelay).toBe('');
  });

  it('leaves children added later alone, so a filter changing the results shows them at once', async () => {
    const grid = makeGrid(1);
    revealChildren(grid);
    const added = document.createElement('article');
    grid.appendChild(added);
    await Promise.resolve();
    expect(added.className).toBe('');
    expect(observers[0].watched.has(added)).toBe(false);
  });

  it('leaves plain elements behind when cleaned up', () => {
    const grid = makeGrid(2);
    const stop = revealChildren(grid);
    stop();
    expect(grid.children[0].className).toBe('');
  });
});
