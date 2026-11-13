# Constraints

The quality bar for the Archió site. The numbers were measured on 28 Oct 2026 on the live site (`https://archio-v10.vercel.app`) and the code in `site/`. Do not lower a number or remove a check just to make a change pass; fix the change, or add a dated exception below.

Last reviewed: 13 Nov 2026

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
| Browser tests | All pass, none skipped or marked fixme without a "BUG:" reason | `npm run test:e2e` (Playwright, Chromium, and also Firefox on GitHub, production build: pages, navigation, axe WCAG 2.2 AA, overflow at ten widths from 320 to 1920, hero, gallery, contact form, honesty rules, SEO) | 221 of 221 pass in Chromium, and 221 of 221 in Firefox on GitHub (13 Nov 2026). Safari's engine (WebKit) was tried once by hand: 218 of 221, the other 3 are Safari's own keyboard-focus rules | before every push, and on GitHub |
| Build | Succeeds | `npm run build` | passes | before every push, and on GitHub |
| Dependencies | No known problems | `npm audit --audit-level=high` | 0 high; 16 moderate, all one ESLint helper (see the note below) | before every push, and on GitHub |
| Accessibility | Lighthouse score 100 on every page | `npx lighthouse <URL> --only-categories=accessibility` | 100 on all 9 pages (13 Nov 2026, `a994b71`, live site) | after every deploy |
| Speed | Lighthouse performance 90 or more on every page | `npx lighthouse <URL> --only-categories=performance` | 95 to 100 on all 9 pages (13 Nov 2026, `a994b71`, live site, each page run on its own) | after every deploy |
| Layout shift | CLS 0.1 or less | the same Lighthouse run | 0 on all 9 pages (13 Nov 2026) | after every deploy |
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

E2 (Lighthouse speed on two project pages, 3 Nov 2026) was closed on 13 Nov 2026: the first-visit preloader now runs only on the home page, and every page scores 95 or more.

| ID | Rule | Where | Reason | Owner | Ends |
| --- | --- | --- | --- | --- | --- |
| E3 (13 Nov 2026) | Floor: nothing may say or suggest that a design visualisation is a finished project | The "Design visualisation" labels, captions and "Images" fact row were removed from every page, and the pages' search descriptions no longer say "design visualisation" | The studio answered in writing (client questionnaire, question 18, 13 Nov 2026) that the three projects were completed as white-label work and asked for the label to go. This is the studio's own statement and has not been checked against photos or client permission. The site still does not name any client, say "completed", give a year, or claim awards. | The studio owners (Pooja Vijayakumar and the person who answered the questionnaire) | 11 Feb 2027: send written proof (photos or the client's permission), or the labels come back |
