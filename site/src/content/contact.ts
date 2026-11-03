// The enquiry form's rules, shared by the form (for instant feedback) and the API route (the real check).
export const TYPES = ['Residential', 'Commercial', 'Mixed-use', 'Landscape'];
// The email becomes the reply-to address, so characters that would let one field hold several addresses or a display name
// (, ; < > ") are refused along with spaces; so are ( ) \ because mail parsers read (...) as a comment, : because the
// mail sender reads "x:a@b.c" as an address group, and [ ] because no real enquiry needs a [1.2.3.4] address.
export const isValidContact = (v: string) => /^[^\s@,;<>"()\\:[\]]+@[^\s@,;<>"()\\:[\]]+\.[^\s@,;<>"()\\:[\]]+$/.test(v) || /^\+?[\d\s()-]{7,20}$/.test(v);

// The automatic confirmation sent to a visitor who gave an email (only when CONTACT_AUTOREPLY=on). It repeats nothing they typed.
// CLIENT TO REVIEW
export const AUTOREPLY = {
  subject: 'Your enquiry to Archió',
  paragraphs: [
    'Thank you for contacting Archió. This automatic message confirms that your enquiry reached our studio.',
    'If you want to add anything, reply to this email.',
    'If you did not send an enquiry through our website, please ignore this message.',
  ],
};
