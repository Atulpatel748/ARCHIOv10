# Archió

Website for Archió, an interior design studio in Dubai (a unit of Beracah Trading), built
as a static React 19 site (Vite) hosted on Vercel; the contact form posts straight to Web3Forms, so there is no server code. Its structure,
typography and interaction patterns are derived from the layout of the reference site (`yodezeen.com`). The
copy, team, contact details and project images come from the Archió company profile.

There are no user accounts, no sign-in, no admin screen and no database. The portfolio is a file in the repository
(`shared/data/projects.js`, see "Content") built into the site, and the only thing visitors can send is the contact form,
which is emailed to the studio through Web3Forms.

> **Before launch.** The privacy notice is draft text and must be reviewed by a qualified
> professional (open points: the notice promises a 24-month deletion of old inquiries that nothing
> performs yet, and the cookie policy now states that the site sets no cookies, which should be confirmed).
> Project titles are derived from the profile's locations because it gives no names, and year and
> style are left unset because it gives none. Confirm the images are yours to publish, and replace
> the two reception renders that show a placeholder "LOGO" if you prefer. The hero gallery
> (`client/src/components/ui/morph-gallery.tsx`) names no source or licence; confirm where it came from
> before launch. GSAP ships under its own "Standard no-charge" licence (gsap.com/standard-license), not MIT.

## Content

| What | Where |
| --- | --- |
| Studio name, email, phone, Instagram, parent company | `client/src/constants/site.js` (the email is also written once in the `<noscript>` line of `client/index.html`) |
| About, team, services, approach, vision, mission, philosophy | `client/src/constants/content.js` |
| Logo, favicon, social share image | `client/public/brand/`, `client/public/og-image.png` |
| Team portraits | `client/public/images/team/` |
| Projects (text, areas, image order and alt text) | `shared/data/projects.js` (below); images in `client/public/images/projects/<slug>/NN.jpg` (`01.jpg` is the cover) or any https:// address |
| Inquiry options (project type, budget bands in AED, timeline) | `shared/constants/index.js` |
| First image on the home page | Nothing to edit: it is the first featured project's cover in `shared/data/projects.js`. `client/public/preloader-gate.js` preloads it (the build fills in its `__HERO_PHOTO__` placeholder from `client/hero-photo.js`) |

**Managing projects.** Edit `shared/data/projects.js` (the steps are in the comment at its top), run `npm test`, and
redeploy. `npm test` checks every entry against the project schema and that each photo exists, so a mistake fails there
instead of on the site. Projects show in the order of the file, and the first `featured: true` ones appear on the home
page. The sitemap is written from the same file at build time. Year and style are optional. Areas are stored in
square metres and shown in both m² and sq ft. The logo is the brand kit's ARCHIÓ wordmark
(`client/public/brand/wordmark.webp`, taken from `Archio Logobrand kit.pdf`, used as a CSS mask so it takes the text
colour); the round submark is used only for the loading screen (`client/public/brand/logo-mark.png`), the favicon
(`favicon-32.png`) and, on beige, the home-screen icon and search results (`apple-touch-icon.png`, 180px, because Google
asks for a logo of at least 112px). An SVG of the wordmark from the designer would be sharper still at very large sizes.

