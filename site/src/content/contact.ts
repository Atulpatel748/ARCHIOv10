// The enquiry form's rules, shared by the form (for instant feedback) and the API route (the real check).
export const TYPES = ['Residential', 'Commercial', 'Mixed-use', 'Landscape'];
// The email becomes the reply-to address, so characters that would let one field hold several addresses or a display name
// (, ; < > ") are refused along with spaces.
export const isValidContact = (v: string) => /^[^\s@,;<>"]+@[^\s@,;<>"]+\.[^\s@,;<>"]+$/.test(v) || /^\+?[\d\s()-]{7,20}$/.test(v);
