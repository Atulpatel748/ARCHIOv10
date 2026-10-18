# Security model

The site has no user accounts, server-side sessions, authentication cookies, admin screen or first-party inquiry database. It is static files with no server code, and the only visitor submission is the contact form. This reduces application-side attack surface, but the Web3Forms account, studio inbox and email provider still need access controls and retention. Remaining risks and checks are listed below.

| Area | Control | Code | Tests |
| --- | --- | --- | --- |
| Attack surface | One outbound request, the contact form to Web3Forms. The site has no server code of its own. Projects are part of the build, so nothing can change them over HTTP | `client/src/services/inquiry.service.js`, `shared/data/projects.js` | `inquiry.service.test` |
| Cross-site requests | The form uses a browser fetch without credentialed cross-origin cookies; the Web3Forms access key can be restricted to the production domain in its dashboard | `client/src/services/inquiry.service.js`, `client/vercel.json` | `hosting-config.test` |
| Mass assignment | The form is validated by a strict Zod object; the service sends only a fixed set of fields | `shared/schemas/inquiry.js`, `inquiry.service.js` | `inquiry.service.test`, `shared/tests/schemas` |
| XSS | React escaping, no raw-HTML sinks, tags stripped from all free text, JSON-LD escaped, strict CSP, no inline scripts or styles. The inquiry email is plain text | `shared/schemas/text.js`, `Seo.jsx`, `client/vercel.json` | `shared/tests`, `Seo.test`, `hosting-config.test`, E2E under the CSP |
| Transport and headers | CSP, HSTS, no-referrer, frame deny, Permissions-Policy, sent by Vercel from `vercel.json`; the preview server and the tests read the same file, so there is one definition | `client/vercel.json`, `client/vite.config.js` | `hosting-config.test` |
| Abuse limits | Honeypot field (bots get a fake success and nothing is sent); length limits on every field; Web3Forms' own filtering | `inquiry.service.js`, `shared/schemas/inquiry.js` | `inquiry.service.test` |
| Errors and logs | The visitor sees a fixed message; Web3Forms error text is never shown. A crash anywhere in the app, the layout included, shows the site's own error page, never React Router's default screen with the stack trace | `client/src/services/inquiry.service.js`, `client/src/hooks/useForm.js`, `client/src/routes/index.jsx` | `inquiry.service.test`, `InquiryForm.test`, `routes.test` |
| Secrets | None server-side. The Web3Forms access key is public by design (`WEB3FORMS_ACCESS_KEY` or `VITE_WEB3FORMS_ACCESS_KEY`); `.env`, `.env.local` (which may contain a Vercel OIDC token) and `.vercel/` are git-ignored and must not be copied into archives shared outside the team. Revoke any active token if one was shared | `.env.example`, `.gitignore` | static scan |
| Data minimisation | No inquiry database is maintained by the site. Inquiries pass to Web3Forms and the studio email. Application code does not intentionally set cookies; deliberate browser storage is limited to session storage for scroll position, loading-screen state and a reload-loop guard | n/a | E2E (`no accounts` spec) |
| Uploads, SSRF, path traversal, process execution | Not applicable by design: no upload endpoint, no server code fetches user URLs, no filesystem paths or shell calls use user input | n/a | n/a |
| Dependencies | Few runtime dependencies; run `npm run audit:deps` before each release | `package-lock.json` | `npm run audit:deps` |

## Residual risks and decisions to review

- **Inquiries live only in email, sent through Web3Forms.** If sending fails the visitor sees an error and can try again,
  but the website does not keep its own copy. The Privacy notice identifies Web3Forms as the delivery provider; legal review
  of the provider relationship and disclosures is still required. Send a test inquiry after each access-key change.
- **The access key is public.** It ships in the site's JavaScript, so anyone can send mail to the inbox with it. Restrict
  it to the site's domain in the Web3Forms dashboard.
- **Spam.** The honeypot and Web3Forms' filtering stop simple bots only. If spam becomes a problem, turn on its captcha.
- **Retention.** The static site has no inquiry database or automated deletion job. The privacy notice therefore does not
  promise a fixed period. The studio must approve a documented retention schedule and apply it to its inbox, exports, and
  any backups or copies it controls.
- **Whoever can push to the repository controls the content.** Protect the main branch and the Vercel project.
