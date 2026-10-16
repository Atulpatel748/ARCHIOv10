import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderRoutes, renderWithProviders } from '../test/render.jsx';
import ProjectsPage from './ProjectsPage.jsx';

vi.mock('../services/projects.js', async (importOriginal) => {
  const project = (slug, title, category, city) => ({
    slug, title, category, city, country: 'United Arab Emirates', areaSqm: 100, summary: `${title} summary text.`, description: '',
    coverImage: { url: `/images/projects/${slug}/01.jpg`, alt: 'x' }, gallery: [],
  });
  return {
    ...(await importOriginal()),
    PROJECTS: [
      project('project-1', 'Project 1', 'residential', 'Dubai Marina'),
      project('project-2', 'Project 2', 'commercial', 'JLT'),
      project('project-3', 'Project 3', 'landscape', 'Arabian Ranches'),
    ],
  };
});

const open = (route) => renderWithProviders(<ProjectsPage />, { route });

describe('ProjectsPage', () => {
  it('shows every project at once, from the loaded portfolio, and links to each one', () => {
    open('/projects');
    expect(screen.getByRole('link', { name: /project 1/i })).toHaveAttribute('href', '/projects/project-1');
    expect(screen.getByText('3 projects')).toBeInTheDocument();
    expect(screen.queryByLabelText(/loading/i)).not.toBeInTheDocument();
  });

  it('filters by the category in the URL', () => {
    open('/projects?category=landscape');
    expect(screen.getByRole('link', { name: /project 3/i })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /project 1/i })).not.toBeInTheDocument();
    expect(screen.getByText('1 project')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Landscape' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('filters by the search term in the URL', () => {
    open('/projects?q=marina');
    expect(screen.getByRole('link', { name: /project 1/i })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /project 2/i })).not.toBeInTheDocument();
  });

  it('ignores unsupported category and page values from the URL', () => {
    open('/projects?category=%24ne&page=-4');
    expect(screen.getAllByRole('link', { name: /project \d/i })).toHaveLength(3);
    expect(screen.getByRole('button', { name: 'All' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('shows an empty state with a way out', async () => {
    open('/projects?q=nothing-matches-this');
    expect(screen.getByRole('heading', { name: /no projects match/i })).toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole('button', { name: /clear filters/i }));
    await waitFor(() => expect(screen.getByRole('link', { name: /project 1/i })).toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'All' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('narrows the list as you pick a category', async () => {
    open('/projects');
    await userEvent.setup().click(screen.getByRole('button', { name: 'Commercial' }));
    await waitFor(() => expect(screen.queryByRole('link', { name: /project 1/i })).not.toBeInTheDocument());
    expect(screen.getByRole('link', { name: /project 2/i })).toBeInTheDocument();
  });

  it('uses the four-column project grid without density controls', () => {
    open('/projects');
    expect(screen.queryByRole('button', { name: /per row/i })).not.toBeInTheDocument();
    expect(document.querySelector('.project-grid--dense')).toBeInTheDocument();
  });

  it('clears the search box when the address drops the search, as the header Projects link does', async () => {
    const { router } = renderRoutes([{ path: '/projects', element: <ProjectsPage /> }], { route: '/projects?q=marina' });
    expect(screen.getByLabelText(/search projects/i)).toHaveValue('marina');
    await act(() => router.navigate('/projects'));
    expect(screen.getByLabelText(/search projects/i)).toHaveValue('');
    expect(screen.getAllByRole('link', { name: /project \d/i })).toHaveLength(3);
  });
});
