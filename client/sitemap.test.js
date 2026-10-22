import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import { PROJECTS } from '@archio/shared/projects';
import { describe, expect, it } from 'vitest';
import { sitemapXml } from './sitemap.js';
import { routes } from './src/routes/index.jsx';

describe('sitemap', () => {
  it('lists the public pages and every project', () => {
    const xml = sitemapXml('https://archio.example');
    for (const { slug } of PROJECTS) expect(xml).toContain(`<loc>https://archio.example/projects/${slug}</loc>`);
    expect(xml).toContain('<loc>https://archio.example/services</loc>');
    expect(xml).toContain('<loc>https://archio.example/cookies</loc>');
    expect(xml).not.toMatch(/<loc>[^<]*\/services\/[^<]+<\/loc>/); // services are a single page
    expect(xml).not.toMatch(/login|register|dashboard|admin/);
  });

  it('escapes characters that would break the XML', () => {
    expect(sitemapXml('https://a.example/?x=1&y=2', [])).toContain('<loc>https://a.example/?x=1&amp;y=2/</loc>');
  });
});

describe('the page lists stay in step with the routes', () => {
  // The routes, the sitemap and llms.txt each list the pages; a page added or removed in one place only would leave
  // crawlers pointed at a "Not found" page, or never told about a new one.
  const pages = routes[0].children[0].children
    .map((route) => (route.index ? '/' : `/${route.path}`))
    .filter((path) => !path.includes(':') && path !== '/*')
    .sort();

  it('the sitemap lists every page and nothing else', () => {
    const locs = [...sitemapXml('https://a.example', []).matchAll(/<loc>https:\/\/a\.example([^<]*)<\/loc>/g)].map((m) => m[1]);
    expect(locs.sort()).toEqual(pages);
  });

  it('llms.txt links every page and nothing else', () => {
    const llms = readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), 'public/llms.txt'), 'utf8');
    const links = [...llms.matchAll(/\(__SITE_URL__(\/[^)]*)\)/g)].map((m) => m[1]).filter((path) => path !== '/sitemap.xml');
    expect(links.sort()).toEqual(pages);
  });
});
