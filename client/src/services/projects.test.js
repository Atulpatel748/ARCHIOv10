import { describe, expect, it } from 'vitest';
import { featuredProjects, getProject, listProjects, relatedProjects } from './projects.js';

const project = (slug, title, category, city, featured = false) => ({
  slug, title, category, city, country: 'United Arab Emirates', areaSqm: 100, summary: `${title} summary text.`, description: '',
  coverImage: { url: `/images/projects/${slug}/01.jpg`, alt: 'x' }, gallery: [], featured,
});
const PROJECTS = [
  project('marina-home', 'Marina Home', 'residential', 'Dubai Marina', true),
  project('palm-villa', 'Palm Villa', 'residential', 'Palm Jumeirah', true),
  project('jlt-office', 'JLT Office', 'commercial', 'JLT'),
  project('ranch-garden', 'Ranch Garden', 'landscape', 'Arabian Ranches', true),
  ...Array.from({ length: 12 }, (_, i) => project(`extra-${i + 1}`, `Extra ${i + 1}`, 'residential', 'Dubai')),
];

describe('portfolio service', () => {
  it('lists featured projects in stored order, up to a limit', () => {
    expect(featuredProjects(PROJECTS).map((p) => p.slug)).toEqual(['marina-home', 'palm-villa', 'ranch-garden']);
    expect(featuredProjects(PROJECTS, 2)).toHaveLength(2);
  });

  it('filters by category and by a case-insensitive search over title, city, country and summary', () => {
    expect(listProjects(PROJECTS, { category: 'commercial' }).items.map((p) => p.slug)).toEqual(['jlt-office']);
    expect(listProjects(PROJECTS, { q: 'MARINA' }).items.map((p) => p.slug)).toEqual(['marina-home']);
    expect(listProjects(PROJECTS, { q: 'ranches' }).items.map((p) => p.slug)).toEqual(['ranch-garden']);
    expect(listProjects(PROJECTS, { q: 'united arab' }).meta.total).toBe(16);
    expect(listProjects(PROJECTS, { category: 'landscape', q: 'marina' }).items).toEqual([]);
    expect(listProjects(PROJECTS, { q: '   ' }).meta.total).toBe(16);
  });

  it('paginates and keeps out-of-range pages on a real page', () => {
    const first = listProjects(PROJECTS, { page: 1, limit: 12 });
    expect(first.items).toHaveLength(12);
    expect(first.meta).toEqual({ page: 1, limit: 12, total: 16, totalPages: 2 });
    expect(listProjects(PROJECTS, { page: 2, limit: 12 }).items).toHaveLength(4);
    expect(listProjects(PROJECTS, { page: 99, limit: 12 }).meta.page).toBe(2);
    expect(listProjects(PROJECTS, { page: -3, limit: 12 }).meta.page).toBe(1);
    expect(listProjects(PROJECTS, { q: 'nothing like this' }).meta).toMatchObject({ total: 0, totalPages: 1, page: 1 });
  });

  it('finds a project by slug, and returns null for an unknown one', () => {
    expect(getProject(PROJECTS, 'palm-villa').title).toBe('Palm Villa');
    expect(getProject(PROJECTS, 'nope')).toBeNull();
    expect(getProject(PROJECTS, '__proto__')).toBeNull();
  });

  it('suggests other projects from the same category, never the project itself', () => {
    const related = relatedProjects(PROJECTS, getProject(PROJECTS, 'marina-home'));
    expect(related).toHaveLength(3);
    expect(related.every((p) => p.category === 'residential' && p.slug !== 'marina-home')).toBe(true);
    expect(relatedProjects(PROJECTS, getProject(PROJECTS, 'jlt-office'))).toEqual([]);
  });
});
