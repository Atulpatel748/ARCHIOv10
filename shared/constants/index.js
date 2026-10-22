const option = (value, label) => Object.freeze({ value, label });
const values = (options) => options.map((o) => o.value);

export const PROJECT_CATEGORIES = [
  option('residential', 'Residential'),
  option('commercial', 'Commercial'),
  option('landscape', 'Landscape'),
];
export const PROJECT_CATEGORY_VALUES = values(PROJECT_CATEGORIES);

export const PROJECT_STYLES = [
  option('minimal', 'Minimal'),
  option('contemporary', 'Contemporary'),
  option('scandinavian', 'Scandinavian'),
  option('japandi', 'Japandi'),
  option('industrial', 'Industrial'),
  option('classic', 'Classic'),
];
export const PROJECT_STYLE_VALUES = values(PROJECT_STYLES);

export const INQUIRY_PROJECT_TYPES = [
  option('residential', 'Residential interior'),
  option('commercial', 'Commercial interior'),
  option('landscape', 'Landscape design'),
  option('consultation', 'Interior design consultation'),
  option('not_sure', "I'm not sure yet"),
];
export const INQUIRY_PROJECT_TYPE_VALUES = values(INQUIRY_PROJECT_TYPES);

export const PROPERTY_TYPES = [
  option('apartment', 'Apartment'),
  option('house', 'Villa or house'),
  option('office', 'Office'),
  option('retail', 'Retail or showroom'),
  option('mixed_use', 'Mixed-use'),
  option('other', 'Other'),
];
export const PROPERTY_TYPE_VALUES = values(PROPERTY_TYPES);

export const BUDGET_RANGES = [
  option('under_100k', 'Under 100,000 AED'),
  option('100k_250k', '100,000 to 250,000 AED'),
  option('250k_500k', '250,000 to 500,000 AED'),
  option('500k_1m', '500,000 to 1,000,000 AED'),
  option('1m_plus', 'Over 1,000,000 AED'),
  option('not_sure', 'Not sure yet'),
];
export const BUDGET_RANGE_VALUES = values(BUDGET_RANGES);

export const TIMELINES = [
  option('asap', 'As soon as possible'),
  option('1_3_months', 'In 1 to 3 months'),
  option('3_6_months', 'In 3 to 6 months'),
  option('6_plus_months', 'In more than 6 months'),
  option('planning', 'Still planning'),
];
export const TIMELINE_VALUES = values(TIMELINES);

export const LIMITS = Object.freeze({
  PAGE_MAX: 500,
  GALLERY_MAX: 12,
  MESSAGE_MIN: 20,
  MESSAGE_MAX: 2000,
  SEARCH_MAX: 60,
});

export const labelFor = (options, value) => options.find((o) => o.value === value)?.label ?? value;
