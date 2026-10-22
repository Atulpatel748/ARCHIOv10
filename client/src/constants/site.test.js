import { describe, expect, it } from 'vitest';
import { GMAIL_COMPOSE_URL, SITE } from './site.js';

describe('Gmail compose link', () => {
  it('opens a Gmail compose window addressed to the studio email', () => {
    const url = new URL(GMAIL_COMPOSE_URL);
    expect(url.origin).toBe('https://mail.google.com');
    expect(url.searchParams.get('view')).toBe('cm');
    expect(url.searchParams.get('to')).toBe(SITE.email);
  });
});
