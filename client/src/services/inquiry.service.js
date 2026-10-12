import {
  BUDGET_RANGES, INQUIRY_PROJECT_TYPES, PROPERTY_TYPES, TIMELINES, labelFor,
} from '../schemas/index.js';
import { api } from './api.js';

// The form is emailed to the studio by Web3Forms. Its access key is public by design (it only lets a page send mail
// to the one inbox it was created for), so it is a VITE_ variable; restrict it to this domain in the Web3Forms dashboard.
const ENDPOINT = 'https://api.web3forms.com/submit';

export const inquiryService = {
  create: async ({ website, consent, areaSqm, ...inquiry }) => {
    if (website) return { success: true }; // a bot filled the hidden field: pretend it worked, send nothing
    return api.post(ENDPOINT, {
      access_key: import.meta.env.VITE_WEB3FORMS_ACCESS_KEY,
      subject: `New inquiry: ${labelFor(INQUIRY_PROJECT_TYPES, inquiry.projectType)}`,
      from_name: 'Archió website',
      name: inquiry.name,
      email: inquiry.email,
      phone: inquiry.phone ?? '-',
      city: inquiry.city ?? '-',
      needs: labelFor(INQUIRY_PROJECT_TYPES, inquiry.projectType),
      property: `${labelFor(PROPERTY_TYPES, inquiry.propertyType)}${areaSqm ? `, ${areaSqm} sqm` : ''}`,
      budget: labelFor(BUDGET_RANGES, inquiry.budgetRange),
      timeline: labelFor(TIMELINES, inquiry.timeline),
      message: inquiry.message,
    });
  },
};
