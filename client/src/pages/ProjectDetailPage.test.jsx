import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderRoutes } from '../test/render.jsx';
import ProjectDetailPage from './ProjectDetailPage.jsx';

vi.mock('../services/projects.js', async (importOriginal) => {
  const project = (slug, title, category, description = 'First paragraph.\n\nSecond paragraph.') => ({
    slug, title, category, city: 'Dubai', country: 'United Arab Emirates', areaSqm: 232.26, summary: `${title} summary text.`,
    description, coverImage: { url: `/images/projects/${slug}/01.jpg`, alt: `${title} cover` },
    gallery: [{ url: `/images/projects/${slug}/02.jpg`, alt: `${title} living room` }],
  });
  return {
    ...(await importOriginal()),
    PROJECTS: [
      project('home-a', 'Home A', 'residential'), project('home-b', 'Home B', 'residential'), project('office-c', 'Office C', 'commercial'),
      project('garden-d', 'Arabian Ranches Garden Villa', 'landscape'),
      project('echo-e', 'Echo Office', 'commercial', 'Echo Office summary text. Then the rest of the write-up.'),
    ],
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
    for (const link of screen.getAllByRole('link', { name: /home b/i })) expect(link).toHaveAttribute('href', '/projects/home-b');
    expect(screen.getByRole('link', { name: /^Next project Home B/ })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /office c/i })).not.toBeInTheDocument();
  });

  it('links the last project round to the first', () => {
    open('echo-e');
    expect(screen.getByRole('link', { name: /^Next project Home A/ })).toHaveAttribute('href', '/projects/home-a');
  });

  it('does not repeat the summary when the write-up opens with it', () => {
    open('echo-e');
    expect(screen.getByRole('heading', { level: 2, name: 'Echo Office summary text.' })).toBeInTheDocument();
    expect(screen.getAllByText(/Echo Office summary text/)).toHaveLength(1);
    expect(screen.getByText('Then the rest of the write-up.')).toBeInTheDocument();
  });

  it('names the project in the one h1 and opens the concept with an h2', () => {
    open('garden-d');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Arabian Ranches Garden Villa');
    expect(screen.getByRole('heading', { level: 2, name: 'Arabian Ranches Garden Villa summary text.' })).toBeInTheDocument();
  });

  it('shows the not-found page for an unknown project, and keeps it out of search results', () => {
    open('no-such-project');
    expect(screen.getByRole('heading', { name: /not found|couldn.t find|doesn.t exist/i })).toBeInTheDocument();
    expect(document.title).toBe('Project not found | Archió');
    expect(document.head.querySelector('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
    expect(document.head.querySelector('link[rel="canonical"]')).toBeNull();
  });
});
