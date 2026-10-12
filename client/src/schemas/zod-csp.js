import { config } from 'zod';

// The site's Content-Security-Policy does not allow eval (script-src 'self', no 'unsafe-eval'). Zod 4 otherwise
// tries `new Function` to compile faster validators; the browser blocks the attempt and reports a CSP violation on
// every page with a form. Validation behaves the same without it, so switch it off rather than loosen the policy.
// Zod reads this when each schema is created, so it lives in its own module that index.js imports before the
// schemas. The server is not under the CSP and keeps the compiled path.
config({ jitless: true });
