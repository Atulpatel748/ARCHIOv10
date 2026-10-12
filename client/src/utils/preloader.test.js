import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MAX_WAIT_MS, holdPreloader, preloaderPainted, releasePreloader, resetPreloaderForTests } from './preloader.js';

const element = () => document.getElementById('app-preloader');

describe('preloader', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    resetPreloaderForTests();
    document.body.innerHTML = '<div id="app-preloader"></div>';
  });
  afterEach(() => vi.useRealTimers());

  it('fades away as soon as React has painted and removes after the fade', () => {
    preloaderPainted();
    expect(element().classList.contains('is-hidden')).toBe(true);
    vi.advanceTimersByTime(299);
    expect(element()).not.toBeNull();
    vi.advanceTimersByTime(1);
    expect(element()).toBeNull();
  });

  it('stays up while the hero photo is still loading, then leaves when it is released', () => {
    holdPreloader('hero');
    preloaderPainted();
    expect(element().classList.contains('is-hidden')).toBe(false);
    releasePreloader('hero');
    expect(element().classList.contains('is-hidden')).toBe(true);
  });

  it('leaves when the release comes before the first paint, too', () => {
    holdPreloader('hero');
    releasePreloader('hero');
    expect(element().classList.contains('is-hidden')).toBe(false); // React has not painted yet
    preloaderPainted();
    expect(element().classList.contains('is-hidden')).toBe(true);
  });

  it('never traps the visitor: it leaves after the time limit even if a hold is never released', () => {
    holdPreloader('hero');
    preloaderPainted();
    vi.advanceTimersByTime(MAX_WAIT_MS - 1);
    expect(element().classList.contains('is-hidden')).toBe(false);
    vi.advanceTimersByTime(1);
    expect(element().classList.contains('is-hidden')).toBe(true);
  });

  it('copes with the preloader being absent (other pages, tests)', () => {
    document.body.innerHTML = '';
    expect(() => { holdPreloader('hero'); preloaderPainted(); releasePreloader('hero'); }).not.toThrow();
  });
});
