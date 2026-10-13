import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Input from './Input.jsx';

describe('Input', () => {
  it('turns off spell-check for email addresses, which are not words', () => {
    render(<Input label="Email" type="email" />);
    expect(screen.getByLabelText('Email')).toHaveAttribute('spellcheck', 'false');
  });

  it('leaves spell-check alone for ordinary text, and lets a caller override it', () => {
    render(<><Input label="Full name" /><Input label="Reference" spellCheck={false} /></>);
    expect(screen.getByLabelText('Full name')).not.toHaveAttribute('spellcheck');
    expect(screen.getByLabelText('Reference')).toHaveAttribute('spellcheck', 'false');
  });
});
