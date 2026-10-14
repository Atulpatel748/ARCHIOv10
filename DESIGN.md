---
version: alpha
name: Archio
description: A quiet, editorial interior-design studio site. Maroon and beige: a beige canvas, dark maroon-brown ink, the logo's maroon for buttons and the footer, the brand kit's rose for the call-to-action band, the brand kit's fonts (Public Sans for text, a display face for headings) set very large, and photography doing most of the talking.

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
  displayFamily: "Marcellus (stand-in for the brand kit's Optima until it is licensed)"
  display: { size: "clamp(3.5rem, 1rem + 12vw, 12rem)", lineHeight: 0.98, tracking: "-0.02em" }
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
  slow: 800ms
---

# Archio design system

This file describes the site as it is built today. It was written from `client/src/styles/tokens.css` and the page styles, not from another brand. The values above are the source of truth; if they change in code, change them here.

## Overview

The look is **exaggerated minimalism**: very large type, a lot of empty space, and photographs of finished projects. Nothing decorative competes with the work. The page reads like a printed monograph on warm beige paper, with a rose call-to-action band and the maroon footer to close it.

The tone is calm and confident. Short labels, uppercase for navigation and headings, sentence case for buttons and body text.

## Colors

- **Beige canvas `#dacfba`** (from the brand kit) is the page. Cards and panels step lighter (`surface`, `surface-strong`), never pure white.
- **Maroon `#4c1114`** is the brand colour, taken exactly from the logo. It fills primary buttons, selected chips and menu items, and the footer.
- **Ink `#2b1012`** is all text and thin lines: a very dark maroon-brown, so there is no pure black or grey on the page itself.
- **Accent `#7a2230`** is a lighter maroon for the hovered "what we do" row, link hover, button hover and focus. Do not use it for large fills.
- **Inverse `#f6efe2`** is cream text on maroon and over photographs and video.
- **Rose `#ceb6a8`** (`secondary`, from the brand kit) is the call-to-action band that closes each page before the maroon footer, so beige, rose and maroon follow each other, and the ground photos sit on while they load. Do not use it for text. Ink on rose is 9.2:1, maroon 7.8:1, accent 5.2:1.
- **Scrim `#000`** is the one neutral. It is never a fill on the page: it only darkens photographs, at 8 to 90 percent (hero edges, project-hero gradient), written as `color-mix(in srgb, var(--color-scrim) N%, transparent)`. A tinted maroon would colour the photos; a neutral keeps them true. The morph canvas also sits on it. Behind a photo that has not loaded yet, `photo-ground #14090a` (a near-black maroon) shows instead.
- **Status tints.** `error-bg #f3dcda` and `success-bg #d9ecdf` are the alert backgrounds (the error and success text on them keep 5:1 or more); `error-strong #8c1c15` is the danger button on hover; `hover` is the faint ink wash behind a hovered chip.
- The loading screen (`preloader.css`) keeps the canvas and maroon as literals on purpose: it loads before the token sheet.

Measured contrast on the beige page: ink 11.5:1, muted text 5.4:1, eyebrow labels (ink at 75%) 6.2:1, accent 6.5:1, maroon 9.7:1, error 5.1:1, success 5.1:1, warning 5.1:1; cream on maroon 13.1:1.

## Typography

