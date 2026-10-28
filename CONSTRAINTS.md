# Constraints

The quality bar for the Archió site. The numbers were measured on 28 Oct 2026 on the live site (`https://archio-v10.vercel.app`) and the code in `site/`. Do not lower a number or remove a check just to make a change pass; fix the change, or add a dated exception below.

Last reviewed: 28 Oct 2026

## Floor (always enforced)

- No new suppression comments: `@ts-ignore`, `@ts-expect-error`, `eslint-disable`, `nosemgrep`, `istanbul ignore`.
- No unfinished stubs ("not implemented") and no empty `catch {}` blocks.
- No skipped or deleted tests without a reason in the commit message.
- No secrets in the code or in git history. Only `site/.env.example` (empty example values) may be tracked as an `.env` file.
- Nothing may say or suggest that a design visualisation is a finished project, and nothing may invent facts (years of experience, completed projects, testimonials, awards, qualifications, addresses, prices, client names).
- This file is not weakened to make a change pass.

Today the floor passes: 0 suppression comments, 0 stubs, 0 empty catches, 0 skipped tests.

## Enforced, with numbers

Run from inside `site/` unless a different place is given.

| What | Rule | Checked by | Today | Where it runs |
| --- | --- | --- | --- | --- |
| Types | Zero errors | `npm run typecheck` | 0 errors | every change |
| Lint | Zero errors | `npm run lint` | 0 errors | every change |
| Tests | All pass | `npm test` (contact form route and mail sender) | 13 of 13 pass | every change |
| Build | Succeeds | `npm run build` | passes | before every push, and on GitHub |
| Dependencies | No known problems | `npm audit --audit-level=high` | 0 | before every push, and on GitHub |
| Accessibility | Lighthouse score 100 on every page | `npx lighthouse <URL> --only-categories=accessibility` | 100 on all 8 pages checked | after every deploy |
| Speed | Lighthouse performance 90 or more on every page | `npx lighthouse <URL> --only-categories=performance` | 94 to 100 | after every deploy |
| Layout shift | CLS 0.1 or less | the same Lighthouse run | 0 to 0.035 | after every deploy |
| Best practices and SEO | 100 | the same Lighthouse run | 100 | after every deploy |
| Page overflow | No sideways scroll at 320, 360, 390, 768, 1024, 1280, 1440, 1920 px | open each page at each width | none found | after layout changes |

Why these numbers: they are what the live site scores today, so a drop is a real change that someone has to explain. The Lighthouse rows are the outside opinion in this list: they run in a real browser and the project's own tests cannot influence them.

## Measured, not yet enforced

These are recorded so they cannot quietly get worse. Hold the line; improve them when there is a reason.

| What | Today | Direction |
| --- | --- | --- |
| Mobile LCP, slow-network test | 0.8 to 0.9 s on most pages; 2.5 s on `/services`; 2.6 to 3.1 s on `/projects` and project pages | must not rise; the goal is 2.5 s or less |
| JavaScript loaded on first visit | about 145 KB, compressed | must not grow |
| Fonts | about 58 KB (3 files, Latin only); it was 96 KB (6 files) until 28 Oct 2026, and an earlier note of 47 KB had counted only the two biggest files | must not grow |
| Whole page weight on mobile | 311 to 527 KB | must not grow |
| Contact form emails delivered | none yet (the SMTP settings are not set in Vercel) | must reach "works" before launch |

## Not set up yet (no tool behind it, so not a constraint)

- Test coverage: there is no coverage tool, so no number is claimed.
- Blocking a merge on a red check: GitHub runs the checks on every push and pull request (`.github/workflows/ci.yml`, first green run on 28 Oct 2026, 46 seconds), but Vercel deploys on its own, and branch protection (a repository setting for the owner) is not turned on.
- A scan for leaked secrets as a tool: a search of the git history was done by hand on 28 Oct 2026 and found nothing.
- Error and speed monitoring on the live site: none.

## Exceptions

None. An exception needs a reason, an owner and an end date (90 days at most).

| ID | Rule | Where | Reason | Owner | Ends |
| --- | --- | --- | --- | --- | --- |
