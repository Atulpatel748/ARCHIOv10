import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { PROJECTS } from '../data/projects.js';
import { projectSchema } from '../schemas/index.js';

const publicFile = (url) => fileURLToPath(new URL(`../../client/public${url}`, import.meta.url));

// data/projects.js is edited by hand, so these checks catch the usual mistakes before they reach the website.
describe('portfolio data (data/projects.js)', () => {
  it('has unique slugs and every entry matches the project schema', () => {
    expect(PROJECTS.length).toBeGreaterThan(0);
    expect(new Set(PROJECTS.map((p) => p.slug)).size).toBe(PROJECTS.length);
    for (const project of PROJECTS) {
      const result = projectSchema.safeParse(project);
      expect(result.success, `${project.slug}: ${JSON.stringify(result.error?.issues)}`).toBe(true);
    }
  });
  it('references photos that exist in the client bundle, with descriptive alt text', () => {
    for (const { coverImage, gallery } of PROJECTS) {
      for (const image of [coverImage, ...gallery]) {
        expect(existsSync(publicFile(image.url)), `missing photo ${image.url}`).toBe(true);
        expect(image.alt.length).toBeGreaterThanOrEqual(10);
      }
    }
  });
  it('features between 3 and 6 projects for the home page', () => {
    const featured = PROJECTS.filter((p) => p.featured);
    expect(featured.length).toBeGreaterThanOrEqual(3);
    expect(featured.length).toBeLessThanOrEqual(6);
  });
});
