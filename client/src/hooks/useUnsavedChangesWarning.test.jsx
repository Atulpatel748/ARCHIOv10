import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Link } from 'react-router';
import { z } from 'zod';
import { describe, expect, it, vi } from 'vitest';
import { renderRoutes } from '../test/render.jsx';
import { useForm } from './useForm.js';
import { UNSAVED_CHANGES_MESSAGE, useUnsavedChangesWarning } from './useUnsavedChangesWarning.js';

function Page({ warn }) {
  useUnsavedChangesWarning(warn);
  return <Link to="/away">Leave</Link>;
}
const routesFor = (warn) => [
  { path: '/', element: <Page warn={warn} /> },
  { path: '/away', element: <p>Away page</p> },
];

describe('useUnsavedChangesWarning', () => {
  it('lets navigation through when there is nothing to lose', async () => {
    const confirm = vi.spyOn(window, 'confirm');
    renderRoutes(routesFor(false));
    await userEvent.click(screen.getByRole('link', { name: 'Leave' }));
    expect(await screen.findByText('Away page')).toBeInTheDocument();
    expect(confirm).not.toHaveBeenCalled();
  });

  it('asks before leaving, and stays on the page when the person declines', async () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    renderRoutes(routesFor(true));
    await userEvent.click(screen.getByRole('link', { name: 'Leave' }));
    expect(confirm).toHaveBeenCalledWith(UNSAVED_CHANGES_MESSAGE);
    expect(screen.getByRole('link', { name: 'Leave' })).toBeInTheDocument();
    expect(screen.queryByText('Away page')).not.toBeInTheDocument();
  });

  it('leaves when the person confirms', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    renderRoutes(routesFor(true));
    await userEvent.click(screen.getByRole('link', { name: 'Leave' }));
    expect(await screen.findByText('Away page')).toBeInTheDocument();
  });

  it('prompts on closing or reloading the tab only while there are unsaved changes', () => {
    const closing = () => {
      const event = new Event('beforeunload', { cancelable: true });
      act(() => { window.dispatchEvent(event); });
      return event.defaultPrevented;
    };
    const dirty = renderRoutes(routesFor(true));
    expect(closing()).toBe(true);
    dirty.unmount();
    renderRoutes(routesFor(false));
    expect(closing()).toBe(false);
  });
});

function FormHarness({ onSubmit }) {
  const form = useForm({ schema: z.object({ name: z.string().min(1) }), initialValues: { name: '' }, onSubmit });
  return (
    <form onSubmit={form.handleSubmit}>
      <input aria-label="Name" {...form.field('name')} />
      <button type="submit">Save</button>
      <output>{form.dirty ? 'dirty' : 'clean'}</output>
    </form>
  );
}

describe('useForm dirty state', () => {
  it('is dirty while the values differ from the starting values, and clean again when they match', async () => {
    render(<FormHarness onSubmit={async () => {}} />);
    expect(screen.getByRole('status')).toHaveTextContent('clean');
    await userEvent.type(screen.getByLabelText('Name'), 'Ada');
    expect(screen.getByRole('status')).toHaveTextContent('dirty');
    await userEvent.clear(screen.getByLabelText('Name'));
    expect(screen.getByRole('status')).toHaveTextContent('clean');
  });

  it('becomes clean after a successful save, but stays dirty when the save fails', async () => {
    const onSubmit = vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce(undefined);
    render(<FormHarness onSubmit={onSubmit} />);
    await userEvent.type(screen.getByLabelText('Name'), 'Ada');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('status')).toHaveTextContent('dirty');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByText('clean')).toBeInTheDocument();
  });
});
