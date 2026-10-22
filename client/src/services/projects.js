// The portfolio is built into the site from shared/data/projects.js: adding a project means editing that file and
// redeploying. The helpers below take the list as an argument so tests can pass their own.
export { PROJECTS } from '@archio/shared/projects';

export const featuredProjects = (projects, limit = 6) => projects.filter((project) => project.featured).slice(0, limit);

export function listProjects(projects, { category = '', q = '', page = 1, limit = 12 } = {}) {
  const term = q.trim().toLowerCase();
  const matches = projects.filter(
    (project) =>
      (!category || project.category === category) &&
      (!term || [project.title, project.city, project.country, project.summary].some((field) => field.toLowerCase().includes(term))),
  );
  const total = matches.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const current = Math.min(Math.max(page, 1), totalPages);
  return { items: matches.slice((current - 1) * limit, current * limit), meta: { page: current, limit, total, totalPages } };
}

export const getProject = (projects, slug) => projects.find((project) => project.slug === slug) ?? null;

export const relatedProjects = (projects, project, count = 3) =>
  projects.filter((item) => item.category === project.category && item.slug !== project.slug).slice(0, count);
