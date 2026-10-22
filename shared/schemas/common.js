import { z } from 'zod';
export const slugSchema = z
  .string()
  .min(3, 'Use at least 3 characters.')
  .max(120, 'Use 120 characters or fewer.')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and single hyphens.');

export const emailSchema = z
  .string({ error: 'Enter your email address.' })
  .max(254, 'Email address is too long.')
  .transform((value) => value.trim().toLowerCase())
  .pipe(z.email('Enter a valid email address.'));

export const phoneSchema = z
  .string()
  .max(40, 'Phone number is too long.')
  .transform((value) => value.trim())
  .pipe(z.string().regex(/^\+?[\d\s().-]{7,20}$/, 'Enter a valid phone number.'));

const RELATIVE_IMAGE = /^\/images\/[A-Za-z0-9_\-./]{1,200}$/;

export const isSafeImageRef = (value) => {
  if (RELATIVE_IMAGE.test(value)) return !value.includes('..') && !value.includes('//');
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password && url.hostname.includes('.');
  } catch {
    return false;
  }
};

export const imageRefSchema = z
  .string({ error: 'Enter an image path or URL.' })
  .max(500, 'Image reference is too long.')
  .refine(isSafeImageRef, 'Use an /images/... path or an https:// URL.');
