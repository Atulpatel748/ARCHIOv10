import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { modernImageUrl } from '../utils/images.js';
import { HERO_IMAGE } from './site.js';

const fromClient = (path) => join(import.meta.dirname, '../..', path);

describe('hero image', () => {
  it('is the image that index.html preloads (as AVIF, which is what the page requests), so the early download is the one the page uses', () => {
    const html = readFileSync(fromClient('index.html'), 'utf8');
    const avif = modernImageUrl(HERO_IMAGE);
    expect(html).toMatch(new RegExp(`<link rel="preload" as="image" href="${avif}" type="image/avif"`));
  });

  it('exists in the public folder, in both formats', () => {
    expect(existsSync(fromClient(`public${HERO_IMAGE}`))).toBe(true);
    expect(existsSync(fromClient(`public${modernImageUrl(HERO_IMAGE)}`))).toBe(true);
  });
});
