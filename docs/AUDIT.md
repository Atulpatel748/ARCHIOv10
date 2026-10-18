# Audit, October 2026

A full pass over the site (code, security, dependencies, accessibility, SEO, performance, assets, licensing), with the
fixes made and what is left for the studio to decide. Everything below was checked on this repository; nothing here is
legal advice.

## Stack found

Static React 19 site (Vite 8, React Router 8, plain CSS), npm workspaces `client/` and `shared/`, hosted on Vercel.
The contact form posts to Web3Forms. There is no server, database, sign-in or admin screen any more (README: "Upgrading
from the version with the Express API and MongoDB"), so the backend, database and admin checks do not apply; the old
`/admin` and `/login` addresses show "Not found" (an e2e test covers this).

## How it was checked

| Check | Before | After |
| --- | --- | --- |
| `npm test` (shared, client) | 11 and 143 passed | 11 and 148 passed |
| `npm run typecheck -w client` | clean | clean |
| `npm run build` | builds | builds |
| `npm run test:e2e` (Playwright, desktop and phone, axe WCAG 2.2 AA) | 72 passed, 2 skipped by design | 76 passed, 2 skipped by design |
| `npm audit --audit-level=moderate` | 0 vulnerabilities | 0 vulnerabilities |
| Browser sweep: 15 addresses at 320, 375, 390, 414, 768, 1024, 1280, 1440 and 1920px | see fixes | no horizontal overflow, clipped or off-screen elements, broken or distorted images, targets under 24px, CSP violations, script errors or failed requests |
| Element positions, original build against fixed build, 12 addresses at the same nine widths | | only the intended changes below moved anything |

The "after" results come from the packaged project itself: unzipped into an empty folder, `npm ci` on Node 24.21, then
every command above.

Lighthouse on the local preview (mobile emulation, headless Chromium, indicative only): accessibility, best practices and
SEO 100 on the home, projects, project and contact pages; performance 71 on the home page and 93 to 95 on the others. The
home page's blocking time is dominated by the WebGL hero running in software in headless Chromium; re-measure on a real
phone (PageSpeed Insights) after deploying.

## Fixes made

**Code**
- The root route had no error boundary: a crash in the header, footer or layout showed React Router's built-in screen,
  which prints the error message and stack trace. It now shows the site's own error page (`routes/index.jsx`, `routes.test.jsx`).
- `Button`: a caller passing `disabled={false}` re-enabled the button while it was loading (`Button.test.jsx`).
- A project title set on two lines read "Dubai MarinaResidence" as text (copy, reader view, crawlers), and its lines were
  keyed by their text. Fixed and tested.

**Layout and responsive**
- On a home or project address without its photo (an unknown project, `/projects/` with a trailing slash, a page that
  failed to load) the header still pulled the page up behind itself, so the title sat under the header (hidden on phones).
- Footer from 900 to 1279px: five columns squeezed the email address until it broke mid-word ("…logistic / s.com") and
  wrapped the legal links. Brand and contact now share the first row with the link columns under them; all five sit on
  one row from 1280px, where the contact column never gets narrower than the address.
- About page lists: the base reset for classed lists overrode their indent, so the bullets sat in the page margin and
  were clipped at the edge of a 320px screen.
- Without JavaScript the loading screen never left and hid the `<noscript>` note; it is now hidden when scripting is off,
  and the note's address is a mailto link.

**Typography**
- The eyebrow label in the About write-ups rendered in Lora; labels are Public Sans everywhere else (DESIGN.md).
- Form hints used a one-off 13px size; they now use the scale's small size.

**Accessibility**
- From 1024px the Tab order (logo, then the links on its left) did not follow the bar as it reads (WCAG 2.4.3). The
  links now come first in the source; the layout is unchanged.

**Security**
- The delivered archive contained `.env.local` with a Vercel CLI token (expired 2026-10-12) and `.vercel/project.json`.
  Both are git-ignored and are left out of the cleaned package, with the machine-local tooling (`.claude/skills/impeccable`,
  which includes a Windows executable, `.claude/agents`, `.claude/settings.local.json`, `.impeccable/`).

**SEO**
- `index.html` declared a canonical link to the home page, which every address shares, so the raw HTML of each inner page
  named the home page as its canonical. Removed; `Seo.jsx` sets the right one per page (unit test).
- The Organization JSON-LD logo was 90 × 88px; Google asks for at least 112px. It now points at the 180px submark.

**Dependencies**
- `engines.node` said `>=20.19.0`, but React Router 8 needs Node 22.22+ and the test tools (Vitest 5, jsdom 30) need
  `^22.22.2 || ^24.15.0 || >=26`. Corrected here and in the README. No packages were added, removed or upgraded: all are
  used, the lockfile resolves only from registry.npmjs.org with integrity hashes, and audit is clean.

**Licensing**
- The hero shader's `permute()`/`snoise()` are Ashima Arts' MIT-licensed webgl-noise; the attribution is now in the code.
- Checked: Public Sans, Marcellus and Lora are OFL-1.1 (Fontsource); React, React Router, Zod and Lenis are MIT; GSAP is
  under its own "Standard no-charge" licence.

**Clean-up**
- Removed CSS for the old staggered project grid and other unused rules, merged duplicate rules, replaced a hard-coded
  colour with its token, dropped unused `image` fields from `HOME_CATEGORIES`, removed a stray VS Code task, and brought
  README, DESIGN.md and ARCHITECTURE.md back in line with the site (no density toggle, no clock, no film hero).

## Left for the studio

| What | Why it is not fixed here | What to do |
| --- | --- | --- |
| Contact details: the address is `info@beracahlogistics.com` for a unit of Beracah Trading, and the trade licence number is empty (`site.js` says to update both before launch) | Business facts | Confirm both in `client/src/constants/site.js`; the email also appears in the `<noscript>` line of `client/index.html` |
| Web3Forms key and `VITE_SITE_URL` | Deployment settings, not code | Set both on Vercel, restrict the key to the site's domain, redeploy and send a test inquiry |
| Privacy notice is draft: it does not name Web3Forms as a processor and promises a 24-month deletion | Legal copy needs sign-off (DESIGN.md) | Have it reviewed by a qualified professional |
| Rights to confirm: where `morph-gallery.tsx` came from (no source recorded), the preloader background photo, the project renders (two JLT renders show a placeholder "LOGO"), consent for the team portraits, and how closely the layout follows the reference studio site named in the README | Ownership cannot be determined from the files | Confirm with the owners; replace anything that cannot be cleared |
| Photos are 626 to 800px wide, soft on large and high-density screens | Larger originals are needed | Supply 1600 to 2400px originals and run `npm run images` (see README) |
| Client-rendered site: crawlers that do not run JavaScript see only the default share tags, and unknown addresses answer HTTP 200 (marked noindex in the page) | Needs pre-rendering or server rendering, an architecture change | Consider pre-rendering the routes if search or share previews matter |
| Vercel deployment not verified from here | No access to the project | After deploying, check the headers, `content-type: image/avif` on a photo, and the form |
| The page hides the scrollbar | A deliberate design choice (base.css) | Reconsider for mouse users who drag the scrollbar |
