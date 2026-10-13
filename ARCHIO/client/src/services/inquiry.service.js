import {
  BUDGET_RANGES, INQUIRY_PROJECT_TYPES, PROPERTY_TYPES, TIMELINES, labelFor,
} from '../schemas/index.js';
import { SITE } from '../constants/site.js';
import { ApiError, api } from './api.js';

// The form is emailed to the studio by Web3Forms. Its access key is public by design (it only lets a page send mail
// to the one inbox it was created for), so it is baked into the build; restrict it to this domain in the Web3Forms
// dashboard. Either name works in .env or on Vercel, because both have been documented.
const ENDPOINT = 'https://api.web3forms.com/submit';

const accessKey = () => {
  const key = import.meta.env.WEB3FORMS_ACCESS_KEY || import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;
  return key && !key.startsWith('YOUR_') ? key : '';
};

export const inquiryService = {
  create: async ({ website, consent, areaSqm, ...inquiry }) => {
    if (website) return { success: true }; // a bot filled the hidden field: pretend it worked, send nothing
    const key = accessKey();
    if (!key) {
      // A build without a key can never deliver mail; say so (and give another way in) instead of failing at Web3Forms.
      throw new ApiError({ code: 'NOT_CONFIGURED', message: `The contact form is not available right now. Please email us at ${SITE.email}.` });
    }
    const result = await api.post(ENDPOINT, {
      access_key: key,
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
    // Web3Forms answers with success: false when it refuses the message (for example a key restricted to another domain).
    if (result?.success === false) throw new ApiError({ code: 'REJECTED' });
    return result;
  },
};
