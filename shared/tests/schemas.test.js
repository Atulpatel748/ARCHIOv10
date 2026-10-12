import { describe, expect, it } from 'vitest';
import { cleanBlock, cleanLine, inquiryCreateSchema, isSafeImageRef, projectSchema, stripTags } from '../schemas/index.js';

const validInquiry = {
  name: 'Ada Lovelace', email: 'Ada@Example.com', projectType: 'residential', propertyType: 'apartment',
  budgetRange: '100k_250k', timeline: '1_3_months', message: 'We want to renovate a two-bedroom apartment fully.', consent: true,
};
const validProject = {
  title: 'Test Residence', slug: 'test-residence', category: 'residential', style: 'minimal', city: 'Dubai', country: 'United Arab Emirates',
  year: 2025, areaSqm: 120, summary: 'A calm renovation of a two-bedroom flat.', description: '',
  coverImage: { url: '/images/projects/x.jpg', alt: 'Living room elevation' }, gallery: [],
};

describe('text cleaning', () => {
  it('strips HTML tags and control characters', () => {
    expect(stripTags('<script>alert(1)</script>Hi')).toBe('alert(1)Hi');
    expect(cleanLine('  Ada\u0000 \n Lovelace <b>x</b> ')).toBe('Ada Lovelace x');
    expect(cleanBlock('a\r\n\r\n\r\n\r\nb\u0007')).toBe('a\n\nb');
  });
});

describe('inquiryCreateSchema', () => {
  it('normalizes a valid inquiry', () => {
    const result = inquiryCreateSchema.parse({ ...validInquiry, phone: '', areaSqm: '' });
    expect(result.email).toBe('ada@example.com');
    expect(result.phone).toBeUndefined();
    expect(result.areaSqm).toBeUndefined();
  });
  it('requires explicit consent and strips tags from text', () => {
    expect(inquiryCreateSchema.safeParse({ ...validInquiry, consent: false }).success).toBe(false);
    const parsed = inquiryCreateSchema.parse({ ...validInquiry, name: 'Ada <img src=x onerror=alert(1)>Lovelace' });
    expect(parsed.name).toBe('Ada Lovelace');
  });
  it('rejects markup-only messages and leaves no angle brackets in script payloads', () => {
    expect(inquiryCreateSchema.safeParse({ ...validInquiry, message: '<b></b><i></i>'.repeat(10) }).success).toBe(false);
    const parsed = inquiryCreateSchema.parse({ ...validInquiry, message: 'Hello <script>alert(1)</script> we need a full renovation.' });
    expect(parsed.message).not.toMatch(/[<>]/);
  });
  it('rejects unknown keys and operator objects (mass assignment, NoSQL injection)', () => {
    expect(inquiryCreateSchema.safeParse({ ...validInquiry, status: 'won' }).success).toBe(false);
    expect(inquiryCreateSchema.safeParse({ ...validInquiry, email: { $ne: null } }).success).toBe(false);
  });
});

describe('projectSchema', () => {
  it('accepts a complete entry and treats style, year and featured as optional', () => {
    expect(projectSchema.safeParse(validProject).success).toBe(true);
    const { style, year, ...withoutOptional } = validProject;
    expect(projectSchema.safeParse(withoutOptional).success).toBe(true);
    expect(projectSchema.safeParse({ ...withoutOptional, style: 'baroque' }).success).toBe(false);
    expect(projectSchema.safeParse({ ...withoutOptional, year: 1800 }).success).toBe(false);
  });
  it('rejects typos in field names, bad slugs and short alt text', () => {
    expect(projectSchema.safeParse({ ...validProject, sumary: 'x' }).success).toBe(false);
    expect(projectSchema.safeParse({ ...validProject, slug: 'Not A Slug' }).success).toBe(false);
    expect(projectSchema.safeParse({ ...validProject, coverImage: { url: '/images/projects/x.jpg', alt: 'a' } }).success).toBe(false);
  });
  it('rejects unsafe image references', () => {
    for (const url of ['javascript:alert(1)', 'http://insecure.example/x.jpg', '/images/../secret', '//evil.example/x', 'https://user:pw@cdn.example/x.jpg']) {
      expect(isSafeImageRef(url), url).toBe(false);
    }
    expect(isSafeImageRef('https://cdn.example.com/a.jpg')).toBe(true);
    expect(isSafeImageRef('/images/projects/a.jpg')).toBe(true);
  });
});
