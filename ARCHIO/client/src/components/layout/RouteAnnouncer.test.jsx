import { act, render, screen } from '@testing-library/react';
import { StrictMode } from 'react';
import { MemoryRouter, useNavigate } from 'react-router';
import { describe, expect, it } from 'vitest';
import RouteAnnouncer from './RouteAnnouncer.jsx';

let navigateTo;
function Harness() {
  navigateTo = useNavigate();
  return (
    <>
      <main id="main" tabIndex={-1}>content</main>
      <RouteAnnouncer />
    </>
  );
}

describe('RouteAnnouncer', () => {
  it('does not move focus on initial load, even under StrictMode double effects', () => {
    render(<StrictMode><MemoryRouter initialEntries={['/about']}><Harness /></MemoryRouter></StrictMode>);
    expect(screen.getByRole('main')).not.toHaveFocus();
  });

  it('moves focus to main after a client-side navigation', () => {
    render(<StrictMode><MemoryRouter initialEntries={['/about']}><Harness /></MemoryRouter></StrictMode>);
    act(() => navigateTo('/contact'));
    expect(screen.getByRole('main')).toHaveFocus();
  });
});
