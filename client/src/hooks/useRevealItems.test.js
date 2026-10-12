import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { observeRevealItems } from './useRevealItems.js';

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

describe('observeRevealItems', () => {
  beforeEach(() => {
    observers = [];
    globalThis.IntersectionObserver = FakeIntersectionObserver;
    setReducedMotion(false);
  });
  afterEach(() => {
    document.body.innerHTML = '';
    delete globalThis.IntersectionObserver;
    vi.useRealTimers();
  });

  it('hides each child until it scrolls into view, then reveals the ones that arrive together in a staggered order', () => {
    const grid = makeGrid(3);
    observeRevealItems(grid, { stagger: 100 });
    const [a, b, c] = grid.children;
    expect([a, b, c].every((el) => el.classList.contains('reveal-item'))).toBe(true);
    expect(a.classList.contains('reveal-item--visible')).toBe(false);

    observers[0].emit(a, b);
    expect(a.classList.contains('reveal-item--visible')).toBe(true);
    expect(a.style.transitionDelay).toBe('0ms');
    expect(b.style.transitionDelay).toBe('100ms');
    expect(c.classList.contains('reveal-item--visible')).toBe(false);

    observers[0].emit(c);
    expect(c.style.transitionDelay).toBe('0ms'); // alone, so it does not wait
  });

  it('caps the stagger so a long row never waits seconds', () => {
    const grid = makeGrid(9);
    observeRevealItems(grid, { stagger: 100 });
    observers[0].emit(...grid.children);
    expect(grid.children[8].style.transitionDelay).toBe('500ms');
  });

  it('removes its classes once the item has settled, leaving a plain element', () => {
    vi.useFakeTimers();
    const grid = makeGrid(1);
    observeRevealItems(grid);
    const el = grid.children[0];
    observers[0].emit(el);
    vi.advanceTimersByTime(2300);
    expect(el.className).toBe('');
    expect(el.style.transitionDelay).toBe('');
  });

  it('picks up children added later, such as a filter changing the results', async () => {
    const grid = makeGrid(1);
    observeRevealItems(grid);
    const added = document.createElement('article');
    grid.appendChild(added);
    await Promise.resolve(); // MutationObserver callbacks run as a microtask
    expect(added.classList.contains('reveal-item')).toBe(true);
    expect(observers[0].watched.has(added)).toBe(true);
  });

  it('does nothing for people who prefer reduced motion', () => {
    setReducedMotion(true);
    const grid = makeGrid(2);
    const cleanup = observeRevealItems(grid);
    expect(observers).toHaveLength(0);
    expect(grid.children[0].className).toBe('');
    expect(typeof cleanup).toBe('function');
  });

  it('does nothing where IntersectionObserver does not exist, and cleans up after itself', () => {
    delete globalThis.IntersectionObserver;
    expect(() => observeRevealItems(makeGrid(1))()).not.toThrow();

    globalThis.IntersectionObserver = FakeIntersectionObserver;
    const grid = makeGrid(2);
    const stop = observeRevealItems(grid);
    stop();
    expect(grid.children[0].className).toBe('');
  });
});
