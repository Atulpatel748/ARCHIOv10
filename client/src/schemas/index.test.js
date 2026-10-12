import { config } from 'zod';
import { describe, expect, it, vi } from 'vitest';
import { inquiryCreateSchema } from './index.js';

describe('client schemas', () => {
  it('runs Zod without eval, so the strict Content-Security-Policy is never violated', () => {
    expect(config().jitless).toBe(true);
    const spy = vi.spyOn(globalThis, 'Function');
    inquiryCreateSchema.safeParse({});
    expect(spy).not.toHaveBeenCalled();
  });
});
