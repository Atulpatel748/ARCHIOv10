import { PROJECTS } from '@archio/shared/projects';

// sitemap.xml is written at build time (see vite.config.js), from the same portfolio the pages show.
const STATIC_PATHS = ['/', '/projects', '/services', '/about', '/contact', '/privacy', '/terms', '/cookies'];

export function sitePaths(projects = PROJECTS) {
  return [...STATIC_PATHS, ...projects.map((project) => `/projects/${project.slug}`)];
}
const escapeXml = (value) => value.replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c]);

export function sitemapXml(siteUrl, projects = PROJECTS) {
  const urls = sitePaths(projects)
    .map((path) => `  <url><loc>${escapeXml(siteUrl + path)}</loc></url>`)
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}
