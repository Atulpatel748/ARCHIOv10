import { describe, expect, it } from 'vitest';
import { pageWindow } from './pagination.js';

describe('pageWindow', () => {
  it('lists every page when there are few', () => {
    expect(pageWindow(2, 5)).toEqual([1, 2, 3, 4, 5]);
  });
  it('collapses distant pages into gaps around the current page', () => {
    expect(pageWindow(10, 20)).toEqual([1, 'gap-start', 9, 10, 11, 'gap-end', 20]);
    expect(pageWindow(1, 20)).toEqual([1, 2, 'gap-end', 20]);
    expect(pageWindow(20, 20)).toEqual([1, 'gap-start', 19, 20]);
  });
});
