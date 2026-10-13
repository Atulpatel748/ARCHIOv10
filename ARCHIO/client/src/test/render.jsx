import { render } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router';

// A data router rather than MemoryRouter, so components under test can use router features such as useBlocker.
export function renderWithProviders(ui, { route = '/' } = {}) {
  const router = createMemoryRouter([{ path: '*', element: ui }], { initialEntries: [route] });
  return render(<RouterProvider router={router} />);
}

export function renderRoutes(routes, { route = '/' } = {}) {
  const router = createMemoryRouter(routes, { initialEntries: [route] });
  return { router, ...render(<RouterProvider router={router} />) };
}
