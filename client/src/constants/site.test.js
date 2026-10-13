import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { modernImageUrl, modernSrcSet } from '../utils/images.js';
import { GMAIL_COMPOSE_URL, HERO_IMAGE, SITE } from './site.js';

const fromClient = (path) => join(import.meta.dirname, '../..', path);

describe('hero image', () => {
  it('is the image that the home page preloads (as AVIF, which is what the page requests), so the early download is the one the page uses', () => {
    const gate = readFileSync(fromClient('public/preloader-gate.js'), 'utf8');
    expect(gate).toContain(`link.href = '${modernImageUrl(HERO_IMAGE)}'`);
    expect(readFileSync(fromClient('index.html'), 'utf8')).not.toContain('rel="preload" as="image"'); // a static tag would load it on every page
  });

  it('has a single size, which is what the home page preloads (several sizes need the preload in preloader-gate.js to name them)', () => {
    expect(modernSrcSet(HERO_IMAGE)).toBeNull();
  });

  it('exists in the public folder, in both formats', () => {
    expect(existsSync(fromClient(`public${HERO_IMAGE}`))).toBe(true);
    expect(existsSync(fromClient(`public${modernImageUrl(HERO_IMAGE)}`))).toBe(true);
  });
});

describe('Gmail compose link', () => {
  it('opens a Gmail compose window addressed to the studio email', () => {
    const url = new URL(GMAIL_COMPOSE_URL);
    expect(url.origin).toBe('https://mail.google.com');
    expect(url.searchParams.get('view')).toBe('cm');
    expect(url.searchParams.get('to')).toBe(SITE.email);
  });
});
