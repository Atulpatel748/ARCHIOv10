---
version: alpha
name: Archio
description: An image-led architecture and interior-design portfolio with a cinematic hero, editorial project imagery, restrained metadata, and a numbered portfolio index. Existing Archió maroon/beige palette and font families are preserved.

colors:
  canvas: "#dacfba"
  surface: "#f2eadc"
  surface-strong: "#f8f2e7"
  secondary: "#ceb6a8"
  ink: "#2b1012"
  brand: "#4c1114"
  inverse: "#f6efe2"
  muted: "#5e4a45"
  accent: "#7a2230"
  border: "rgba(43, 16, 18, 0.24)"
  success: "#145e34"
  warning: "#774700"
  error: "#9e211a"
  error-strong: "#8c1c15"
  error-bg: "#f3dcda"
  success-bg: "#d9ecdf"
  hover: "rgba(43, 16, 18, 0.08)"
  photo-ground: "#14090a"
  scrim: "#000000"

typography:
  family: "Public Sans Variable, Public Sans, system-ui, sans-serif"
  displayFamily: "Marcellus; Optima (the brand kit's font) on devices that already have it, such as Apple's"
  textFamily: "Lora Variable, Lora, Georgia, serif (project descriptions and About paragraphs only)"
  display: { size: "clamp(3.5rem, 1rem + 12vw, 12rem)", lineHeight: 1.0, tracking: "-0.02em" }
  h1: { size: "clamp(2rem, 0.9rem + 5.6vw, 6.5rem)", lineHeight: 1.05 }
  h2: { size: "clamp(1.9rem, 1.1rem + 3.5vw, 4.4rem)", lineHeight: 1.08, tracking: "0.015em" }
  h3: { size: "clamp(1.125rem, 0.95rem + 0.9vw, 1.625rem)" }
  lead: { size: "clamp(1.125rem, 1rem + 0.5vw, 1.375rem)", lineHeight: 1.55 }
  body: { size: "1rem", lineHeight: 1.55 }
  small: { size: "0.875rem" }
  caption: { size: "0.75rem", tracking: "0.04em" }

rounded:
  none: 0
  sm: 2px
  md: 6px
  pill: 999px

spacing:
  scale: [4, 8, 12, 16, 24, 32, 48, 64, 80, 96, 128]
  gutter: "clamp(16px, 3.2vw, 48px)"
  section: "clamp(64px, 6vw, 104px)"
  container: 1600px
  header: "60px mobile, 72px from 1024px"

motion:
  ease-out: "cubic-bezier(0.23, 1, 0.32, 1)"
  fast: 150ms
  base: 300ms
  slow: 500ms
---

# Archio design system

This file describes the site as it is built today. It was written from `client/src/styles/tokens.css` and the page styles, not from another brand. The values above are the source of truth; if they change in code, change them here.

## Overview

The look is **cinematic editorialism**: immersive architectural photography leads; large display typography sets the pace; numbered project metadata and restrained rules give it the structure of a design index. The beige, maroon, rose and existing font families remain the fixed brand system.

The tone is calm and confident. Short labels, uppercase for navigation and headings, sentence case for buttons and body text.

## Colors

