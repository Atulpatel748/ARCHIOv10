---
name: archio-design
description: "Design rules for the Archio interior-design studio website (React + plain CSS in client/). Use this whenever you add or change any page, component, style, animation, image, copy or colour on this site, even for small tweaks like a button, a spacing change or a new section. It keeps the quiet editorial look consistent: beige canvas, maroon brand colour, dark maroon-brown ink, one typeface, large type, photography first, and motion that only uses transform and opacity."
---

# Archio design rules

Read `DESIGN.md` in the project root first. It holds the exact tokens and is the source of truth. Use the CSS variables in `client/src/styles/tokens.css`; never hard-code a colour, size or duration.

## Always

1. **Maroon and beige only.** Beige `--color-bg`, maroon `--color-brand` for buttons and dark bands, `--color-ink` for text, and the lighter maroon `--color-accent` only for the active row, hover and focus. No new colours, no pure black or grey.
2. **Brand kit fonts.** Public Sans for all text, plus the display font (Marcellus, standing in for Optima) only for `.t-serif` headings and the featured project's name. The ARCHIÓ wordmark is the brand kit artwork (`.wordmark`), never typed text. Keep the page to the existing type scale (at most ten rendered sizes; an e2e test checks it).
3. **Photography leads.** No overlays, badges, captions-as-decoration or gradients on project photos.
4. **Square corners, pill buttons.** Do not add a third corner style. No card shadows, no glass effects.
5. **Touch targets of 44px.** Any new link or button needs a 44px hit area on touch screens (see the `@media (pointer: coarse)` block in `site.css`).
6. **Motion has a reason.** Animate `transform` and `opacity` only, with `--ease-out`. Never `ease-in`, bounce or elastic, never `transition: all`. Anything that moves must be switched off for `prefers-reduced-motion`, and content must never be hidden when motion is off.
7. **Press feedback.** Pressable things scale to 0.97 on `:active`.
8. **One call-to-action button on the first screen.** "Let’s talk" lives in the header, on the right (from 640px up); below 1024px the header is Menu (left), logo (centre), "Let’s talk" (right; a round paper-plane icon button below 640px), and the Menu button must stay on the left; the hero has no call-to-action button either (the menu and the closing band carry it). Never show two at once.
9. **Keep it light.** Short copy, no filler sections.

## Never change without sign-off

Route slugs, primary nav labels, form field names and order, the logo, and legal or consent copy. Client copy stays as written.

## Before you finish

- `npm test` (client unit tests) and the e2e specs for any page you touched.
- Check phone (390px) and desktop (1440px): no horizontal scroll, text readable, every link tappable.
- If you change the hero photos or the shading in `styles/hero-portal.css`, re-check that the white header, hero descriptor, wordmark and featured-project text keep at least 4.5:1 over every photo (README.md, "hero").
- Update `DESIGN.md` if you changed a token.
