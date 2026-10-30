# 06 — Decisions log

Why the site is built the way it is, so nobody has to guess later. Each entry says what we faced, what we chose, what else we considered and what follows from it. Older decisions on look and brand are in `04-ARCHIO-DESIGN-STRATEGY.md`. Entries are never deleted; if a decision changes, add a new entry that replaces the old one.

## ADR-001: Where the site lives and how it is deployed

- **Status:** Accepted, 28 Oct 2026
- **Context:** The GitHub repository `Atulpatel748/ARCHIOv10` first held a different app (a Vite single-page app with `client/` and `shared/` folders). The new multi-page site is a Next.js app that lives in the `site/` folder of this project.
- **Decision:** `main` now holds the Next.js site. The Vercel project `archio` uses Framework Preset **Next.js** and Root Directory **`site`**, with no build, install or output overrides. The public address is `https://archio-v10.vercel.app`, set as `NEXT_PUBLIC_SITE_URL` for production and preview (a production build refuses to start without it).
- **Alternatives:** Keep the Vite app (the new site would not run on it). Move the contents of `site/` to the repository root (loses `docs/` and `design-previews/` next to the code).
- **Consequences:** The old Vite app is only in git history (the last commit before the change is `1d630bd`). Vercel can roll back to any earlier deployment in one click. On 28 Oct 2026 the full local history was joined to GitHub `main` with a merge that changed no files (commit `ca5f3bb`), so work is now pushed straight from this folder. The tag `live-2026-10-28` marks the version that was live that day. GitHub Actions (`.github/workflows/ci.yml`) runs types, lint, tests, build and the dependency audit on every push and pull request; Vercel still deploys on its own.

## ADR-002: How the contact form sends enquiries

