import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderRoutes } from '../test/render.jsx';
import ProjectDetailPage from './ProjectDetailPage.jsx';

vi.mock('../services/projects.js', async (importOriginal) => {
  const project = (slug, title, category) => ({
    slug, title, category, city: 'Dubai', country: 'United Arab Emirates', areaSqm: 232.26, summary: `${title} summary text.`,
    description: 'First paragraph.\n\nSecond paragraph.', coverImage: { url: `/images/projects/${slug}/01.jpg`, alt: `${title} cover` },
    gallery: [{ url: `/images/projects/${slug}/02.jpg`, alt: `${title} living room` }],
  });
  return {
    ...(await importOriginal()),
    PROJECTS: [project('home-a', 'Home A', 'residential'), project('home-b', 'Home B', 'residential'), project('office-c', 'Office C', 'commercial')],
  };
});

const open = (slug) =>
  renderRoutes(
    [{ path: '/projects/:slug', element: <ProjectDetailPage /> }, { path: '*', element: <p>elsewhere</p> }],
    { route: `/projects/${slug}` },
  );

describe('ProjectDetailPage', () => {
  // jsdom has no IntersectionObserver; the scroll-reveal hooks on this page need one.
  beforeEach(() => {
    vi.stubGlobal('IntersectionObserver', class { observe() {} unobserve() {} disconnect() {} });
  });

  it('shows the project, its facts, its gallery and similar projects, all at once', () => {
    open('home-a');
    expect(screen.getByRole('heading', { level: 1, name: 'Home A' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'All projects' })).not.toBeInTheDocument();
    expect(screen.getByText('Location').nextElementSibling).toHaveTextContent('Dubai, United Arab Emirates');
    expect(screen.getByText('First paragraph.')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Home A living room' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /home b/i })).toHaveAttribute('href', '/projects/home-b');
    expect(screen.queryByRole('link', { name: /office c/i })).not.toBeInTheDocument();
  });

  it('shows the not-found page for an unknown project, and keeps it out of search results', () => {
    open('no-such-project');
    expect(screen.getByRole('heading', { name: /not found|couldn.t find|doesn.t exist/i })).toBeInTheDocument();
    expect(document.title).toBe('Project not found | Archió');
    expect(document.head.querySelector('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
    expect(document.head.querySelector('link[rel="canonical"]')).toBeNull();
  });
});
