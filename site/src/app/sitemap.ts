import type { MetadataRoute } from 'next';
import { projects } from '@/content/projects';
import { site } from '@/content/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ['', '/projects', '/services', '/about', '/contact', '/privacy', ...projects.map((p) => `/projects/${p.slug}`)];
  const lastModified = new Date(); // the build date: every deploy rebuilds the pages
  return pages.map((path) => ({ url: `${site.url}${path}`, lastModified, changeFrequency: 'monthly', priority: path === '' ? 1 : 0.7 }));
}
