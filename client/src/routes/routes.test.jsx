import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderRoutes } from '../test/render.jsx';
import { routes } from './index.jsx';

describe('routes', () => {
  it('shows the friendly error page, never a stack trace, when the layout itself fails', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {}); // React reports the thrown error; it is expected here
    const BrokenLayout = () => {
      throw new Error('layout exploded');
    };
    renderRoutes([{ ...routes[0], Component: BrokenLayout }]);
    expect(screen.getByRole('heading', { level: 1, name: 'Something went wrong' })).toBeInTheDocument();
    expect(screen.queryByText(/layout exploded|Unexpected Application Error/)).not.toBeInTheDocument();
  });
});
