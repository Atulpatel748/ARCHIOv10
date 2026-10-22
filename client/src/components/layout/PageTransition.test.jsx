import { act, render, screen } from '@testing-library/react';
import { StrictMode } from 'react';
import { MemoryRouter, useNavigate } from 'react-router';
import { describe, expect, it } from 'vitest';
import PageTransition from './PageTransition.jsx';

let go;
function Harness() {
  go = useNavigate();
  return <PageTransition><p>page content</p></PageTransition>;
}
const page = () => screen.getByText('page content').parentElement;

describe('PageTransition', () => {
  it('does not animate the first page load, even under StrictMode double effects', () => {
    render(<StrictMode><MemoryRouter initialEntries={['/']}><Harness /></MemoryRouter></StrictMode>);
    expect(page()).toHaveClass('page');
    expect(page()).not.toHaveClass('page--enter');
  });

  it('eases the next page in after a client-side navigation', () => {
    render(<StrictMode><MemoryRouter initialEntries={['/']}><Harness /></MemoryRouter></StrictMode>);
    act(() => go('/projects'));
    expect(page()).toHaveClass('page--enter');
  });

  it('does not replay when only the search params change (a filter), and does not reset on returning home', () => {
    render(<MemoryRouter initialEntries={['/projects']}><Harness /></MemoryRouter>);
    const initial = page();
    act(() => go('/projects?category=residential'));
    expect(page()).toBe(initial);
    expect(page()).not.toHaveClass('page--enter');

    act(() => go('/'));
    expect(page()).toHaveClass('page--enter');
  });
});
