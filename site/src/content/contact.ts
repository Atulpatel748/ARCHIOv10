// The enquiry form's rules, shared by the form (for instant feedback) and the API route (the real check).
export const TYPES = ['Residential', 'Commercial', 'Mixed-use', 'Landscape'];
export const isValidContact = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || /^\+?[\d\s()-]{7,20}$/.test(v);