**Fonts.** Public Sans for all text, Marcellus for display headings and Lora for the long-form write-ups (project
descriptions, the About page), all self-hosted through Fontsource and licensed OFL. The brand kit's primary font is
Optima, which needs a paid web licence (Monotype), so it is not served: headings use it only on devices that already have
it (Apple's: iPhone, iPad, Mac) and Marcellus everywhere else (see `--font-serif` in `client/src/styles/tokens.css`).

**Home page speed.** Three things make the home page load faster, and each is measured (Lighthouse, mobile).
The home page ships in the main script instead of a separate download. The portfolio is built into the site, so no page waits for a request. The hero
image is preloaded on the home page only, by `client/public/preloader-gate.js`, so no other page pays for it. Always audit a production build
(`npm run build`, then `npm run preview -w client`), never `npm run dev`, which scores far lower.

**Photos are served as AVIF.** Every photo in `client/public/images` exists twice: the `.jpg` you supplied and a
`.avif` made from it, about 70 percent smaller. `components/common/Picture.jsx` offers the AVIF first and keeps the
JPEG as the fallback. In a local Lighthouse run this cut the home page from 518 KiB to 319 KiB; it is the fix
aimed at Lighthouse's "Improve image delivery" opportunity (re-run Lighthouse on a production build to confirm). The hero preload therefore names the `.avif`.

*Adding photos.* Put the `.jpg` in the right folder, then run `npm run images`. It only converts what is new or
changed (`-- --force` redoes everything). **Supply the largest original you have**: the supplied photos are 707 to 800px
wide, which is soft on large and high-density screens (a phone shows each photo at about 1100 device pixels, the home
hero at up to 2.7 times its size). For a photo wider than 800px the script also writes smaller steps
(`NN-800.avif`, `-1200`, `-1600`, `-2400`, never an enlarged copy) and lists them in `client/src/generated/image-widths.json`;
`Picture` then offers them as a `srcset` and the hero asks for a size as wide as the screen. Aim for 2400px on the hero
covers and 1600px on gallery photos. When a hero photo gets several sizes, a test fails until `client/hero-photo.js` picks a size by screen width. A test fails if any `.jpg` is missing its `.avif`, so this cannot be
forgotten. Quality is the `QUALITY` constant in `client/scripts/make-avif.mjs` (50: smaller files, very slightly
softer fine texture; raise it towards 65 for more detail). A photo given as an outside web address in the data file
has no AVIF twin and are shown as they are. Your web server must send `.avif` as `image/avif`. An end-to-end test checks this
against the local preview server; the Vercel setup is untested, so after deploying run
`curl -I https://your-site/images/projects/dubai-marina-residence/01.avif` and look for `content-type: image/avif`.

**Upgrading from the version with the Express API and MongoDB.** Nothing reads the database any more. Before you shut
it down, check that every project it holds is in `shared/data/projects.js`, and export the stored inquiries if you
want to keep them (new ones only arrive by email). The old server settings (`PORT`, `MONGODB_URI`, `CLIENT_URL`,
`CORS_ORIGIN`, `TRUST_PROXY_HOPS`, `LOG_LEVEL`, `MONGO_*`) are ignored if left in `.env`.

## Features

- **Public site**: home (full-screen photo gallery hero, approach, selected projects, the pinned "We design"
  category list, closing call to action), projects (category filter, literal text search, pagination,
  URL-driven state), project detail with gallery and related work,
  services, about (team, vision, mission, philosophy), contact (three-step inquiry form), privacy
  notice, terms and cookie policy.
- **Contact**: three-step inquiry form; each request is emailed to the studio inbox (nothing is stored on the site).
  No accounts and no cookies; the browser keeps only the router's scroll position for the Back button and a note that the tab has already shown the loading screen (session storage, this tab only).
- **Platform**: sitemap, robots.txt, per-page titles/meta/canonical/Open Graph, JSON-LD,
  keyboard-first UI, reduced-motion support, strict CSP for the static site.

## Stack

| Layer | Choice |
| --- | --- |
| Client | React 19, Vite 8, React Router 8, plain CSS with design tokens, self-hosted Public Sans, Marcellus and Lora fonts |
| Contact form | Zod 4 (schema shared with the form), sent from the browser to Web3Forms, which emails the studio |
| Hosting | Vercel (static files from `client/dist`) |
| Tests | Vitest, Testing Library, Playwright, axe-core |

## Repository layout

```
client/      React + Vite single-page app (components, pages, hooks, services, styles)
shared/      Zod schemas and constants used by the site, and the portfolio (data/projects.js)
e2e/         Playwright specs (public, inquiry, accessibility)
docs/        ARCHITECTURE.md, SECURITY.md, AUDIT.md (the October 2026 audit: fixes made, open items)
```

## Getting started

Requirements: Node 22.22.2+ or 24.15+ (see `.nvmrc`; React Router 8 needs 22.22+, and the test tools need 22.22.2+),
npm 10+.

```bash
npm install
cp .env.example .env        # review the values, see below
npm run dev                 # the site on :5173
```

`npm run dev` serves the whole site. The contact form needs a Web3Forms access key in `.env` (see below); without a real
one it shows its error message.

## Environment variables

`VITE_*` variables and the Web3Forms key are **public** (they ship to the browser and are fixed at build time). On Vercel set it under
Project Settings > Environment Variables, then redeploy.

| Variable | Purpose |
| --- | --- |
| `WEB3FORMS_ACCESS_KEY` (or `VITE_WEB3FORMS_ACCESS_KEY`, both are read) | Web3Forms access key for the studio inbox (**required**, replace the `YOUR_WEB3FORMS_ACCESS_KEY` placeholder; without a real key the form tells visitors to email instead). Public by design; restrict it to the site's domain in the Web3Forms dashboard |
| `VITE_SITE_URL` | Public: canonical site URL |
| `NGROK_HOST` | Optional: lets the dev server answer on an ngrok tunnel |

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | The site in development on :5173 |
| `npm run build` | Production build into `client/dist`, including `sitemap.xml` |
| `npm run preview` | Serve that build on :4173 |
| `npm test` | Unit tests for shared and client (including the contact-form service) |
| `npm run test:e2e` | Playwright against the production build (it builds the site first, with a stand-in form key, and starts the preview server; it reuses one already running on :4173) |
| `npm run images` | Make a smaller `.avif` next to every photo in `client/public/images` (see "Adding photos") |
| `npm run audit:deps` | `npm audit` at moderate level |

## Testing

- `npm test -w shared`: schema and sanitisation rules, and a check of every entry in the portfolio data
  (unique slugs, valid fields, every photo exists, alt text present).
- `npm test -w client`: the inquiry form, header and menu, the projects pages, portfolio helpers, SEO tags, hosting
  header parity, the sitemap, and the contact-form service (readable fields sent to Web3Forms, honeypot sends nothing).
  Runs on the `vmThreads` pool (one jsdom per worker, fresh window per file), about 3.4x faster than the
  default, set in `client/vite.config.js`. Re-check with `npx vitest doctor -w client` after big changes.
  `isolate: false` is faster still but fails, because some tests need a clean window. If a test ever
  behaves oddly with `instanceof` on objects from a package, that is the known `vmThreads` trade-off:
  switch `pool` back to `'forks'`.
- `npm run test:e2e` (2 specs are skipped by design because they only apply to one screen size): Playwright on desktop
  and mobile viewports against the production build, including an axe-core WCAG 2.2 A/AA scan of every page and the
  contact form. the inquiry specs answer the Web3Forms request themselves, so no real email is sent.
  Use `PLAYWRIGHT_CHROMIUM_PATH` to point at an existing Chromium, or run `npx playwright install`.

### E2E troubleshooting

- **Stale servers.** Playwright reuses anything already listening on :4173. Stop old preview servers and
  re-run `npm run build` first, because the tests exercise the built client.
- **`npm run build` refuses to run.** The root `.env` contains `NODE_ENV=development`, which would make Vite emit a
  development build. Delete or comment out that line.

## Production

```
Browser -> Vercel -> client/dist (static pages, sitemap.xml)
Browser -> api.web3forms.com -> studio inbox (contact form only)
```

1. Import the repository in Vercel with **Root Directory** `client` (the monorepo's `shared/` package is installed
   with it). `client/vercel.json` sets the CSP and security headers and sends every other path to `index.html`.
2. Set `VITE_SITE_URL` to the public URL (it is used at build time for canonical links, `robots.txt` and the
   sitemap; a Vercel build without it stops with an error), and `WEB3FORMS_ACCESS_KEY` (or `VITE_WEB3FORMS_ACCESS_KEY`) to the key for the studio
   inbox. Restrict the key to the site's domain in the Web3Forms dashboard.
3. Spam protection is the honeypot field plus Web3Forms' own filtering; turn on its captcha option if spam arrives.
4. After the first deployment, send a test inquiry and confirm it arrives.

## Security

There are no accounts, sessions, cookies, admin screen or database, so there is nothing to sign in to and nothing
stored to leak. The one input is the contact form: the browser checks it against the same strict Zod schema (tag-stripped plain
text), drops honeypot submissions, and sends it to Web3Forms, which emails the studio. Rate limiting and spam
filtering are Web3Forms' (see "Production").
The browser bundle runs Zod in `jitless` mode (`client/src/schemas/zod-csp.js`) so validation never
attempts `new Function`, which the site's CSP (`script-src 'self'`, no `unsafe-eval`) would block and report.
`docs/SECURITY.md` maps each control to the code and the tests that exercise it, and lists residual
risks.

## API

There is no API of our own. The form posts JSON to `https://api.web3forms.com/submit` (allowed in the CSP `connect-src`).

## Design system

Tokens live in `client/src/styles/tokens.css` (colour, spacing scale, radii, shadows, motion, type
scale); typography rules in `typography.css`. Derived from the reference: brand palette of
maroon and beige: beige ground (`#dacfba`, from the brand kit, also the theme colour), very dark maroon-brown type (`#2b1012`), maroon
bands and buttons (`--color-brand`, `#4c1114`, the logo's colour), uppercase wide-set display text, rolling-text
navigation hover, a hero that opens on a full-screen, darkened photo gallery with the large ARCHIÓ wordmark and a clear header, large page
titles, zigzag project rows on the home page and numbered contents-style lists. A lighter maroon (`--color-accent`, `#7a2230`) is used for focus, hover and active states.
Exact pixel values are informed approximations, because computed styles of the reference could not
be inspected; compare in DevTools before sign-off.

Interaction rules, enforced by `client/src/styles/interaction-css.test.js`: every `:hover` style sits inside
`@media (hover: hover) and (pointer: fine)` so a tap on a phone never leaves it stuck on, and anything that
hover reveals also has a `:focus-visible` twin outside that block so keyboard users get it too. Buttons, chips
and pagination dip to `scale(0.97)` while pressed. Scroll-reveal sections (`useRevealOnScroll`, built on `client/src/lib/reveal.js`) drop their
classes once the animation ends, so they do not hold a compositing layer afterwards.

Scroll-driven behaviour comes from two places. GSAP with ScrollTrigger drives the word-by-word reveal of the
Our Approach heading (`WordReveal`, `lib/gsapLoader.js`). The pinned "We design" section on the home page is driven by
`useScrollSequence`, which writes how far the page has scrolled since the section touched the header into a CSS variable
(`--seq`, in svh); `styles/home.css` derives every step from it (words out and faded, names one by one, button last),
so it plays the same in every browser instead of relying on CSS scroll-driven animations. Under reduced motion it is
one still screen. GSAP is loaded with a dynamic `import()` only when that
effect runs, so it sits in its own chunks and is never downloaded in tests or for people who prefer reduced motion.
The project-detail title overlay puts white text over a photo;
its dark gradient was set by measuring contrast against the real cover images, so re-check it when a cover photo is replaced.

The home hero (`components/common/HeroPortal.jsx`) is a full-screen WebGL photo gallery, `components/ui/morph-gallery.tsx`
(written in TypeScript: the photos dissolve into each other through noise; the five featured projects, changing every six
seconds). It runs right up behind the header and has this layout: the large ARCHIÓ wordmark in the middle with the studio
descriptor ("Interior design studio", `HERO.descriptor`) under it between two thin rules; a "Start your project"
button at the top on phones only (the header holds its own "Let’s talk" link from 640px up, so only one call to action shows
at a time); a featured-project block at the bottom left with
the project's place and a "View project" link; and a round pause / play button at the bottom right (the photos change
by themselves every six seconds, so WCAG 2.2.2 requires a way to stop them; it is not shown with reduced motion, when
nothing moves). The photo layer itself is `inert`: it is a backdrop, so it is neither a tab stop nor announced.
All of it is the studio's own copy and data, none of it placeholder text. Display headings use Marcellus (see Fonts); Public Sans is used for everything else. On the home page the header is clear over the photo (white text and wordmark) until the page
is scrolled by a few pixels, then it is the usual solid beige. The gallery's `fit` setting (0.08 here) pulls each photo back
from a tight full-screen crop so more of it shows; the edges that leaves are filled with a blurred copy of the same photo.
The gallery's styles are plain CSS in `styles/morph-gallery.css` (no Tailwind) and the hero's colours and layout are in
`styles/hero-portal.css`. The photos are read as AVIF (the same files the page already preloads). A neutral black shading
(no colour cast) covers the whole photo for a quiet, moody look and is deeper at the top and bottom
(`.hero-portal__scrim`); the white header, hero line, wordmark and caption text must keep 4.5:1 or better over every
project photo, so re-check if the photos or the shading change. With this layout, measured against the brightest 5% of
the photo behind each piece of text on all three seeded projects, the lowest ratio is 5.0:1. With reduced motion the slideshow does not start by itself.
Run `npm run typecheck -w client` to type-check the `.ts`/`.tsx` files; the rest of the app stays plain JavaScript.

Cards, gallery photos and list rows reveal one after another as they scroll into view (`useRevealItems`, also on `lib/reveal.js`; a callback
ref that also picks up items added later, such as filter results). Each client-side navigation eases the new page in
(`PageTransition`); the first page load and filter changes do not animate. Both do nothing under reduced motion.

## Known limitations

- There is no admin screen: a new or changed project is an edit to `shared/data/projects.js` and a redeploy. Photos
  either go in `client/public/images` or are hosted elsewhere and given as https:// addresses.
- `client/public/preloader-gate.js` preloads the first featured project's cover on the home page, filled in at build time
  from the portfolio (`client/hero-photo.js`), so reordering or changing the featured projects needs no other edit. A cover that
  has several sizes (a photo wider than 800px) is not handled yet: a test fails until the preload picks a size by screen width.
- Inquiries exist only in the studio's email, sent by Web3Forms (a third party; the privacy notice does not name it yet,
  which needs the lawyer's sign-off). If sending fails the visitor is told to try again, but nothing keeps a copy.
- The access key is visible in the site's JavaScript; anyone can send mail to the inbox with it, so keep the domain
  restriction on in Web3Forms.
- The site is a client-rendered SPA: social crawlers that do not run JavaScript see only the
  default Open Graph tags from `index.html`.
- The project photos are 800px wide, so on large screens the hero gallery is soft; it needs higher-resolution
  photos. The reference site's scroll-scrubbed image sequence and rotating globe are not
  reproduced. The scroll effects are the heading word reveal and the pinned "We design" section described above; there is no
  parallax layout.

## Design system

`DESIGN.md` (project root) documents the visual system: tokens, colours with measured contrast, type, shapes, components, motion and do's and don'ts. `.claude/skills/archio-design/SKILL.md` turns the same rules into a short checklist for anyone (or any assistant) editing the site.
