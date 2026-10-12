import { describe, expect, it } from 'vitest';
import { formatArea, formatProjectLocation } from './format.js';

describe('formatArea', () => {
  it('shows square metres and square feet together', () => {
    expect(formatArea(232.26)).toBe('232 m\u00B2 (2,500 sq ft)');
    expect(formatArea(185.81)).toBe('186 m\u00B2 (2,000 sq ft)');
    expect(formatArea(6500)).toBe('6,500 m\u00B2 (69,965 sq ft)');
  });

  describe('formatProjectLocation', () => {
    it('omits the leading district when the project title already names it', () => {
      expect(formatProjectLocation({
        title: 'Dubai Marina Residence',
        city: 'Dubai Marina, Dubai',
        country: 'United Arab Emirates',
      })).toBe('Dubai, United Arab Emirates');
    });

    it('keeps the full city when the title does not repeat its district', () => {
      expect(formatProjectLocation({
        title: 'Garden Residence',
        city: 'Arabian Ranches 2, Dubai',
        country: 'United Arab Emirates',
      })).toBe('Arabian Ranches 2, Dubai, United Arab Emirates');
    });
  });
});