- **Status:** Accepted, changed on 28 Oct 2026 (Resend replaced by SMTP); delivery not yet switched on
- **Context:** The form needs to reach the studio's inbox without a database, accounts or tracking.
- **Decision:** A single server route (`site/src/app/api/contact/route.ts`) checks the input (JSON only, 16 KB limit, field rules, consent, a hidden "company" field that bots fill), then emails the studio over SMTP with the `nodemailer` library (`site/src/lib/mailer.ts`; no dependencies of its own, no install scripts, MIT-0 licence). The field rules live in one file (`site/src/content/contact.ts`) that the form and the route both read. Twenty tests (`npm test`, plain Node) cover the route, the settings check and one real send to a small fake mail server that runs inside the test.
- **Alternatives:** Resend (the first choice: it needs an account and DNS records on the studio's domain, which we do not know the studio controls); Web3Forms (what the previous site used; the key is still in Vercel); a mail link only; a database. SMTP was chosen on 28 Oct 2026 at the owner's request, because it can use a mailbox the studio already has.
- **Consequences:** Until `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, `CONTACT_TO_EMAIL` and `CONTACT_FROM_EMAIL` are set (`SMTP_PORT` defaults to 587), the route answers 503 and visitors see a message with the WhatsApp and email links. The built-in spam limit (5 per 10 minutes per address) lives in each server instance's memory, so it is weak on Vercel; the intended guard is a Vercel Firewall rate-limit rule on `/api/contact`, to be added by the owner in the dashboard. Passwords for the mailbox live only in the hosting settings. Ports other than 465 must upgrade to TLS before the password is sent. Open: the owner must supply the mailbox settings and set them in Vercel.

## ADR-003: Display type

- **Status:** Accepted
- **Context:** The brand kit names Optima, which is not licensed for the web. It names Public Sans and Lora for interface and body text.
- **Decision:** Belleza stands in for Optima (headings). Public Sans and Lora are used as the kit says. All three are self-hosted through `next/font`.
- **Consequences:** If the studio buys an Optima web licence, only the display font in `site/src/app/layout.tsx` changes. The fonts load the Latin character set only (no "latin-ext"): on 28 Oct 2026 an audit found three preloaded Latin Extended files (about 38 KB) that no page used, because every page is English. If copy with letters such as ł, č or ő is ever added, put `latin-ext` back in the three font lines.

## ADR-004: How project images are shown

- **Status:** Accepted
- **Context:** The only images are renders from the company profile (at most 800 px wide). They are design visualisations, not photographs of finished work.
- **Decision:** Images are described as design visualisations and never as completed builds. The three landing-page hero images were extended to 16:9 with Canva's image tool (the owner approved uploading the three renders to Canva on 28 Oct 2026). They are stored in four sizes (640, 1080, 1920, 2560 px) in `site/public/images/hero/`. The 2560 size is stretched from 1920.
- **Alternatives:** Crop the near-square renders to fill a wide screen (cut off the bottom of each room); show the whole picture with blurred bars at the sides (rejected on wide screens, see ADR-005).
- **Consequences:** The extended sides of the hero images are made by AI, not part of the original renders. The client should be asked for real 16:9 renders at 2400 px or more. Nothing about the images may suggest they show finished projects.

## ADR-005: Hero fitting and when the WebGL transition runs

- **Status:** Accepted, 28 Oct 2026
- **Context:** On a 1903 × 938 browser window (wider than 16:9) the first version, which showed the whole picture, left dark bars on both sides. The owner wanted the picture to fill the screen.
- **Decision:** The hero photo fills the screen. Only on very wide screens (more than 1.35 times the photo's width-to-height ratio, about 21:9) is the whole photo shown with a blurred, dimmed copy filling the sides. The WebGL slide transition (`three.js`) is skipped on phones (767 px and narrower), for data-saver users and for reduced motion; they get a plain crossfade.
- **Consequences:** On normal desktops a thin strip of the top and bottom of each photo may be cut. Phones do not download `three.js`. The WebGL layer must load the same hero files as the plain slides.

## ADR-006: The Services page stays calm

- **Status:** Accepted
- **Context:** Six motion-heavy designs for the services stages and the "Spaces we design" list were tried and rejected by the owner.
- **Decision:** Three full-width bands (one per stage, with a render and two services each, sides alternating) and a quiet four-row list of spaces. No scroll tricks, hover trails or cursor effects on this page.
- **Consequences:** Three image-and-text bands in a row would break a "no more than two" layout rule in some design guides. That rule is overridden here on purpose; the owner chose this design.

## ADR-007: Photos are resized ahead of time, not on request

- **Status:** Accepted, 30 Oct 2026
- **Context:** A load check found that every visit used Vercel's image resizer (`/_next/image`): about 57 resized images for a visit to the home page, the projects page and one project page, 38 of them on `/projects` alone. Vercel's free (Hobby) plan allows 300,000 resized-image reads a month, so the site would hit that limit at roughly 5,000 full visits a month, and Vercel then usually blocks the feature until 30 days have passed.
- **Decision:** `npm run images` (`site/scripts/resize-images.mjs`) makes every photo in `public/images` once in six widths (256, 384, 640, 828, 1080, 1920 px, never wider than the original, WebP quality 70), and one site-wide loader (`site/src/lib/imageLoader.ts`, set in `next.config.ts`) points each `<Image>` at the right copy. The hero keeps its own sizes and loader. A test fails if a photo is missing any copy.
- **Alternatives:** Keep Vercel's resizer and move to a paid plan (still needed for commercial use, see below, but the resizer would still count reads); serve the originals unresized (1,878 to 2,400 px, about 280 KB each: far too heavy on phones).
- **Consequences:** No resizing requests at all. Measured on a local build, every page is the same weight or lighter than before (home on a phone 773 to 727 KB, `/projects` 1,100 to 1,083 KB, a project page 638 to 622 KB, `/services` 420 to 414 KB). The repository holds 198 extra image files (about 8 MB). Whoever adds or replaces a photo must run `npm run images` and commit the copies; `npm test` catches a missing one. The largest copy is 1,920 px, so the full-screen viewer on a very large, sharp screen shows a slightly softer picture than before. Vercel's rules also say the free plan is for "non-commercial personal use only", so a studio website needs the paid Pro plan whatever the image setup.
