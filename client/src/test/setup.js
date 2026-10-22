import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

HTMLDialogElement.prototype.showModal ??= function showModal() {
  this.setAttribute('open', '');
};
HTMLDialogElement.prototype.close = function close() {
  this.removeAttribute('open');
  this.dispatchEvent(new Event('close'));
};

// jsdom has no canvas; answer like a browser without WebGL (the hero gallery then shows plain images) instead of logging.
HTMLCanvasElement.prototype.getContext = () => null;

window.matchMedia ??= (query) => ({
  matches: false, media: query, onchange: null, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent: () => false,
});
window.scrollTo = vi.fn();

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});
