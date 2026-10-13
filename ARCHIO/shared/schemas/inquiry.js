import { z } from 'zod';
import {
  BUDGET_RANGE_VALUES, INQUIRY_PROJECT_TYPE_VALUES, LIMITS,
  PROPERTY_TYPE_VALUES, TIMELINE_VALUES,
} from '../constants/index.js';
import { emailSchema, phoneSchema } from './common.js';
import { emptyToUndefined, multiLine, singleLine } from './text.js';

export const inquiryFields = {
  name: singleLine(2, 80, 'Enter your name.'),
  email: emailSchema,
  phone: emptyToUndefined(phoneSchema),
  city: emptyToUndefined(singleLine(2, 80)),
  projectType: z.enum(INQUIRY_PROJECT_TYPE_VALUES, { error: 'Choose what you need help with.' }),
  propertyType: z.enum(PROPERTY_TYPE_VALUES, { error: 'Choose a property type.' }),
  areaSqm: emptyToUndefined(z.number({ error: 'Enter the area as a number.' }).min(5, 'Area must be at least 5.').max(100000, 'Area is too large.')),
  budgetRange: z.enum(BUDGET_RANGE_VALUES, { error: 'Choose a budget range.' }),
  timeline: z.enum(TIMELINE_VALUES, { error: 'Choose a timeline.' }),
  message: multiLine(LIMITS.MESSAGE_MIN, LIMITS.MESSAGE_MAX, 'Tell us about your space.'),
  consent: z.literal(true, { error: 'Accept the privacy notice to send your request.' }),
  website: z.string().max(200).optional(),
};

export const inquiryCreateSchema = z.strictObject(inquiryFields);
