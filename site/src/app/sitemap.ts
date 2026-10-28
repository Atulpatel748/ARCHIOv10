import type { MetadataRoute } from 'next';
import { projects } from '@/content/projects';
import { site } from '@/content/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ['', '/projects', '/services', '/about', '/contact', '/privacy', ...projects.map((p) => `/projects/${p.slug}`)];
  return pages.map((path) => ({ url: `${site.url}${path}`, changeFrequency: 'monthly', priority: path === '' ? 1 : 0.7 }));
}
