# Archió Interior Design Studio: website

Multi-page marketing site for Archió, a consultancy-led interior design studio in Dubai.

- `site/`: the website (Next.js 16, SCSS modules, GSAP + Lenis, Three.js for the hero slider)
- `docs/`: research, reference analysis, brand inventory, design strategy and screenshots
- `design-previews/`: earlier design explorations and the screenshot/check script

## Run locally

```bash
npm --prefix site install
npm --prefix site run build
npm --prefix site run start
```

Then open http://localhost:3000.

## Contact form

Enquiries are emailed through [Resend](https://resend.com). Set these environment variables (never commit them):

- `RESEND_API_KEY`
- `CONTACT_TO_EMAIL`: inbox that receives enquiries
- `CONTACT_FROM_EMAIL` (optional): a verified sender
- `NEXT_PUBLIC_SITE_URL`: production URL, used for SEO metadata and the sitemap

Without them the form validates input and shows a WhatsApp/email fallback instead of sending.

## Before launch

- Replace the 800 px placeholder renders in `site/public/images/` with the client's original high-resolution files.
- Review lines marked `CLIENT TO REVIEW` / `CLIENT TO CONFIRM` in `site/src/content/`.
