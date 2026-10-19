import { GENERIC_ERROR_MESSAGE } from '../constants/messages.js';
import { SITE } from '../constants/site.js';
import {
  BUDGET_RANGES, INQUIRY_PROJECT_TYPES, PROPERTY_TYPES, TIMELINES, labelFor,
} from '../schemas/index.js';

// The form is emailed to the studio by Web3Forms. Its access key is public by design (it only lets a page send mail
// to the one inbox it was created for), so it is baked into the build; restrict it to this domain in the Web3Forms
// dashboard. Either name works in .env or on Vercel, because both have been documented.
const ENDPOINT = 'https://api.web3forms.com/submit';
const TIMEOUT_MS = 15_000;

const accessKey = () => {
  const key = import.meta.env.WEB3FORMS_ACCESS_KEY || import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;
  return key && !key.startsWith('YOUR_') ? key : '';
};

const sent = { ok: true };
// The message is written for the visitor and shown as it is.
const failed = (message) => ({ ok: false, message });

// One POST to Web3Forms. It answers success: false when it refuses the message (for example a key restricted to another
// domain); that and any HTTP error are a generic failure, a dead connection or a slow one get their own wording. A slow
// one is an unknown, not a failure: the message may already have arrived, so it does not invite a resend (which would
// email the studio twice) but gives the address to follow up on.
async function post(payload) {
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => { timedOut = true; controller.abort(); }, TIMEOUT_MS);
  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const result = await response.json().catch(() => null);
    return response.ok && result?.success !== false ? sent : failed(GENERIC_ERROR_MESSAGE);
  } catch {
    return failed(timedOut
      ? `We could not confirm your request was sent. If you do not hear from us within a working day, please email us at ${SITE.email}.`
      : 'We could not reach the server. Check your connection and try again.');
  } finally {
    clearTimeout(timer);
  }
}

export const inquiryService = {
  /** Sends an inquiry. Resolves { ok: true } or { ok: false, message } and never rejects for a failure to send. */
  create: async ({ website, consent, areaSqm, ...inquiry }) => {
    if (website) return sent; // a bot filled the hidden field: pretend it worked, send nothing
    const key = accessKey();
    // A build without a key can never deliver mail; say so (and give another way in) instead of failing at Web3Forms.
    if (!key) return failed(`The contact form is not available right now. Please email us at ${SITE.email}.`);
    return post({
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
  },
};