- **Beige canvas `#dacfba`** (from the brand kit) is the page. Cards and panels step lighter (`surface`, `surface-strong`), never pure white.
- **Maroon `#4c1114`** is the brand colour, taken exactly from the logo. It fills primary buttons, selected chips and menu items, and the footer.
- **Ink `#2b1012`** is all text and thin lines: a very dark maroon-brown, so there is no pure black or grey on the page itself.
- **Accent `#7a2230`** is a lighter maroon for the hovered "what we do" row, link hover, button hover and focus. Do not use it for large fills.
- **Inverse `#f6efe2`** is cream text on maroon and over photographs and video.
- **Rose `#ceb6a8`** (`secondary`, from the brand kit) is the call-to-action band that closes the home page and each project page before the maroon footer, so beige, rose and maroon follow each other there, and the ground photos sit on while they load. Do not use it for text. Ink on rose is 9.2:1, maroon 7.8:1, accent 5.2:1.
- **Scrim `#000`** is the one neutral. It is never a fill on the page: it only darkens photographs, at 8 to 90 percent (hero edges, the project cover's top and foot washes), written as `color-mix(in srgb, var(--color-scrim) N%, transparent)`. A tinted maroon would colour the photos; a neutral keeps them true. The morph canvas also sits on it. Behind a photo that has not loaded yet, `photo-ground #14090a` (a near-black maroon) shows instead.
- **Status tints.** `error-bg #f3dcda` and `success-bg #d9ecdf` are the alert backgrounds (the error and success text on them keep 5:1 or more); `error-strong #8c1c15` is the danger button on hover; `hover` is the faint ink wash behind a hovered chip.
- The loading screen (`preloader.css`) keeps the canvas and maroon as literals on purpose: it loads before the token sheet.

Measured contrast on the beige page: ink 11.5:1, muted text 5.4:1, eyebrow labels (ink at 75%) 6.2:1, accent 6.5:1, maroon 9.7:1, error 5.1:1, success 5.1:1, warning 5.1:1; cream on maroon 13.1:1.

## Typography

The brand kit (`Archio Logobrand kit.pdf`) names Optima as the primary font (not served, it needs a paid web licence; headings use it only on devices that already have it, such as Apple's), Public Sans for the website and UI, and Lora for print. The site has **one display voice**: every heading (page titles, section heads, statements, project and category names, the project hero title, the menu) is Marcellus (or Optima on Apple devices), in capitals with slightly open tracking (+0.015em, line-height about 1.08); Marcellus has one weight, so hierarchy comes from size. The page titles on Projects, Services, About and Contact are the exception in tracking (-0.02em at their very large size), and the Services rows are the exception in case (mixed case, a list of services rather than headings in capitals). Public Sans is for everything that is not a heading: body text at 16px and 1.55, lead paragraphs, labels and eyebrows, buttons, navigation and the small footer column labels. A heading is therefore Marcellus by default, with no opt-in class. Lora (the brand kit's font for write-ups) is used only for long-form text: the project descriptions and the About page paragraphs.

The type scale is deliberately small: no more than ten distinct rendered sizes on a page, and an automated test enforces it. The display steps are the page title (up to 11rem), `--type-h1` (the project hero title), `--type-h2` (section heads, statements, project and category names, the call-to-action heading: one size, about 68px at 1440) and `--type-h3` (card titles, legal headings); do not add a step between them.

The ARCHIÓ wordmark is not set in a font: it is the brand kit's own Optima artwork, `client/public/brand/wordmark.webp`, used as a mask (`.wordmark` in `site.css`) so it takes the colour of the text around it.

## Layout

The site keeps its 1600px content container, fluid gutter, header placement, fixed palette and existing font-family tokens. The home page opens with the existing full-screen, morphing photo hero, followed by a large studio statement. The work section pairs one dominant featured project with two image-led supporting projects that fill the available right column; short metadata labels and restrained overlays create the rhythm. The category moment sits between the portfolio and studio approach, and the approach section pairs a tall project image with a numbered process list.

The Projects page supports two presentation modes. Gallery mode uses an editorial two-column image layout with varied crop ratios; Index mode uses the same project data in a numbered list. Category, search, pagination and view state are reflected in the URL. Project detail pages open with an editorial project introduction (number, category, location and project title), followed by a contained cover image, project facts, a varied-width gallery, a concept section and a split Next Project navigation feature.

About, Services and Contact retain their existing routes and working controls, but follow the same image-led editorial rhythm. The About team section uses centred circular portraits with names and roles below; Services uses a strong typographic introduction, a contained project-scale image and a numbered capabilities index with a changing desktop image. The homepage places Our Approach above Selected Work. Project detail pages open with their own project number, category, title and location before the cover image, and the Next Project transition is a restrained split preview rather than a second full-screen landing hero. Existing responsive breakpoints and reduced-motion support remain in place. Header placement and nav order are unchanged; the header is solid on project detail pages.

## Elevation and shapes

Depth comes from rules, crop, and surface steps rather than decorative shadows. Architectural imagery and project cards keep square corners; small arrow controls are circular. Category filters read as minimal text tabs rather than capsules. Main button shapes and brand tokens remain unchanged, with a small styling refinement to the header call-to-action at desktop widths.

## Components

- **Button.** Pill. Primary is cream on maroon, secondary is a maroon outline, inverse is cream on maroon or over photos. Pressed state scales to 0.97. Labels are specific ("Let’s talk", not "Submit").
- **Link.** Underlined, 1px, thickens and turns accent on hover. On touch screens each link has a 44px hit area.
- **Header.** One line, 72px on desktop, on every page: the menu on the left (Projects, Services, About; there is no sign-in or account control, because the site has no accounts), the logo in the centre (the brand kit's ARCHIÓ wordmark alone: maroon, or cream while the header is clear over a photo; the client chose the wordmark without the submark) and the "Let’s talk" button, with an arrow, on the right. Below 1024px the same three-column bar holds a circular Menu button on the left, the logo in the centre and "Let’s talk" on the right: the full button with its arrow from 640px, and on phones a borderless, transparent 44px button holding only a paper-plane icon (the "Let’s talk" label stays as its accessible name). The open phone menu mirrors the bar, with a circular close button where Menu was and the logo staying centred. On the home page the header stays clear over the hero photo until it scrolls past, then turns solid beige. Project detail pages use a solid header above the editorial project introduction, so their first screen is visibly distinct from the home landing experience. The home hero retains its immersive wordmark transition. The central home wordmark scrolls up as one unit, scales onto the header wordmark (the same artwork) and fades into it; scrolling back reverses the transition. A full-screen menu opens from the Menu button. Below 640px the hero has no call-to-action button.
- **Hero.** The full-screen, morphing project photos run up behind a clear header (white text and wordmark; solid beige once the page scrolls). The large ARCHIÓ wordmark in the middle, on its own without the submark, with the studio descriptor under it, between two thin rules. The descriptor moves upward and fades out as scrolling begins; with reduced motion it stays visible. The whole central wordmark travels and scales as one unit onto the header wordmark, then fades into it. Scrolling back reverses the motion. With reduced motion the central wordmark stays in place and visible. A featured-project block (place, "View project" with an arrow) sits at the bottom left, and a round pause / play button (44px, thin cream outline) at the bottom right, because the photos change by themselves (WCAG 2.2.2); it is hidden with reduced motion, when nothing moves. A soft radial scrim keeps the centre of the photos bright; darker top and bottom edges preserve contrast for the header and featured-project text. No zoom effect. Photos are pulled back a little from a full-screen crop so more of each shows. With reduced motion the slideshow does not start by itself. On the home page the loading screen stays up until the first photo is on screen, so the hero is never revealed as a black box; it leaves after 4 seconds at the latest, whatever happens to the photo. The photos are drawn only while one dissolves into the next; between dissolves the still picture is left on screen rather than redrawn every frame, which kept phones busy for nothing.
- **Eyebrow label.** A small uppercase label (`.eyebrow t-label`) above a heading, list or card title: "Our approach", "Our consultancy-led process ensures:", "Get started", and each project's category on its card. In the Approach section the process numbers (01–04) use the same body size and font as the points beside them. Ink at 75% opacity, which measures 6.8:1 on beige and 7.9:1 on the maroon band; do not go lighter.
- **Team.** The title is left-aligned above large, rectangular portraits. The two profiles share a row on wide screens and stack on narrow phones.
- **Project card.** The Gallery view uses large cover imagery, sequential numbering, restrained category/location metadata and a small circular open affordance. Index view compacts the same data into a numbered horizontal row. The source project names and photos stay unchanged.
- **Project page.** The cover photo fills the viewport; its foot holds an oversized project title and real category/location details. A surface strip presents project facts. The gallery uses varied-width image compositions, and the Concept area places its display heading and long-form description side by side on wide screens, then stacks them on mobile. The next-project cover remains the closing visual link and loops to the first item after the last project.
- **Call-to-action band.** Rose, at the end of the home page and each project page only (About, Services and the rest go straight to the footer). Left-aligned: "Get started" with a rule running to the edge, the display heading with its last word on its own line in the accent maroon and slanted (Marcellus has no italic, so the browser slants it), and on the right, past a vertical hairline, the line of copy and the maroon "Let’s talk" button with an arrow. On phones the parts stack. No photo.
- **Footer.** Maroon, as tall as its content, under the page’s rose call-to-action band, left-aligned: the brand kit ARCHIÓ wordmark in cream (about 19rem wide) with a one-line description of the studio under it; then two columns (one column on phones; from 900px brand, contact and legal share one row, and the contact column never gets narrower than the email address): "Contact" (the email in the display font at h3 size, the phone and Instagram) and "Legal" (Privacy notice, Terms of service, Cookie policy). The site’s own pages are not listed again: the header carries them on every screen. Column labels are caption-size, softened cream. After a hairline, the copyright on the left and Beracah Trading on the right (stacked on phones).
- **Contact page.** The Contact page keeps its details beside the form as you scroll (sticky from 1024px).

## Motion

Motion explains what is new, nothing more. Everything animates `transform` and `opacity` only and uses the one ease-out curve above.

| Effect | Duration | Notes |
| --- | --- | --- |
| Button press | 150ms | scale 0.97 |
| Link / colour change | 150ms | colour only |
| Section reveal | 500ms | rises 24px, once per element |
| Card and gallery reveal | 500ms | rises 24px, 60ms apart, first load only (filter results simply show), classes removed after settling |
| Page change | 300ms | new page fades in, rising 8px; not replayed for filter-only changes |
| Photo hover zoom | 500ms in, 300ms out | project cards and home rows only (links), settles to 1.02; lets go quickly so a pointer crossing a grid leaves nothing zoomed behind it |
| Hero place name, pause / play icon | 300ms / 150ms | the name fades in from a 2px blur with each new photo; the new icon grows in from 0.9 |
| Sending spinner, field error | 150ms | the spinner fades in; an error fades in, settling 2px |
| Text roll on hover | 150ms | nav links and buttons |
| Card and row press | 150ms | the photo (not the whole card) scales to 0.98; category names and menu links to 0.97 |
| Phone menu | 150ms | fades in on open (no slide), closes at once |
| Form step, stepper, message | 150ms / 300ms | a new step's fields fade in; the stepper bar fills (300ms); an alert fades and settles 4px |

The loading screen (`client/src/styles/preloader.css`, shown before the app starts, once per browser tab: a reload or a later visit in the same tab skips it, see `client/public/preloader-gate.js`) uses a full-screen, cover-cropped architectural background (`client/public/images/preloader-architecture.webp`) beneath its existing intro: the logo mark fades in, the letters of ARCHIÓ rise one after another, and a hairline sweeps beneath them. Once loading finishes, the whole screen fades out over 300ms and is removed. The mobile crop favors the curved opening.

One deliberate exception to the rules above, explained in a comment in that file:
- The screen sits at `opacity: 0.999`, not 1. Browsers skip painting what is behind a fully opaque layer, so the hero was only drawn once the curtain began to lift and showed black for a few hundred milliseconds. At 0.999 it looks identical and the hero is already painted when revealed. Do not "tidy" this back to 1.

Reduced motion disables the intro animations, and the reveal classes are never added, so content is never hidden. Nothing moves, but fades and colour changes keep their timing (a hover, the header turning solid), so the page changes gently instead of snapping. The loading screen fades out without sliding in either mode.

## Do's and don'ts

- Do keep one accent and one theme per page, and the three brand fonts in their roles: the display face for headings, Public Sans for text and UI, Lora for long-form write-ups only.
- Do let photographs lead and keep copy short.
- Do keep every tap target at least 44px on touch screens.
- Don't add gradients, glass effects, drop shadows on cards, or badges over images.
- Don't use pure black, pure white or grey, bounce or elastic easing.
- Don't change route slugs, navigation labels, form field names, the logo or the legal copy without sign-off.

## Responsive behavior

Layout is fluid from 320px to 1920px (checked at nine widths with no horizontal overflow). Below 1024px the desktop nav collapses to a menu button on the left of the header (logo centred, never swapped back to the left). The project preview panel and the scroll-highlight effect only run on wide screens (the preview panel from 1024px).

## Known gaps

- Many Dubai Marina and JLT project photos are 626 to 800px wide, so the covers and gallery can look soft on large and high-density screens. The Arabian Ranches renders are 3200×2560, and the team portrait is 1920×1920. `npm run images` makes smaller AVIF steps and a `srcset` for sources wider than 800px; the studio still needs to supply 1600–2400px originals for the lower-resolution projects.
- There is no dark mode; the site is intentionally light, closing with the maroon footer (and, on the home and project pages, a rose call-to-action band above it).
- Project categories in the portfolio data are Residential, Commercial and Landscape only.
