import { z } from 'zod';
import { LIMITS, PROJECT_CATEGORY_VALUES, PROJECT_STYLE_VALUES } from '../constants/index.js';
import { imageRefSchema, slugSchema } from './common.js';
import { multiLine, singleLine } from './text.js';

const imageSchema = z.strictObject({ url: imageRefSchema, alt: singleLine(3, 160, 'Describe the image for screen readers.') });

// The shape of one entry in data/projects.js. The data file is edited by hand, so a test runs every entry through this.
export const projectSchema = z.strictObject({
  title: singleLine(3, 120, 'Enter a project title.'),
  slug: slugSchema,
  category: z.enum(PROJECT_CATEGORY_VALUES, { error: 'Choose a category.' }),
  style: z.enum(PROJECT_STYLE_VALUES, { error: 'Choose a style.' }).optional(),
  city: singleLine(2, 80, 'Enter a city.'),
  country: singleLine(2, 80, 'Enter a country.'),
  year: z.number({ error: 'Enter a year.' }).int('Enter a whole year.').min(1990, 'Year must be 1990 or later.').max(2100, 'Year must be 2100 or earlier.').optional(),
  areaSqm: z.number({ error: 'Enter the area.' }).min(1, 'Area must be at least 1.').max(100000, 'Area is too large.'),
  summary: singleLine(10, 280, 'Enter a short summary.'),
  description: multiLine(0, 8000),
  coverImage: imageSchema,
  gallery: z.array(imageSchema).max(LIMITS.GALLERY_MAX, `Use ${LIMITS.GALLERY_MAX} images or fewer.`),
  featured: z.boolean().optional(),
});
