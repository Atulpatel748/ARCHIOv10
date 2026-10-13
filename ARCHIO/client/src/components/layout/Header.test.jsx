import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '../../test/render.jsx';
import Header from './Header.jsx';

describe('Header', () => {
  it('exposes the primary navigation, with no sign-in or account controls', () => {
    renderWithProviders(<Header />);
    const nav = screen.getByRole('navigation', { name: 'Primary' });
    expect(within(nav).getAllByRole('link').map((link) => link.textContent)).toEqual(['Projects', 'Services', 'About']);
    expect(screen.queryByRole('link', { name: /sign in|log in|register/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /account/i })).not.toBeInTheDocument();
  });

  it('marks the current page in the navigation', () => {
    renderWithProviders(<Header />, { route: '/projects/dubai-marina-residence' });
    expect(screen.getByRole('link', { name: 'Projects' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Services' })).not.toHaveAttribute('aria-current');
  });

  it('opens and closes the mobile menu', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Header />);
    const toggle = screen.getByRole('button', { name: /menu/i });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await user.click(toggle);
    const dialog = document.getElementById('mobile-menu');
    expect(dialog).toHaveAttribute('open');
    expect(within(dialog).getByRole('link', { name: 'Contact' })).toBeInTheDocument();
    expect(within(dialog).queryByRole('link', { name: 'Start your project' })).not.toBeInTheDocument();
    expect(within(dialog).queryByRole('link', { name: /sign in|account/i })).not.toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: /close/i }));
    expect(dialog).not.toHaveAttribute('open');
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes the mobile menu when you pick the page you are already on', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Header />, { route: '/projects' });
    await user.click(screen.getByRole('button', { name: /menu/i }));
    const dialog = document.getElementById('mobile-menu');
    await user.click(within(dialog).getByRole('link', { name: 'Projects' }));
    expect(dialog).not.toHaveAttribute('open');
  });

  it('puts the Menu button before the logo, so it sits on the left and is the first stop for the keyboard', () => {
    renderWithProviders(<Header />);
    const toggle = screen.getByRole('button', { name: /menu/i });
    const logo = screen.getByRole('link', { name: /home/i });
    expect(toggle.compareDocumentPosition(logo) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(logo.querySelector('.wordmark')).toBeInTheDocument(); // the brand kit's ARCHIÓ, without the submark
    expect(logo.querySelector('img')).not.toBeInTheDocument();
  });
});

describe('Header "Start your project" button', () => {
  it('is always shown, on the home page and everywhere else', () => {
    for (const route of ['/', '/projects']) {
      const { container, unmount } = renderWithProviders(<Header />, { route });
      const cta = container.querySelector('.header-cta');
      expect(cta).toHaveAttribute('href', '/contact');
      expect(cta).not.toHaveAttribute('aria-hidden');
      expect(cta).not.toHaveAttribute('tabindex');
      unmount();
    }
  });
});
