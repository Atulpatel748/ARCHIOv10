import { act, fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../../test/render.jsx';
import { holdPreloader, preloaderPainted, resetPreloaderForTests } from '../../utils/preloader.js';
import HeroPortal from './HeroPortal.jsx';

const project = (slug) => ({ slug, city: 'Dubai', coverImage: { url: `/images/projects/${slug}/01.jpg`, alt: `${slug} cover` } });
const PROJECTS = [project('a'), project('b')];

describe('HeroPortal', () => {
  it('lets visitors stop the slideshow (WCAG 2.2.2) and start it again', async () => {
    const user = userEvent.setup();
    renderWithProviders(<HeroPortal projects={PROJECTS} />);
    await user.click(screen.getByRole('button', { name: 'Pause slideshow' }));
    await user.click(screen.getByRole('button', { name: 'Play slideshow' }));
    expect(screen.getByRole('button', { name: 'Pause slideshow' })).toBeInTheDocument();
  });

  it('keeps the photo backdrop out of the tab order and away from screen readers', () => {
    const { container } = renderWithProviders(<HeroPortal projects={PROJECTS} />);
    expect(container.querySelector('.hero-portal__media')).toHaveAttribute('inert');
    expect(screen.getByRole('link', { name: /view project/i })).toHaveAttribute('href', '/projects/a');
  });

  it('shows no control when nothing moves: reduced motion, or a single photo', () => {
    const { unmount } = renderWithProviders(<HeroPortal projects={[project('a')]} />);
    expect(screen.queryByRole('button', { name: /slideshow/i })).not.toBeInTheDocument();
    unmount();
    vi.spyOn(window, 'matchMedia').mockImplementation((query) => ({
      matches: query.includes('reduce'), media: query, addEventListener() {}, removeEventListener() {},
    }));
    renderWithProviders(<HeroPortal projects={PROJECTS} />);
    expect(screen.queryByRole('button', { name: /slideshow/i })).not.toBeInTheDocument();
  });

  it('without WebGL shows the photos as images, and lifts the loading screen once the first one has loaded', () => {
    // jsdom has no WebGL (see test/setup.js), so the gallery takes the same path as a phone without a GPU.
    vi.useFakeTimers();
    const curtain = document.body.appendChild(Object.assign(document.createElement('div'), { id: 'app-preloader' }));
    resetPreloaderForTests();
    holdPreloader('hero');
    preloaderPainted();
    const { container } = renderWithProviders(<HeroPortal projects={PROJECTS} />);
    const first = container.querySelector('.mg__img');
    // The AVIF twin first, for browsers that can read it; the JPEG for the ones that cannot.
    expect(first.closest('picture').querySelector('source')).toHaveAttribute('srcset', '/images/projects/a/01.avif');
    expect(first).toHaveAttribute('src', '/images/projects/a/01.jpg');
    act(() => vi.advanceTimersByTime(1000));
    expect(curtain).not.toHaveClass('is-hidden'); // still waiting for the photo
    fireEvent.load(first);
    act(() => vi.advanceTimersByTime(200));
    expect(curtain).toHaveClass('is-hidden');
    curtain.remove();
  });
});
