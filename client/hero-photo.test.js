import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { fillHeroPhoto, heroPhotoUrl } from './hero-photo.js';
import { PROJECTS, featuredProjects } from './src/services/projects.js';
import { modernSrcSet } from './src/utils/images.js';

const read = (path) => readFileSync(join(import.meta.dirname, path), 'utf8');
const project = (slug, url, featured = true) => ({ slug, featured, coverImage: { url } });

describe('heroPhotoUrl', () => {
  const first = featuredProjects(PROJECTS)[0];

  it('is the AVIF twin of the first featured project\'s cover', () => {
    expect(heroPhotoUrl()).toBe(first.coverImage.url.replace(/\.jpe?g$/i, '.avif'));
  });

  it('exists in the public folder, in both formats', () => {
    expect(existsSync(join(import.meta.dirname, 'public', first.coverImage.url))).toBe(true);
    expect(existsSync(join(import.meta.dirname, 'public', heroPhotoUrl()))).toBe(true);
  });

  it('is a single size: the early download must be the one the hero asks for (a photo with several sizes needs this module to pick by screen width)', () => {
    expect(modernSrcSet(first.coverImage.url)).toBeNull();
  });

  it('follows the portfolio: the first featured project, whichever it is', () => {
    const projects = [project('a', '/images/a/01.jpg', false), project('b', '/images/b/01.jpg'), project('c', '/images/c/01.jpg')];
    expect(heroPhotoUrl(projects)).toBe('/images/b/01.avif');
  });

  it('is empty when nothing is featured, or the cover has no AVIF twin', () => {
    expect(heroPhotoUrl([project('a', '/images/a/01.jpg', false)])).toBe('');
    expect(heroPhotoUrl([])).toBe('');
    expect(heroPhotoUrl([project('a', 'https://example.com/a.jpg')])).toBe('');
  });
});

describe('the preloader gate', () => {
  const gate = read('public/preloader-gate.js');

  it('names the hero photo with a placeholder that the build fills in', () => {
    expect(gate).toContain("const HERO_PHOTO = '__HERO_PHOTO__';");
    const filled = fillHeroPhoto(gate);
    expect(filled).toContain(`const HERO_PHOTO = '${heroPhotoUrl()}';`);
    expect(filled).not.toContain('__HERO_PHOTO__');
  });

  it('preloads nothing when there is nothing to preload', () => {
    expect(fillHeroPhoto(gate, [])).toContain("const HERO_PHOTO = '';");
  });

  it('is the only place that preloads a photo: index.html would load it on every page', () => {
    expect(read('index.html')).not.toMatch(/rel="preload"[^>]*href="\/images\//); // the wordmark, used everywhere, is preloaded there on purpose
  });
});
