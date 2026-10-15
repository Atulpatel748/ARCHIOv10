import { act, fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../../test/render.jsx';
import { preloaderPainted, resetPreloaderForTests } from '../../utils/preloader.js';
import HeroPortal from './HeroPortal.jsx';

const project = (slug) => ({ slug, city: 'Dubai', coverImage: { url: `/images/projects/${slug}/01.jpg`, alt: `${slug} cover` } });
const PROJECTS = [project('a'), project('b')];

describe('HeroPortal', () => {
  beforeEach(() => {
    document.body.appendChild(Object.assign(document.createElement('div'), { id: 'app-preloader' }));
    resetPreloaderForTests();
  });
  afterEach(() => {
    document.getElementById('app-preloader')?.remove();
    vi.useRealTimers();
  });

  it('lets visitors stop the slideshow (WCAG 2.2.2) and start it again', async () => {
    const user = userEvent.setup();
    renderWithProviders(<HeroPortal projects={PROJECTS} />);
    await user.click(screen.getByRole('button', { name: 'Pause slideshow' }));
    await user.click(screen.getByRole('button', { name: 'Play slideshow' }));
    expect(screen.getByRole('button', { name: 'Pause slideshow' })).toBeInTheDocument();
  });

  it('moves on to the next photo only while the hero is on screen', () => {
    vi.useFakeTimers();
    let report;
    vi.stubGlobal('IntersectionObserver', class {
      constructor(callback) { report = (isIntersecting) => callback([{ isIntersecting }]); }
      observe() {}
      disconnect() {}
    });
    renderWithProviders(<HeroPortal projects={[{ ...project('a'), city: 'First' }, { ...project('b'), city: 'Second' }]} />);
    const link = () => screen.getByRole('link', { name: /view project/i });
    act(() => report(false)); // scrolled away
    act(() => vi.advanceTimersByTime(13_000));
    expect(link()).toHaveAttribute('href', '/projects/a');
    act(() => report(true)); // back on screen
    act(() => vi.advanceTimersByTime(6_000));
    expect(link()).toHaveAttribute('href', '/projects/b');
    vi.unstubAllGlobals();
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
    const curtain = document.getElementById('app-preloader');
    const { container } = renderWithProviders(<HeroPortal projects={PROJECTS} />);
    preloaderPainted(); // React has painted; the hero is what the loading screen is still waiting for
    const first = container.querySelector('.mg__img');
    // The AVIF twin first, for browsers that can read it; the JPEG for the ones that cannot.
    expect(first.closest('picture').querySelector('source')).toHaveAttribute('srcset', '/images/projects/a/01.avif');
    expect(first).toHaveAttribute('src', '/images/projects/a/01.jpg');
    act(() => vi.advanceTimersByTime(1000));
    expect(curtain).not.toHaveClass('is-hidden'); // still waiting for the photo
    fireEvent.load(first);
    expect(curtain).toHaveClass('is-hidden');
  });

  it('holds the loading screen from the moment it mounts, and lets go if it goes away first', () => {
    const { unmount } = renderWithProviders(<HeroPortal projects={PROJECTS} />);
    preloaderPainted();
    expect(document.getElementById('app-preloader')).not.toHaveClass('is-hidden');
    unmount();
    expect(document.getElementById('app-preloader')).toHaveClass('is-hidden');
  });

  it('has nothing to hold the loading screen for without photos', () => {
    renderWithProviders(<HeroPortal projects={[]} />);
    preloaderPainted();
    expect(document.getElementById('app-preloader')).toHaveClass('is-hidden');
  });
});