The brand kit (`Archio Logobrand kit.pdf`) names Optima as the primary font, Public Sans for the website and UI, and Lora for print. The site has **one display voice**: every heading (page titles, section heads, statements, project and category names, the project hero title, the menu) is Marcellus (the Optima stand-in), in capitals with slightly open tracking (+0.015em, line-height about 1.08); Marcellus has one weight, so hierarchy comes from size. The page titles on Projects, Services, About and Contact are the exception in tracking (-0.02em at their very large size), and the Services rows are the exception in case (mixed case, a list of services rather than headings in capitals). Public Sans is for everything that is not a heading: body text at 16px and 1.55, lead paragraphs, labels and eyebrows, buttons, navigation and the small footer column labels. A heading is therefore Marcellus by default, with no opt-in class. Lora (the brand kit's font for write-ups) is used only for long-form text: the project descriptions and the About page paragraphs.

The type scale is deliberately small: no more than ten distinct rendered sizes on a page, and an automated test enforces it. The display steps are the page title (up to 11rem), `--type-h1` (the project hero title), `--type-h2` (section heads, statements, project and category names, the call-to-action heading: one size, about 68px at 1440) and `--type-h3` (card titles, legal headings); do not add a step between them.

The ARCHIÓ wordmark is not set in a font: it is the brand kit's own Optima artwork, `client/public/brand/wordmark.webp`, used as a mask (`.wordmark` in `site.css`) so it takes the colour of the text around it.

## Layout

A 1600px container with a fluid gutter. Sections are separated by a 1px rule and generous vertical space (`--section-y`). Every section is one screen (`.screen`: at least the screen height under the header, content centred), so while you read one section the ones above and below stay out of view: the home and project heroes fill the whole screen, each later section, the footer fills the screen under the header. On pages with a call to action, the rose band (all on one centred axis: "Get started" between two short rules, the statement with its last word on its own line in the accent maroon, the paragraph at lead size in a narrow measure, then the "Let’s talk" button) opens the footer, so band, links and wordmark close the page as one block; `CtaBand` stays in each page and is drawn into the footer's `#footer-cta` slot, and on inner pages the page title shares the first screen with the first block. Longer content (the project list, legal pages, a gallery) simply runs on. There is no scroll snapping (the client asked for that). Mouse and trackpad users get eased, inertial wheel scrolling (Lenis, `useSmoothScroll`, loaded when the page is idle); touch screens and anyone with reduced motion keep the browser's own scrolling. On short laptop screens (820px tall or less) the vertical rhythm tightens so sections still fit. On the Projects page, project images sit on an offset grid so rows do not line up like a catalogue. On the home page, Selected projects is zigzag rows under its heading and the "View all projects" link: each of three projects is one row and one link, a large photo and beside it the number and category, the name in the display font, and the place (no separate link text: the whole row is the link). The rows zigzag on every screen: on wide screens the photo takes 7 of 12 parts (16:10) and swaps sides row by row, text first in the odd rows; on tablets photo (4:5) and text share the row half and half, swapping the same way; on phones the photo (3:2, 86% wide) sits above its text and keeps to alternate sides, the text following it to the right in the even rows. Hover or focus settles the photo in a little and turns the name accent maroon. "We design" (the heading text; the section is still called We do in the code) is type only and is a pinned section. It scrolls up from the bottom of the screen like any other, with "we do" together at the middle. When its stage touches the header it pins, and the scroll then plays one step after another: "We" moves out to the left edge and "do" to the right, the words fade back (to about 0.6), the three category names come up from below one by one, each fading in over a long stretch and overlapping the one before, and "View all projects" appears last. `useScrollSequence` writes the scroll distance since the stage touched the header into `--seq` (in svh) and `home.css` derives every step from it, so it plays the same in every browser; with reduced motion, or without script, it is one still screen with the words at the edges and the names between them. Below 1024px, or on a portrait screen, the words sit above the names and the pair is centred. Hover, or keyboard focus, turns a name accent maroon; keyboard focus also shows the finished screen at once, and on touch screens each name is at least 44px tall. Text-light sections (the About page) use `.screen--compact`, which caps the section's minimum height at 40rem so a few lines are not surrounded by a screen of empty space. Text and image never repeat the same split layout three times in a row.

## Elevation and shapes

Depth comes from rules and surface steps, not shadows. Corners are square (`none`, `2px`) except buttons and chips, which are pill-shaped (`999px`). Do not introduce a third corner style.

## Components

- **Button.** Pill. Primary is cream on maroon, secondary is a maroon outline, inverse is cream on maroon or over photos. Pressed state scales to 0.97. Labels are specific ("Let’s talk", not "Submit").
- **Link.** Underlined, 1px, thickens and turns accent on hover. On touch screens each link has a 44px hit area.
- **Header.** One line, 72px on desktop, on every page: the menu on the left (Projects, Services, About; there is no sign-in or account control, because the site has no accounts), the logo in the centre (the brand kit's ARCHIÓ wordmark alone: maroon, or cream while the header is clear over a photo; the client chose the wordmark without the submark) and the "Let’s talk" button, with an arrow, on the right. Below 1024px the same three-column bar holds a circular Menu button on the left, the logo in the centre and "Let’s talk" on the right: the full button with its arrow from 640px, and on phones a borderless, transparent 44px button holding only a paper-plane icon (the "Let’s talk" label stays as its accessible name). The open phone menu mirrors the bar, with a circular close button where Menu was and the logo staying centred. On the home page the header stays clear over the hero photo until the Our Approach section reaches it, then turns solid beige; project pages do the same until the project facts reach the header. The project hero's dark gradient is deep at the top as well as the foot, so the cream links stay at 6:1 or better over the brightest parts of every cover (measured on all three). The central home wordmark scrolls up as one unit, scales onto the header wordmark (the same artwork) and fades into it; scrolling back reverses the transition. A full-screen menu opens from the Menu button. Below 640px the hero has no call-to-action button.
- **Hero.** The full-screen, morphing project photos run up behind a clear header (white text and wordmark; solid beige once the page scrolls). The large ARCHIÓ wordmark in the middle, on its own without the submark, with the studio descriptor under it, between two thin rules. The descriptor moves upward and fades out as scrolling begins; with reduced motion it stays visible. The whole central wordmark travels and scales as one unit onto the header wordmark, then fades into it. Scrolling back reverses the motion. With reduced motion the central wordmark stays in place and visible. A featured-project block (place, "View project" with an arrow) sits at the bottom left, and a round pause / play button (44px, thin cream outline) at the bottom right, because the photos change by themselves (WCAG 2.2.2); it is hidden with reduced motion, when nothing moves. A soft radial scrim keeps the centre of the photos bright; darker top and bottom edges preserve contrast for the header and featured-project text. No zoom effect. Photos are pulled back a little from a full-screen crop so more of each shows. With reduced motion the slideshow does not start by itself. On the home page the loading screen stays up until the first photo is on screen, so the hero is never revealed as a black box; it leaves after 4 seconds at the latest, whatever happens to the photo. The photos are drawn only while one dissolves into the next; between dissolves the still picture is left on screen rather than redrawn every frame, which kept phones busy for nothing.
- **Eyebrow label.** A small uppercase label (`.eyebrow t-label`) above a heading, list or card title: "Our approach", "Our consultancy-led process ensures:", "Get started", and each project's category on its card. In the Approach section the process numbers (01–04) use the same body size and font as the points beside them. Ink at 75% opacity, which measures 6.8:1 on beige and 7.9:1 on the maroon band; do not go lighter.
- **Project card.** Photo, uppercase title, one small meta line. No overlays or badges on the photo.
- **Project detail gallery.** Photos sit in paired frames; desktop alternates wider and narrower images so each row uses the full grid without empty columns, while smaller screens keep the simpler responsive grid.
- **Call-to-action band.** Rose, at the end of Home, Services, About and project pages. A small label ("Get started") over a full-width hairline; below it the display heading on the left, its last word in the accent maroon, and on wide screens a vertical hairline, then the text and the maroon "Let’s talk" button with an arrow on the right. No photo.
- **Footer.** Maroon, as tall as its content, under the page's rose call-to-action band, left-aligned: the brand kit ARCHIÓ wordmark in cream (about 19rem wide) with a one-line description of the studio under it; then four columns from 900px (two to a row on phones, brand and contact full width): "Contact" (the email in the display font at h3 size, and the phone), "Studio" (Projects, Services, About; Contact is not repeated, the header and the closing band lead there), "Legal" (Privacy notice, Terms of service, Cookie policy) and "Follow" (Instagram). Column labels are caption-size, softened cream. After a hairline, the copyright on the left and Beracah Trading on the right (stacked on phones).

## Motion

Motion explains what is new, nothing more. Everything animates `transform` and `opacity` only and uses the one ease-out curve above.

| Effect | Duration | Notes |
| --- | --- | --- |
| Button press | 150ms | scale 0.97 |
| Link / colour change | 150ms | colour only |
| Section reveal | 600ms | rises 24px, once per element |
| Card and gallery reveal | 900ms to 1000ms | rises 40px, staggered, classes removed after settling |
| Page change | 700ms | new page eases in; not replayed for filter-only changes |

The loading screen (`client/src/styles/preloader.css`, shown before the app starts, once per browser tab: a reload or a later visit in the same tab skips it, see `client/public/preloader-gate.js`) uses a full-screen, cover-cropped architectural background (`client/public/images/preloader-architecture.webp`) beneath its existing intro: the logo mark fades in, the letters of ARCHIÓ rise one after another, and a hairline sweeps beneath them. Once loading finishes, the whole screen fades out over 300ms and is removed. The mobile crop favors the curved opening.

One deliberate exception to the rules above, explained in a comment in that file:
- The screen sits at `opacity: 0.999`, not 1. Browsers skip painting what is behind a fully opaque layer, so the hero was only drawn once the curtain began to lift and showed black for a few hundred milliseconds. At 0.999 it looks identical and the hero is already painted when revealed. Do not "tidy" this back to 1.

Reduced motion disables the intro animations, and the reveal classes are never added, so content is never hidden. The loading screen fades out without sliding in either mode.

## Do's and don'ts

- Do keep one accent, one typeface, one theme per page.
- Do let photographs lead and keep copy short.
- Do keep every tap target at least 44px on touch screens.
- Don't add gradients, glass effects, drop shadows on cards, or badges over images.
- Don't use pure black, pure white or grey, bounce or elastic easing.
- Don't change route slugs, navigation labels, form field names, the logo or the legal copy without sign-off.

## Responsive behavior

Layout is fluid from 320px to 1920px (checked at nine widths with no horizontal overflow). Below 1024px the desktop nav collapses to a menu button on the left of the header (logo centred, never swapped back to the left). The project preview panel and the scroll-highlight effect only run on wide screens (the preview panel from 1024px).

## Known gaps

- The project photos are 707 to 800px wide, so the hero gallery and the project covers are soft on large and high-density screens (13 of 13 photos on a project page at 3x). `npm run images` already makes smaller steps and a `srcset` for any photo wider than 800px, so supplying 1600 to 2400px originals is all that is left to do.
- There is no dark mode; the site is intentionally light, closing with a rose call-to-action band and the maroon footer.
- Project categories in the portfolio data are Residential, Commercial and Landscape only.
- One sentence of client copy uses an em dash (`constants/content.js`); left as written pending client approval.
