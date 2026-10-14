import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Button from './Button.jsx';

describe('Button', () => {
  it('stays disabled while loading, even when the caller also passes disabled={false}', () => {
    render(<Button loading disabled={false}>Send</Button>);
    const button = screen.getByRole('button', { name: 'Send' });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
  });
});
