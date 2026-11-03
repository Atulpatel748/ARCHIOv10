# Constraints

The quality bar for the Archió site. The numbers were measured on 28 Oct 2026 on the live site (`https://archio-v10.vercel.app`) and the code in `site/`. Do not lower a number or remove a check just to make a change pass; fix the change, or add a dated exception below.

Last reviewed: 3 Nov 2026

## Floor (always enforced)

- No new suppression comments: `@ts-ignore`, `@ts-expect-error`, `eslint-disable`, `nosemgrep`, `istanbul ignore`.
- No unfinished stubs ("not implemented") and no empty `catch {}` blocks.
- No skipped or deleted tests without a reason in the commit message.
- No secrets in the code or in git history. Only `site/.env.example` (empty example values) may be tracked as an `.env` file.
- Nothing may say or suggest that a design visualisation is a finished project, and nothing may invent facts (years of experience, completed projects, testimonials, awards, qualifications, addresses, prices, client names).
- This file is not weakened to make a change pass.

Today the floor passes (checked 30 Oct 2026): 0 suppression comments, 0 stubs, 0 empty catches, 0 skipped tests.

## Enforced, with numbers

Run from inside `site/` unless a different place is given.

| What | Rule | Checked by | Today | Where it runs |
| --- | --- | --- | --- | --- |
| Types | Zero errors | `npm run typecheck` | 0 errors | every change |
| Lint | Zero errors | `npm run lint` | 0 errors | every change |
| Tests | All pass | `npm test` (contact form route, mail sender, image loader) | 34 of 34 pass | every change |
| Browser tests | All pass, none skipped or marked fixme without a "BUG:" reason | `npm run test:e2e` (Playwright, Chromium, production build: pages, navigation, axe WCAG 2.2 AA, overflow at ten widths from 320 to 1920, hero, gallery, contact form, honesty rules, SEO) | 221 of 221 pass (3 Nov 2026, two clean runs; the overflow test now covers 360, 375, 414, 1024 and 1440 too); 175 of 175 earlier the same day (the contact spec also passed 3 repeats); the earlier 166 were stable across 3 repeats, serial, 6 workers and a fresh CI build | before every push, and on GitHub |
| Build | Succeeds | `npm run build` | passes | before every push, and on GitHub |
| Dependencies | No known problems | `npm audit --audit-level=high` | 0 high; 16 moderate, all one ESLint helper (see the note below) | before every push, and on GitHub |
| Accessibility | Lighthouse score 100 on every page | `npx lighthouse <URL> --only-categories=accessibility` | 100 on all 9 pages (3 Nov 2026, `b77513f`) | after every deploy |
| Speed | Lighthouse performance 90 or more on every page | `npx lighthouse <URL> --only-categories=performance` | 94 to 99, except `/projects/arabian-ranches-garden` 88 to 90 and `/projects/dubai-marina-residence` 91 to 93 (3 Nov 2026, each page run on its own; see E2) | after every deploy |
| Layout shift | CLS 0.1 or less | the same Lighthouse run | 0 on all 9 pages (3 Nov 2026) | after every deploy |
| Best practices and SEO | 100 | the same Lighthouse run | 100 | after every deploy |
| Page overflow | No sideways scroll at 320, 360, 375, 390, 414, 768, 1024, 1280, 1440, 1920 px | `e2e/layout.spec.ts` | none found | every browser test run |

Why these numbers: they are what the live site scores today, so a drop is a real change that someone has to explain. The Lighthouse rows are the outside opinion in this list: they run in a real browser and the project's own tests cannot influence them.

## Measured, not yet enforced

These are recorded so they cannot quietly get worse. Hold the line; improve them when there is a reason.

| What | Today | Direction |
| --- | --- | --- |
| Mobile LCP, slow-network test | 2.1 to 2.5 s on most pages; 2.5 to 2.8 s on `/projects`; 3.1 to 3.4 s on the Dubai Marina and Arabian Ranches pages (3 Nov 2026). It was 0.8 to 0.9 s on most pages before the first-visit preloader (28 Oct 2026): Lighthouse is always a first visit, and the page title is the largest thing on screen but stays covered for the preloader's 2 s minimum | must not rise; the goal is 2.5 s or less |
| JavaScript per page, Lighthouse mobile transfer | 202 to 216 KB (3 Nov 2026): about 117 KB is React and Next.js, about 58 KB is gsap, ScrollTrigger and Lenis fetched once the browser is idle (after the first load), the rest is the page's own code | must not grow |
| Fonts | about 58 KB (3 files, Latin only); it was 96 KB (6 files) until 28 Oct 2026, and an earlier note of 47 KB had counted only the two biggest files | must not grow |
| Whole page weight on mobile | 311 to 527 KB | must not grow |
| Vercel image resizing on request (`/_next/image`) | 0 per visit since 30 Oct 2026 (photos are resized ahead of time, ADR-007); it was about 57 for a three-page visit | must stay 0 |
| Contact form emails delivered | none yet (the SMTP settings are not set in Vercel) | must reach "works" before launch |

Note (3 Nov 2026): the old 145 KB figure could not be reproduced by any script here, so the JavaScript row now uses the Lighthouse figure, which anyone can re-run. No script loads where it is not needed: three.js is not in the first load, and gsap and Lenis already wait for the browser to be idle.

Note (3 Nov 2026): the 16 moderate `npm audit` warnings are one advisory, GHSA-g3hv-75wg-m249 in `minimatch` below 11.0.1, reached only through ESLint and its plugins (a tool on the developer's computer, never sent to visitors). It matters only when an attacker writes the glob patterns; here we write them in our own lint settings. npm's offered fix downgrades ESLint to version 4, and forcing `minimatch` 11 breaks `eslint-plugin-import` and `@eslint/config-array`, which still call it as a plain function. Recheck when eslint-config-next or ESLint updates.

## Not set up yet (no tool behind it, so not a constraint)

- The Lighthouse rows above are run by hand after a deploy; no script or CI job runs them.

- Test coverage: there is no coverage tool, so no number is claimed.
- Blocking a merge on a red check: GitHub runs the checks on every push and pull request (`.github/workflows/ci.yml`, first green run on 28 Oct 2026, 46 seconds), but Vercel deploys on its own, and branch protection (a repository setting for the owner) is not turned on.
- A scan for leaked secrets as a tool: a search of the git history was done by hand on 28 Oct 2026 and found nothing.
- Error and speed monitoring on the live site: none.

## Exceptions

An exception needs a reason, an owner and an end date (90 days at most).

E1 (JavaScript growth, 30 Oct 2026) was closed on 3 Nov 2026 by recording the new size as the baseline, as it allowed.

| ID | Rule | Where | Reason | Owner | Ends |
| --- | --- | --- | --- | --- | --- |
| E2 (3 Nov 2026) | Lighthouse performance 90 or more on every page | `/projects/arabian-ranches-garden` 88 to 90, `/projects/dubai-marina-residence` 91 to 93 | The first-visit preloader (an owner design choice) covers the page for at least 2 s, so the page title, which Lighthouse counts as the largest paint, shows late. Before the end date, the owner either shortens the preloader's minimum time or skips it when a visitor lands straight on a project page, or keeps the design and accepts the lower score here. | Atul Patel | 1 Feb 2027 |
