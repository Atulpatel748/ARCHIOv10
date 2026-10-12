# Security model

The site has no accounts, no sessions, no cookies, no admin screen and no database. It is static files plus one
serverless function, and the only thing a visitor can send is the contact form. That removes whole classes of risk
(credential theft, session hijacking, CSRF, privilege escalation, injection into a database, stored data leaking),
and what remains is listed here with where it lives and which tests exercise it.

| Area | Control | Code | Tests |
| --- | --- | --- | --- |
| Attack surface | One outbound request, the contact form to Web3Forms. The site has no server code of its own. Projects are part of the build, so nothing can change them over HTTP | `client/src/services/inquiry.service.js`, `shared/data/projects.js` | `inquiry.service.test` |
| Cross-site requests | There are no cookies or tokens for another site to ride on; the Web3Forms key can be restricted to this domain in its dashboard | `client/security-headers.js` | `hosting-config.test` |
| Mass assignment | The form is validated by a strict Zod object; the service sends only a fixed set of fields | `shared/schemas/inquiry.js`, `inquiry.service.js` | `inquiry.service.test`, `shared/tests/schemas` |
| XSS | React escaping, no raw-HTML sinks, tags stripped from all free text, JSON-LD escaped, strict CSP, no inline scripts or styles. The inquiry email is plain text | `shared/schemas/text.js`, `Seo.jsx`, `client/security-headers.js` | `shared/tests`, `Seo.test`, `hosting-config.test`, E2E under the CSP |
| Transport and headers | CSP, HSTS, no-referrer, frame deny, Permissions-Policy, sent by Vercel from `vercel.json` (kept equal to `security-headers.js` by a test) | `client/vercel.json`, `client/security-headers.js` | `hosting-config.test` |
| Abuse limits | Honeypot field (bots get a fake success and nothing is sent); length limits on every field; Web3Forms' own filtering | `inquiry.service.js`, `shared/schemas/inquiry.js` | `inquiry.service.test` |
| Errors and logs | The visitor sees a fixed message; Web3Forms error text is never shown | `client/src/services/api.js` | `api.test` |
| Secrets | None server-side. The Web3Forms access key is public by design (`VITE_WEB3FORMS_ACCESS_KEY`); `.env` is git-ignored | `.env.example` | static scan |
| Data minimisation | Nothing is stored by the site. An inquiry exists only as an email to the studio. No cookies; the only browser storage is the router's scroll position and a "loading screen already shown" flag (session storage, this tab only) | n/a | E2E (`no accounts` spec) |
| Uploads, SSRF, path traversal, process execution | Not applicable by design: no upload endpoint, the function never fetches user URLs, no filesystem paths or shell calls use user input | n/a | n/a |
| Dependencies | Few runtime dependencies; run `npm run audit:deps` before each release | `package-lock.json` | `npm run audit:deps` |

## Residual risks and decisions to review

- **Inquiries live only in email, sent through Web3Forms.** If sending fails the visitor sees an error and can try again,
  but no copy is kept. Web3Forms is a third party that handles the message; the privacy notice should name it (needs
  the lawyer's sign-off). Send a test inquiry after each change to the access key.
- **The access key is public.** It ships in the site's JavaScript, so anyone can send mail to the inbox with it. Restrict
  it to the site's domain in the Web3Forms dashboard.
- **Spam.** The honeypot and Web3Forms' filtering stop simple bots only. If spam becomes a problem, turn on its captcha.
- **Retention.** The privacy notice says inquiries that do not become projects are deleted after 24 months; that now
  means deleting them from the studio inbox.
- **Whoever can push to the repository controls the content.** Protect the main branch and the Vercel project.
