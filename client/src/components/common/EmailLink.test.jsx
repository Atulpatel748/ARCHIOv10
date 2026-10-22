import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { GMAIL_COMPOSE_URL, SITE } from '../../constants/site.js';
import EmailLink from './EmailLink.jsx';

const mouse = (matches) => vi.spyOn(window, 'matchMedia').mockReturnValue({ matches });

describe('EmailLink', () => {
  afterEach(() => vi.restoreAllMocks());

  it('keeps the mailto: address as its link', () => {
    render(<EmailLink />);
    expect(screen.getByRole('link', { name: SITE.email })).toHaveAttribute('href', `mailto:${SITE.email}`);
  });

  it('opens Gmail on a plain click with a mouse', () => {
    mouse(true);
    const open = vi.spyOn(window, 'open').mockReturnValue(null);
    render(<EmailLink />);
    expect(fireEvent.click(screen.getByRole('link'))).toBe(false); // the mailto: default is cancelled
    expect(open).toHaveBeenCalledWith(GMAIL_COMPOSE_URL, '_blank', 'noopener,noreferrer');
  });

  it('leaves touch screens and modified clicks to the mailto: link', () => {
    const open = vi.spyOn(window, 'open').mockReturnValue(null);
    mouse(false);
    render(<EmailLink />);
    fireEvent.click(screen.getByRole('link'));
    mouse(true);
    fireEvent.click(screen.getByRole('link'), { ctrlKey: true });
    expect(open).not.toHaveBeenCalled();
  });
});
