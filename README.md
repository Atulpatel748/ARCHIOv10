# Archió Interior Design Studio website

Multi-page marketing site for Archió, a consultancy-led interior design studio in Dubai.

- `site/`: Next.js 16, SCSS modules, GSAP + Lenis, Three.js hero.
- `docs/`: reference analysis, industry research, brand inventory, design strategy and `06-DECISIONS.md` (why the site is built the way it is: hosting, contact form, fonts, images, hero, Services).
- `design-previews/`: earlier design explorations and screenshot helper.

## Run locally

```bash
cd site
npm ci
npm run dev
```

Then open http://localhost:3000. To validate a production build, set `NEXT_PUBLIC_SITE_URL` to the real public HTTPS domain in the build environment before running `npm run build`. A Vercel production deploy intentionally fails if this variable is missing or not HTTPS, so localhost URLs cannot silently ship into canonical URLs, metadata, sitemap or robots. A local `npm run build` falls back to localhost.

Other commands, all run inside `site/`:

| Command | What it does |
| --- | --- |
| `npm test` | Runs the contact form's server tests (plain Node, no extra library). |
| `npm run lint` | Checks the code style. |
| `npm run typecheck` | Checks the TypeScript types. |
| `npm run build` | Makes the production build. |

## Contact form

Enquiries are emailed over SMTP, the normal way a mailbox (Gmail, Microsoft 365, a hosting company's email) sends mail. Configure all of these in your hosting provider's server environment (never commit actual secrets):

- `NEXT_PUBLIC_SITE_URL`: public HTTPS production origin.
- `SMTP_HOST`: the mail server's name, from your email provider's help pages.
- `SMTP_PORT`: optional, defaults to 587. Port 465 is encrypted from the start; every other port must upgrade to TLS before the password is sent (except `localhost`, for a local mail catcher).
- `SMTP_USER` and `SMTP_PASS`: the mailbox login and password. Gmail and Microsoft 365 want an "app password", not the real one.
- `CONTACT_TO_EMAIL`: inbox receiving enquiries.
- `CONTACT_FROM_EMAIL`: the "From" address; best if it belongs to the same mailbox or domain as `SMTP_USER`, so the mail is less likely to land in spam.

Without all five (host, user, password, to, from), the endpoint returns a controlled error and the form offers WhatsApp/email as a fallback rather than pretending a message was sent. If sending fails, the visitor sees the same fallback, and the cause code (never the settings) is written to the server log. The current rate limiter is per-process only; the intended guard is a Vercel Firewall rate-limit rule on `/api/contact`.

## Before launch

1. Confirm the production domain, registered business/legal name and address, and whether `info@beracahlogistics.com` is the correct public and privacy contact email.
2. Have the business/legal adviser review `/privacy` against the real controller, hosting/email providers, retention practices, cross-border processing and applicable UAE/free-zone requirements. The notice is a draft, not a legal certification.
3. Replace the 800 px placeholder renders under `site/public/images/` with the client's original high-resolution files and confirm image usage rights.
4. Review all `CLIENT TO REVIEW` / `CLIENT TO CONFIRM` notes in `site/src/content/`, including project titles and service/sector copy.
5. Configure a shared rate-limit store and trusted proxy/IP source, plus deployment-level monitoring and email-delivery alerts.
6. Run clean install, lint, typecheck, production build, route smoke tests, accessibility tests and mobile/desktop visual checks on the target deployment.
