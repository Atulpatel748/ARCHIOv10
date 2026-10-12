import { z } from 'zod';

const TAGS = /<[^>]*>/g;
const CONTROL_EXCEPT_WHITESPACE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const ALL_CONTROL = /[\u0000-\u001F\u007F]/g;

export const stripTags = (value) => value.replace(TAGS, '');

export const cleanLine = (value) =>
  stripTags(value).replace(ALL_CONTROL, ' ').replace(/\s+/g, ' ').trim();

export const cleanBlock = (value) =>
  stripTags(value)
    .replace(CONTROL_EXCEPT_WHITESPACE, '')
    .replace(/\r\n?/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

const lengthMessages = (min, max) => ({
  tooShort: min <= 1 ? 'This field is required.' : `Enter at least ${min} characters.`,
  tooLong: `Use ${max} characters or fewer.`,
});

const bounded = (clean, min, max, requiredMessage = 'This field is required.') => {
  const messages = lengthMessages(min, max);
  let bounds = z.string().max(max, messages.tooLong);
  if (min >= 1) bounds = bounds.min(1, requiredMessage);
  if (min > 1) bounds = bounds.min(min, messages.tooShort);
  return z.string({ error: requiredMessage }).max(max * 4, messages.tooLong).transform(clean).pipe(bounds);
};

export const singleLine = (min, max, requiredMessage) => bounded(cleanLine, min, max, requiredMessage);
export const multiLine = (min, max, requiredMessage) => bounded(cleanBlock, min, max, requiredMessage);

export const emptyToUndefined = (schema) =>
  z.preprocess((value) => (value === '' || value === null ? undefined : value), schema.optional());
