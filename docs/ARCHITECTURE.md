# Architecture

## 1. Reference analysis (what was derived, what was replaced)

The reference was read from the live pages (home, projects, services, connect-us). Computed CSS could
not be inspected, so the *structure* below is observed and the *numeric values* in section 2 are
informed approximations.

| Reference pattern | Archió implementation |
| --- | --- |
| Light ground, dark type, monochrome UI | Maroon and beige brand palette: beige `--color-bg: #dacfba` (brand kit, theme colour), dark maroon-brown text `--color-ink: #2b1012`, maroon `--color-brand: #4c1114` for buttons and dark bands; photography carries the rest |
| Header: navigation left, logo centre, "Let’s talk" CTA right | Three-zone grid header; under 1024px the navigation becomes a "Menu" button on the left (icon only under 400px) that opens a full-screen `<dialog>`, whose Close button sits in the same place |
| Navigation links with a rolling-text hover (labels repeated in the DOM) | `RollText`: one visible label plus a decorative duplicate, hidden from assistive tech |
| Full-screen hero with project slideshow and caption | `HeroPortal`: a full-screen WebGL photo gallery (`morph-gallery.tsx`) behind a clear header; the brand kit's ARCHIÓ wordmark with the studio descriptor under it between two thin rules, the featured-project block and a pause button sit on top |
| Uppercase statement block with a "read more" link | The home approach section: its heading lights up word by word (`WordReveal`), with a link to Services |
| "We design" category list | Type only: the category names as links between a large "We" / "design", pinned while the scroll draws them apart and brings the names up one by one (`useScrollSequence` writes the scroll distance into `--seq`; the CSS derives each step from it) |
| Table-of-contents style list with right-aligned numbers | Process list (number, title, duration) |
| Projects page: title, discipline/category chips, location filter, 2/4 per-row toggle, bottom CTA | Category chips, literal search, pagination; three or four cards to a row on wide screens (no toggle) |
| Services page: list with "learn more" per service | One services page listing every service (no per-service pages) |
| Multi-step "connect us" form | Three-step inquiry form with per-step validation |
| Footer: legal line, socials, copyright, email, hours | Footer with giant email link, link columns, socials, legal line |
| Not reproduced | Real hero footage (the hero is a photo gallery instead), scroll-scrubbed frame sequence, rotating globe, book promotion, careers, awards |

## 2. Design system

All tokens are CSS custom properties in `client/src/styles/tokens.css`.

- **Colour** (brand kit): bg `#dacfba`, rose `#ceb6a8` (call-to-action band, photo placeholders), surface `#f2eadc`/`#f8f2e7`, ink `#2b1012` (11.5:1 on bg),
  muted `#5e4a45` (5.4:1 on bg), border `rgba(43,16,18,.24)`, brand `#4c1114` (cream text on it 13.1:1), accent `#7a2230`
  (6.5:1 on bg), success `#145e34`, warning `#774700`, error `#9e211a` (each 5.1:1 on bg).
- **Type**: Public Sans variable (weight axis) for text and Marcellus for display headings (standing in for the brand kit's
  Optima), self-hosted; the ARCHIÓ wordmark is the brand kit artwork (`brand/wordmark.webp`). Display/headings uppercase,
  weight 500, tracking -0.025em, leading 0.98 to 1.05. Body 16px/1.55, normal width. Scale (fluid):
  display 3.5 to 12rem, h1 2 to 6.5rem, h2 1.75 to 4rem, h3 1.125 to 1.625rem, lead 1.125 to 1.375rem,
  small 0.875rem, caption 0.75rem.
- **Spacing**: 4, 8, 12, 16, 24, 32, 48, 64, 80, 96, 128px; fluid gutter `clamp(16px, 3.2vw, 48px)`; section
  padding `clamp(64px, 6vw, 104px)` (about 86px at 1440, the same as `.section--tight`; two tight blocks in a row share one gap; 48px on screens 820px tall or less); every section is at least one screen tall under the header (`.screen`); container 1600px; header 60px (72px from 1024px).
- **Shape and depth**: square images and inputs (0 radius), pill buttons and chips, 1px black rules, shadows only
  on menus and modals.
- **Motion**: one orchestrated moment (wordmark letters rise on load), rolling-text hover, image zoom on project
  cards, the hero's noise-dissolve photo gallery, staggered item reveals, page-enter transition, dialog fade, and the word-by-word heading reveal (`WordReveal`). All collapse under `prefers-reduced-motion`; the hero does not zoom or
  morph in that mode, and while it rotates its slideshow always has a pause control.

### Responsive behaviour

| Breakpoint | Changes |
| --- | --- |
| < 640px | Single-column grids; header CTA hidden (menu has it); slideshow 4:5; form fields stack |
| 640px | Two-column project grid and form pairs; header CTA appears |
| 768px | offices three columns; facts grid |
| 900px | Intro and service rows become multi-column; footer: brand and contact on one row, link columns under them |
| 1024px | Inline navigation replaces the menu dialog; three or four project cards per row; split layouts |
| 1280px | Footer: brand, contact and the three link columns on one row |

Verified with an automated scan of 11 routes at 320, 375, 390, 414, 768, 1024, 1280, 1440 and 1920px
(no horizontal overflow, console errors, failed requests or heading-structure problems).

## 3. Content and data

There are no accounts, no admin screen and no database. What the site shows comes from files in the repository:

| Data | Where it lives | How it changes |
| --- | --- | --- |
| Portfolio (projects, photos, descriptions) | `shared/data/projects.js`; photos in `client/public/images/projects/<slug>/` or at https:// addresses | Edit the file (it begins with step-by-step instructions), `npm test` validates it against the shared schema, redeploy |
| Page copy, services, team | `client/src/constants/content.js`, `site.js` | Edit and redeploy |
| Inquiries (the only thing visitors create) | An email sent by Web3Forms to the inbox its access key belongs to; nothing is stored on the site | Posted from the browser to `https://api.web3forms.com/submit`; `consent` must be true |

The portfolio is part of the bundle (`client/src/services/projects.js` re-exports it), so project pages render
without a request and cannot fail to load. The build writes `sitemap.xml` from the same file (`client/sitemap.js`), so
the sitemap always matches the pages.

## 4. API

There is no API of our own. The inquiry form posts to Web3Forms (`https://api.web3forms.com/submit`), which emails the studio. Spam filtering is theirs plus the honeypot field.

## 5. Access control

Everything on the site is public, so there are no roles or sign-in. The only write is an inquiry, which is validated
in the browser and sent to Web3Forms. Whoever can push to the repository controls the content. See `docs/SECURITY.md`.

## 6. Testing strategy

Shared schema and portfolio-data tests, client unit and component tests (including the contact-form service and the
sitemap), and Playwright end-to-end and accessibility specs run against the production build in desktop and phone
viewports.

## 7. Deployment

Vercel: static files from `client/dist` on its CDN; there is no server code. See README.
