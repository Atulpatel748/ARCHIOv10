# 02 — Reference Website Analysis

**Sites studied:** [woodandweave.ae](https://woodandweave.ae/) (W&W) and [yodezeen.com](https://yodezeen.com/) (YODEZEEN)
**Date of study:** 2026-10-25
**Purpose:** learn what makes these two references work and what to avoid, then turn that into *principles* for ARCHIÓ. This is analysis only. Nothing here asks ARCHIÓ to copy a layout, a line of copy or an asset from either site.

---

## How to read this document

| Mark | Meaning |
|---|---|
| **[C]** Confirmed | Seen directly in this session: the DOM, a computed style, `document.getAnimations()`, Resource Timing, response headers, cookies/storage, or a cited screenshot. |
| **[I]** Inferred | A reasoned conclusion from confirmed evidence (for example, a library recognised by its class names) that was not proven directly. |

Screenshots live in [`evidence/`](evidence/). `wnw-*` are Wood & Weave, `ydz-*` are YODEZEEN. The suffix gives the viewport width (`-1440`, `-1024`, `-768`, `-390`). An index is in [Appendix A](#appendix-a--evidence-index).

### Method

- Tool: the Claude desktop app's built-in Chromium browser pane, with viewport emulation at **1440×900**, **1024×768**, **768×1024** and **390×844** (touch/mobile UA at 390). DPR 1. Reset to the pane's own size afterwards.
- Walk on each site: home top to footer, menu open and close, project listing, one project detail, services, about/founders, contact/enquire, footer, a 404 URL.
- Measurements came from `getComputedStyle`, `getBoundingClientRect`, `document.getAnimations()`, CSS rule walks over `document.styleSheets`, `performance.getEntriesByType('resource' | 'navigation')`, `fetch` of response headers, and storage/cookie reads.
- **No forms were submitted. No cookie notice was accepted.** W&W's "Skip intro" was pressed once (at 390 px); everything else was observed passively.
- W&W ships explanatory comments inside its public inline `<script>` tags. These are part of the delivered page, so statements drawn from them are marked [C] and paraphrased. No private source code was accessed.
- **Second pass merged (27 Oct).** The parent session ran its own pass: 31 screenshots in [`evidence/pass2/`](evidence/pass2/) and mobile at **375×812**. Its findings are merged below and tagged *(pass 2)*, keeping the Confirmed/Inferred status it reported.
- **Conflicts were re-checked on 27 Oct.** The W&W menu focus was re-checked live. The browser's script tool then failed with a temporary policy error, so the rest of the re-check fetched the public HTML, CSS and JS bundles with `curl` and searched them. That covered reduced-motion checks, library fingerprints and the 50 % caption colour.

### Caveats (read before trusting a number)

1. **Animation timing.** While the browser pane was hidden, `requestAnimationFrame` ran at about **2 frames per second** (measured). JS-driven sequences (W&W's intro, scroll scenes) therefore ran far slower than on a real device. All durations and easings below come from CSS values and `getAnimations()` timing objects, **not** from stopwatch timing. Intro lengths are described qualitatively.
2. **Page weight.** "Transferred" figures are Resource Timing sums at the moment of measurement, after some scrolling and with lazy loading in play. They are indicative, not benchmarks.
3. **Screenshots** at 1440 are downscaled to 800 px wide. A few (`ydz-24`, `wnw-30`) carry grey margins from the pane resizing mid-capture.
4. The screenshots are third-party material, kept **for internal research only**. They must not be published or reused in ARCHIÓ's site or decks.

---

## 1. Wood & Weave (woodandweave.ae)

### 1.1 Snapshot

| Item | Finding | |
|---|---|---|
| Positioning | Founder-led residential interior **design and build** in Dubai, sold as one contract from first drawing to handover. Two named founders on every project. | [C] |
| Framework | Astro: `/_astro/` hashed assets, `astro-xxxx` scoped classes, per-component `*.astro_astro_type_script_*` modules. | [C] |
| Hosting | Netlify (`server: Netlify`, `x-nf-request-id`). | [C] |
| Security headers | Strict CSP with script **hashes**; HSTS `max-age=31536000`. | [C] |
| Smooth scroll | Lenis (`html.lenis`). | [C] |
| Scroll scenes | GSAP with ScrollTrigger, bundled and not global (`window.gsap` is undefined). `gsap.COWrDQt7.js` is 70,179 B; `core.CHGydMoP.js` is 62,302 B and bundles Lenis plus ScrollTrigger. `.pin-spacer` elements appear in the DOM. | [C] (re-check; matches pass 2) |
| JS weight | About **359 KB** of JS transferred on the home page, including GTM, gtag, the Meta pixel and Clarity *(pass 2)*. | [C] |
| Fonts | Cormorant Garamond 300/400/500 + 400 italic; Archivo 400/500/600; self-hosted WOFF2 with 3 preloads and metric-matched fallbacks (`"Archivo Fallback"`). | [C] |
| Pages | `/work/` `/services/` `/approach/` `/vastu/` `/about/` `/founders/` `/enquire/`. Home is 11 sections. | [C] |
| Home length at 1440 | **35,212 px**, about 39 viewports. | [C] |

### 1.2 Experience

**Arrival: the intro gate.** Every visit to the home page opens on a full-screen overlay (`.intro-overlay`, `z-index: 200`, `clip-path` reveal). A dark field holds a copper wax-seal image and four lines of manifesto copy, revealed one at a time, with a "Skip intro" button bottom right ([wnw-01](evidence/wnw-01-intro-seal-1440.jpg)) [C]. The header is `inert` until the intro ends [C]. The page's own inline script says the sequence plays on **every** home visit, is skipped only for automated browsers (`navigator.webdriver`), and has a 15-second failsafe that applies only if the sequence never starts [C]. At 390 px the first two seconds showed an empty dark screen with only "Skip intro" ([wnw-26](evidence/wnw-26-intro-blank-390.jpg)) [C]. In this session's throttled pane the sequence did not finish within 30 s, which is an artefact of the environment (caveat 1).

*Pass 2* measured it on a fresh 375×812 load. The gate stayed up for about **7.8 s** after navigation (until "Skip intro" left the DOM), and the first ~3 s were a blank dark screen before the seal appeared [C] ([pass2/wnw-15](evidence/pass2/wnw-15-mobile-intro.jpg)). Pass 2 described the gate as returning per session. The evidence here points to **every home visit**: the inline script says so, and it appeared on all four home loads within one tab session in this pass [C]. The two readings agree that a returning visitor sees it again.

**Home narrative** (scroll order) [C, section list from DOM]:

1. **Hero** (`data-theme="ink"`, 900 px): a light-beam scene drawn on canvas (a `HeroLight` module, 2 canvases) [I]. A large light serif headline with one italic copper phrase, a 20 px lede and two CTAs, "See the work" and "Begin with a conversation" ([wnw-02](evidence/wnw-02-home-hero-1440.png)).
2. **Position** (paper, 3,240 px pinned): a line-drawn house elevation builds up in five labelled stages, shell to lived-in, beside the brand's position statement ([wnw-03](evidence/wnw-03-position-plan-study-1440.jpg), mobile [wnw-28](evidence/wnw-28-plan-study-390.jpg)).
3. **Film** (ink): a 1 min 36 s founders' film in a custom player frame (`brand-film-av1.mp4`, not autoplay, `playsinline`) ([wnw-04](evidence/wnw-04-brand-film-header-overlap-1440.jpg)).
4. **Pillars** (ink/wood, **12,130 px** pinned): Interior design / Craft / One contract, each with an animated plan drawing and a sub-list ([wnw-05](evidence/wnw-05-pillars-pinned-1440.jpg)). The section opens with a "weave" diagram: three threads, one per discipline, twist into a single rope labelled "One contract", which is the brand name drawn as a diagram ([pass2/wnw-03](evidence/pass2/wnw-03-weave-diagram.jpg)) [C].
5. **Covers** (3,600 px): an exploded axonometric of a villa beside a numbered list of the scopes one contract covers, captioned as a diagram ([pass2/wnw-04](evidence/pass2/wnw-04-one-contract-axonometric.jpg)) [C]. This section says a full home is **seven** kinds of work, while the Services H1 says **six** [C]. See §6 #19.
6. **Halves** (paper): the two founders as cut-out portraits in arched frames ([wnw-06](evidence/wnw-06-founders-halves-1440.jpg)).
7. **Flagship** (wood): a project teaser with a spec card ([wnw-07](evidence/wnw-07-flagship-teaser-1440.jpg)).
8. **Process** (4,140 px): a horizontal, scroll-driven timeline of line-icon cards with a progress rule ([wnw-08](evidence/wnw-08-process-horizontal-1440.jpg)).
9. **Vastu** (stone): a compass and nine-square orientation diagram, captioned as a diagram rather than a project ([wnw-09](evidence/wnw-09-vastu-diagram-1440.jpg)).
10. **Ask**: an AI question box with suggested questions and an explicit disclosure that answers come from an assistant working only from published material ([wnw-10](evidence/wnw-10-ai-concierge-1440.jpg)).
11. **Instagram** strip, then the **footer**: an arched "door" whose light comes on as it reveals a "Begin with a conversation" CTA and a wax seal, flanked by studio address, phone, WhatsApp and site links ([wnw-11](evidence/wnw-11-footer-arch-1440.jpg) → [wnw-12](evidence/wnw-12-footer-arch-lit-1440.jpg)).

**Menu.** A 52 px circular copper toggle opens a full-screen ink panel. Large serif links sit on the left; a small "Tell us about the home" block with a CTA and contact links sits on the right ([wnw-13](evidence/wnw-13-menu-open-1440.jpg)). On hover a link turns copper and shifts right ([wnw-14](evidence/wnw-14-menu-hover-1440.png)) [C]. On open, `aria-expanded` turns `true`, `<header>` and `<main>` become `inert`, and focus moves to the menu's own logo link (`.menu__mark`, inside the dialog). `Escape` closes the menu, sets `aria-expanded="false"` and returns focus to the toggle [C, re-checked 27 Oct]. *Pass 2* reported focus staying on "the logo link". That is the same `.menu__mark` element inside the menu, not the header logo, so the two observations agree. Mobile menu: [pass2/wnw-17](evidence/pass2/wnw-17-mobile-menu.jpg).

**Work listing.** The page opens on a leather-bound "book" with a wax-seal cover. A view switch offers **Book / Full screen** (`?view=book|full`), with tabs for seven homes ([wnw-15](evidence/wnw-15-work-book-1440.jpg), [pass2/wnw-10](evidence/pass2/wnw-10-work-index.jpg)) [C]. The index states that every item is labelled for what it actually is, and *pass 2* recorded four status labels: "Design and build, completed", "Designed, Build Starts in January 2027", "Complete design" and "In progress" [C]. Below sits "more of the work, room by room": a filterable masonry of rooms (All / Living / Dining / Bedrooms / More spaces) ([wnw-16](evidence/wnw-16-work-room-masonry-1440.jpg)). Each tile opens a native `<dialog>` lightbox with Close / Previous / Next, keyboard arrows and a room caption ([wnw-17](evidence/wnw-17-work-lightbox-1440.jpg)) [C].

**Project detail** (Elie Saab, Arabian Ranches 3; 8,049 px). A pinned full-bleed hero with a status line "Complete design" ([wnw-18](evidence/wnw-18-project-hero-1440.jpg)). Then an idea statement, a facts list (Where / Rooms / Area / Outdoors / **What it is**), CTAs, and room-by-room sections that alternate image and text, each with a one-line serif headline and a short paragraph ([wnw-19](evidence/wnw-19-project-room-1440.jpg)). It closes with "All the work" and "Next project" [C]. The imagery reads as CGI visualisation, and the page labels it "Complete design" rather than built work [C for the label, I for the CGI].

**Services.** A full-bleed hero introduces "six kinds of work, one contract" ([wnw-20](evidence/wnw-20-services-hero-1440.jpg)). A tour of six services follows, each with a project image carrying **annotation hotspots** (for example ceiling, arch, niches) and a list of deliverable chips ([wnw-21](evidence/wnw-21-services-hotspots-1440.jpg)). Further down: three engagement models (design and build, design only, execution only), Vastu, and **published cost and time ranges** drawn as bars on a 0–10-month axis ([wnw-22](evidence/wnw-22-services-cost-ranges-1440.jpg)) [C].

**Founders.** A cut-out duo portrait with a copper ampersand line drawing ([wnw-23](evidence/wnw-23-founders-1440.jpg)). Below: two career timelines, how the founders met, and Person JSON-LD for both [C].

**Enquire.** A two-column page: an editorial explanation on the left, the form on the right ([wnw-24](evidence/wnw-24-enquire-form-1440.jpg)) [C].

**404.** A warm, on-brand page that suggests the work, the home page and a conversation ([wnw-25](evidence/wnw-25-404-1440.jpg)). It returns HTTP **404** with `noindex, nofollow` [C].

**Mobile (390).** The header keeps the mark and the menu toggle; the "Enquire" link is hidden (`display:none`) and replaced by a **floating pill**, "WhatsApp us | Enquire now" (257×48 px, two 40 px-tall links) [C]. The hero headline drops to 41.6 px. The plan-study stages wrap under the drawing ([wnw-27](evidence/wnw-27-home-hero-390.jpg), [wnw-28](evidence/wnw-28-plan-study-390.jpg)).

### 1.3 Micro-details (measured)

**Design tokens** (from `:root`) [C]

| Group | Values |
|---|---|
| Colour | paper `#f2eee6`, paper-2 `#e8e2d6`, paper-3 `#dcd4c6`, ink `#1a120e`, ink-soft `#4c3b33`, wood `#48281d`, copper `#a2653c`, copper-light `#c08b5c`; section themes `ink / paper / wood / stone` set by `data-theme` |
| Radius | `0` (square everywhere except the round menu toggle and pill filters) |
| Layout | `--container: 90rem` (1440 px); `--gutter: max(clamp(1.25rem, 4.5vw, 4.5rem), env(safe-area-inset-*))`; `--header-h: 5rem`; measures `68ch` / `44ch` (narrow) / `74ch` (serif) |
| Type scale | `--fs-hero: clamp(2.6rem, min(1.6rem + 3.2vw, 9.5vh), 4.75rem)` (note the **vh cap**); `--fs-display: clamp(2.25rem, 1.5rem + 2.4vw, 3.75rem)`; `--fs-h2: clamp(1.9rem, 1.35rem + 1.7vw, 3rem)`; `--fs-h3: clamp(1.4rem, 1.2rem + .6vw, 1.85rem)`; `--fs-lead: clamp(1.0625rem, 1rem + .35vw, 1.25rem)`; `--fs-small: .8125rem` |
| Rhythm | `--lh-body: 1.62`, `--lh-display: 1.02`, `--lh-quote: 1.24`; `--ls-display: -.003em`, `--ls-sans: -.008em`, `--ls-wordmark: .3em` |
| Spacing | `--s-1` … `--s-10` = .25 / .5 / .75 / 1 / 1.5 / 2 / 3 / 4.5 / 7 / 10 rem |
| Motion | `--t-fast: .32s`, `--dur: .42s`, `--t-slow: .9s`; `--ease: cubic-bezier(.2,.7,.2,1)`, `--ease-out: cubic-bezier(.16,1,.3,1)`, `--ease-in-out: cubic-bezier(.77,0,.18,1)` |

**Typography at 1440** [C]

| Role | Family | Size / line-height | Weight | Tracking | Colour |
|---|---|---|---|---|---|
| Hero H1 | Cormorant Garamond | 71.68 / 73.11 px (1.02) | 300; italic accent 400 | −0.72 px (−0.01em) | `#f2eee6`, accent `#c08b5c` |
| Work page H1 | Cormorant Garamond | 152 / 136.8 px (0.9) | 300 | −4.56 px (−0.03em) | paper + copper italic |
| Section H2 | Cormorant Garamond | 46.08 / 49.77 px | 300 | −0.46 px | paper or ink |
| Large H2 / H3 | Cormorant Garamond | 58.56 / 60.9 px | 300 | −0.59 px | |
| Person name H3 | Cormorant Garamond | 27.84 / 33.41 px | 300 | −0.14 px | |
| Menu links | Cormorant Garamond | 56 / 62.72 px | 300 | −0.08 px | |
| Body | Archivo | 16 / 26.4 px (1.65) | 400 | −0.08 px | ink `#1a120e` |
| Lede | Archivo | 20 / 32 px | 400 | −0.08 px | paper at 64 % |
| Eyebrow / label | Archivo | 13 / 21.45 px | 500 | +0.13 px | 62–64 % alpha |
| Button | Archivo | 15 / 24.75 px | 500 | +0.225 px | `#fbf5ec` on copper gradient |
| Header "Enquire" | Archivo | 14 px | 500 | +0.21 px | |
| Wordmark | Cormorant Garamond | 14 px | 500 | +4.2 px (0.3em) | |

Hero/display H1 by width: **41.6 px @390** (pass 2 also 41.6 px @375), **50.18 px @768** (project page), **58.37 px @1024** (services), **71.68 px @1440×900** [C].

*Pass 2* measured the desktop H1 at 69.7 px. That is consistent, not a conflict: `--fs-hero` is capped at `9.5vh`, and 69.7 px is what the cap gives on a viewport about 734 px tall [I]. The hero size therefore drops on short laptop screens by design. Pass 2's "Archivo 13 px" is the label/eyebrow role. Running body text is 16 px [C].

**Contrast of the muted text roles** [C]

| Text | Colour | Ratio | Note |
|---|---|---|---|
| Hero lede and eyebrow | paper at 64 % (`#f2eee6a3`) on ink | 7.03:1 | Passes AA |
| Hero caption `.hero-light__note`, enquiry hint `.enq__hint` | paper at 50 % (`#f2eee680`) on ink, 13 px | **4.73:1** | Passes AA, narrowly (pass 2's "hero subtext") |
| Labels and eyebrows on paper | ink at 62 % | 4.90:1 (pass 2: 4.91) | Passes AA, narrowly at 13 px |
| Copper-light accent on ink | `#c08b5c` | 6.24:1 | Passes |
| Copper on paper, or paper on copper | `#a2653c` / `#f2eee6` | **4.07:1** | Large text only; fails at 14 px (pass 2 [I], computed here [C]) |
| Button text `#fbf5ec` on the copper gradient | top / middle / bottom stops | 3.95 / 5.51 / 6.98:1 | Text sits at the vertical middle, so effectively about 5.5:1 [I] |

**Header and logo** [C]

- `position: fixed`, **80 px** tall, transparent, no `backdrop-filter`. Transition `translate .7s cubic-bezier(.16,1,.3,1)`, so it hides on scroll [I].
- Mark: monogram **35×18 px**, a hairline rule, then a two-line wordmark 157 px wide. Link box 222×80 px at x = 65.
- Menu toggle **52×52 px**, `border-radius: 50%`, copper gradient with inset highlight/shadow; `scale .6s` and `border-color .32s` transitions.
- A small script samples the section under the header (`elementsFromPoint`) and toggles an `over-wood` class to recolour header items [C]. It does **not** add a scrim, which leads to the overlaps in §6.

**Layout and grid** [C]

| Context | Measured |
|---|---|
| Container | max 1440 px; side padding **64.8 px @1440**, 46.08 @1024, 34.56 @768, 20 @390 |
| Position section | 2 columns, 604.5 + 604.5 px, gap 86.4 px |
| Hero foot | 743.7 + 523.7 px, gap 28 px |
| Film header | 705 + 504 px, gap 86.4 px |
| Room masonry (`/work/`) | CSS multi-column, `column-count: 3`, gap 20.8 px, inside 1295 px |
| Breakpoints | `48em` (768) and `64em` (1024), plus **height** queries (`37.5em` = 600 px, `54em` = 864 px, and 680/700/760/800/860 px) for the pinned scenes |

**Imagery** [C]

- Every home `<img>` is WebP via Astro's image pipeline with `srcset` (e.g. 640/960/1280 w) and `sizes` (16 of 18). All 18 are `loading="lazy"` and `decoding="async"`. Six `<picture>` elements.
- The project hero is the only `fetchpriority="high"`, `loading="eager"`, `sizes="100vw"` image, at 16:9 (1.78).
- Aspect ratios in use: **1.78** (hero and most room tiles), **1.33** (some tiles), founders as transparent cut-outs with `object-fit: contain` [C]. Six 0.75 portrait cards (259×346) sit near the end of the home DOM, most likely the Instagram strip [I].
- Images reveal by `scale` over **1.2 s** `cubic-bezier(.16,1,.3,1)` [C]. Until revealed, the image area is blank paper ([wnw-29](evidence/wnw-29-project-header-overlap-768.jpg) shows the state just after).
- Film grain and texture come from inline SVG `feTurbulence` data-URI backgrounds layered with gradients, with no image download [C].

**Motion inventory** [C]

| Element | Property | Duration | Easing |
|---|---|---|---|
| Menu panel | `clip-path` inset reveal; `visibility` delayed .9 s on close | 900 ms | `cubic-bezier(.77,0,.18,1)` |
| Menu items | `opacity` / `translate` stagger | 500 / 700 ms | `cubic-bezier(.16,1,.3,1)` |
| Menu link hover | `color` / `translate` | 320 / 520 ms | `cubic-bezier(.16,1,.3,1)` |
| Header | `translate` | 700 ms | `cubic-bezier(.16,1,.3,1)` |
| Filter pills | colour, border, background / `scale` | 300 / 200 ms | `cubic-bezier(.16,1,.3,1)` |
| Image reveal | `scale` | 1,200 ms | `cubic-bezier(.16,1,.3,1)` |
| Ambient loops | `cue` (scroll cue), `film-halo`, `vs-flow` (Vastu), `cg-pulse` (concierge) | 2,400–2,800 ms | linear, infinite |
| Intro | GSAP-style timeline on seal, glow and copy | not measurable here (caveat 1) | |

**Reduced motion:**
- **0** `prefers-reduced-motion` rules in any stylesheet or in the inline HTML [C; matches pass 2].
- The only check anywhere in the JS is one `matchMedia('(prefers-reduced-motion: reduce)')` inside the bundled Lenis class in `core.CHGydMoP.js` [C]. It is Lenis's own setting, so it can affect smooth scrolling but not the site's scenes, intro or reveals [I].
- The inline script says the OS reduce-motion setting is intentionally not followed (a client decision dated 17 Oct 2026). Only a `?tier=reduced` URL parameter shows the still state [C].

### 1.4 Storytelling and conversion

- **Voice.** Calm, candid, second person, with short declaratives and one italic copper phrase per headline. It leans on honesty claims: work "labelled for what it is", "ranges, not quotes", and the AI assistant that says it is not the founders [C].
- **Proof.** Named founders with career timelines, a founders' film, a flagship villa, seven homes with plain status labels ("Complete design", "Designed, build starts in January 2027", "Design and build, completed", "In progress") [C].
- **Cultural fit.** A dedicated Vastu page and section offered as an option, with a partnered consultant [C]. A strong signal for its audience.
- **CTA system.** The primary CTA is "Begin with a conversation" (→ `/enquire/`), repeated in hero, sections, menu, project pages and footer. Secondary: WhatsApp (`wa.me`), phone, email. On mobile: the floating "WhatsApp us | Enquire now" pill [C].
- **Enquiry form** (`POST /api/enquire`) [C]:
  - 14 fields plus a honeypot (`company`, labelled "Leave this empty", `autocomplete="off"`). The custom-budget input is one of the 14 [C; matches pass 2].
  - Only **two are `required`**: project stage and start timeline. The intro asks for "a way to reply".
  - Qualifiers: property type, emirate, community, handover date, sqft, budget range (AED 100k–300k up to 5M+, or custom), scope (design and build / design only / execution only / not sure).
  - `autocomplete` set on name, tel and email. Mobile prefilled `+971`.
  - Fields are 52 px tall, 20 px serif input text, a 13 px label above, a bottom rule only, radius 0.
  - Submit 54 px, copper gradient, radius 4 px. No CAPTCHA widget.
- **AI concierge.** `POST /api/concierge` with a single `question` input, five suggested questions and a privacy link [C].
- **Price transparency.** Three cost bands with durations on Services [C].

### 1.5 Technical

**Meta and structured data** [C]

- Title pattern `Page · Wood & Weave`; description; `canonical`; `theme-color #1A120E`; `color-scheme: light`.
- OG: title, description, type, site_name, `og:locale en_AE`, url, image **1200×630**. `twitter:card summary_large_image`. Project pages use their own hero JPG as `og:image` and a facts-based description.
- JSON-LD on every page: `Organization` (legal name, logo, email, phone, `areaServed` Dubai, `sameAs` Instagram, Facebook, LinkedIn) and `LocalBusiness` (street address, `knowsAbout`). `BreadcrumbList` on inner pages. `Person` ×2 on `/founders/`.

**Third parties** [C]

- Google Tag Manager `GTM-N4NJK4HS`, GA4 `G-VL6HKZTGEX`, Microsoft Clarity, Meta Pixel (with a `facebook-domain-verification` meta).
- Cookies present without any notice: `_ga`, `_ga_*`, `_fbp`, `_clck`, `_clsk`. No consent element in the DOM.
- The inline consent script says the site moved to a **"none" mode on 14 Oct 2026**: no notice, tags load for every visitor. Google Consent Mode v2 is still wired. Tags load after first paint and idle, or on first interaction.
- Preview and local hosts never load tags.

**Accessibility** [C]

- Skip link to `#main`.
- The menu is `role="dialog" aria-modal="true"` and makes everything behind it `inert`. Focus moves into the menu and returns to the toggle.
- The lightbox is a native `<dialog>` with labelled Close / Previous / Next, initial focus on Close, and arrow keys.
- Room buttons have descriptive labels ("View this living room full screen"). Form controls have real `<label>`s.

**Performance indicators** [C]

- On the 404: TTFB 397 ms and DOMContentLoaded 489 ms from this location; HTML 19 KB.
- On the home page, 51 requests and about 331 KB at the time of sampling (23 JS chunks, 7 WOFF2, 3 WebP fetched by then).
- Non-critical CSS is deferred until the first paint (`link[data-defer-css]`, `css-ready` class).

---

## 2. YODEZEEN (yodezeen.com)

### 2.1 Snapshot

| Item | Finding | |
|---|---|---|
| Positioning | International architecture and interior studio (founded 2010). Offices or representatives in London, Miami, Dubai, Warsaw, Kyiv and Milan. Sector verticals: hotels and resorts, private jets, public spaces, residences, restaurants, yachts. | [C] |
| Framework | Nuxt 3 / Vue: `window.__NUXT__`, `/_nuxt/` chunks, `data-v-*` scoped attributes, `x-powered-by: Nuxt`. | [C] |
| CMS / media | Media on `cdn.yodezeen.com` with `thumbnail_` / `small_` variants and `name_hash.ext` naming, typical of Strapi. Runtime config points to `api.yodezeen.com`. | [C] naming and config; [I] Strapi |
| Hosting | Cloudflare (`server: cloudflare`, `cf-ray`), Cloudflare Web Analytics beacon. | [C] |
| Security headers | **No CSP** and **no HSTS** on `HEAD /`. | [C] |
| Smooth scroll | Lenis (`html.lenis`). | [C] |
| JS libraries | GSAP, Lenis and Swiper in the loaded chunks *(pass 2)*. The `swiper-icons` font face is also declared. | [C] |
| Canvas | Home `.projects-canvas` (1440×900) has a **2D** context. The `/projects` **Immersive** view uses a **WebGL2** context. | [C] |
| Fonts | HelveticaNeueCyr 400/500/700 (body), NeueHaasDisplayPro 400/600/700 (display, nav), FormaDJRBanner 700 (city clocks), DINProCond 500. All commercial faces. | [C] fonts; [I] licensing |
| Home length at 1440 | **28,198 px** (about 31 viewports). About page **33,803 px**. | [C] |

### 2.2 Experience

**Arrival: the preloader.** A full-screen, muted, `playsinline` video plays first: a jungle fly-through, **9.0 s** long (`duration` read from the element). It uses `1_….mp4` on desktop and a vertical `2_….mp4` on mobile, with a preloaded PNG poster and a small "SKIP" pill ([ydz-01](evidence/ydz-01-preloader-video-1440.jpg), [ydz-20](evidence/ydz-20-preloader-390.jpg)) [C]. It played again on a second visit even though `localStorage.visited = "true"` [C]. *Pass 2* adds the following ([pass2/ydz-01](evidence/pass2/ydz-01-intro-video.jpg)):
- The desktop video is **4K (3840×2160)** [C].
- Scroll is locked at 0 while it plays [C].
- It replays on every visit to `/` [C].
- The Skip button is **48×21 px** on desktop, below the WCAG 2.2 24×24 px minimum target, and 93×34 px on mobile [C].
- With the pane displayed, pass 2's video had still not cleared 30 s after navigation. Wheel input did not move the page; only SKIP released it [C].
- In this pass it cleared on its own within about 15 s at both 1440 and 390, with no Skip (from screenshot timestamps) [C].
- So the gate seems to wait for the video to end, and a stalled or blocked playback leaves visitors trapped until they find a 48×21 px button [I]. ARCHIÓ should avoid any gate whose release depends on media playback.

**Home narrative** [C]

1. **Hero** (900 px): full-bleed resort visual, a 12 px uppercase nav split around a centred logo, the project name and place bottom-left, and the cookie notice bottom-right ([ydz-02](evidence/ydz-02-home-hero-cookie-1440.jpg)). The hero source is an image sequence (`/sequence/desk3/frame_0001.jpg`, mobile `/sequence/mob2/`), so a scroll-scrubbed frame sequence is likely [I].
2. **About statement** (1,800 px): words fade from grey to ink one by one as you scroll ([ydz-03](evidence/ydz-03-scroll-word-reveal-1440.jpg)).
3. **Info** (3,600 px): a black-and-white studio photo split against an uppercase studio statement and a "READ MORE" pill ([ydz-04](evidence/ydz-04-about-split-1440.jpg)).
4. **Projects** (**14,400 px**, pinned): a 2D-canvas carousel of full-bleed project visuals with centred project name, location and a "VIEW PROJECT" pill ([ydz-05](evidence/ydz-05-projects-canvas-1440.jpg)). Pass 2 caught the same project, Stillstone, in black and white ([pass2/ydz-07](evidence/pass2/ydz-07-stillstone-story.jpg)), where this pass saw it in warm colour. The canvas probably scrubs each visual from monochrome to colour as you scroll [I].
5. **"We do"** (1,350 px): giant words splitting apart to reveal sectors (residential, mixed use, hospitality, commercial, public spaces) ([ydz-06](evidence/ydz-06-we-do-sectors-1440.jpg)).
6. **Map** (4,140 px): a graticule world map with office pins ([ydz-07](evidence/ydz-07-world-map-1440.jpg)).
7. **Monograph** book promo, in 240 px display type. The book cover carries a "COMING SOON" pill, so the monograph is not yet available ([pass2/ydz-08](evidence/pass2/ydz-08-monograph.jpg)) [C].
8. **Contact/footer**: a stack of six city names in 80 px FormaDJRBanner, each with **live local time**. Dubai and Milan are honestly tagged "Representative". Then an IP notice, social icons and legal links ([ydz-08](evidence/ydz-08-footer-clocks-1440.jpg)). Hovering a city dims the others and expands its phone and address; a ring cursor follows ([ydz-09](evidence/ydz-09-footer-hover-cursor-1440.jpg)).

**Navigation and page transitions.** Desktop nav is three links left (projects, services, contact) and three right (about, career, LET'S TALK pill) around the logo. Clicking a link runs a **horizontal wipe**: the old page slides out to the left as the new one slides in ([ydz-10](evidence/ydz-10-page-transition-wipe-1440.jpg), captured mid-transition) [C]. CSS includes `.slide-in-right-enter-active { transition: transform .4s var(--third-ease) }` and `.fade-*` variants on `--transition: .5s ease-in-out` [C]. The site-wide transition is a wipe [C]; its exact duration was not measured [I].

**Projects listing** ([ydz-11](evidence/ydz-11-projects-masonry-1440.jpg)) [C]

- A centred title with ghosted sub-tabs ARCHITECTURE / INTERIOR DESIGN / LARGE SCALE.
- Filter row: All, **Completed, In progress**, then sectors, then a Location dropdown.
- An **IMMERSIVE** toggle and a **2 / 4** density switch.
- A masonry of 4 columns × 336 px with varied heights (420–504 px). The image scales to **1.02** on hover over 600 ms `cubic-bezier(.165,.84,.44,1)`, and the custom cursor shows "OPEN GALLERY".
- Immersive mode is a draggable field of images on a WebGL2 canvas, with depth blur at the edges and BACK / FILTERS pills ([ydz-12](evidence/ydz-12-projects-immersive-webgl-1440.jpg)).
- URLs carry the taxonomy in the path, e.g. `/projects/interior-design/residences&completed/bortok-residence`.

**Project detail** (Bortok Residence; 8,956 px) [C]

- A full-bleed hero with name and city bottom-left ([ydz-13](evidence/ydz-13-project-hero-1440.jpg)).
- A **fact strip**: design style, city with **coordinates** beside a line drawing of the country outline, "completed in 2025, residential project", and area in ft² ([ydz-14](evidence/ydz-14-project-facts-map-1440.jpg)).
- Long concept text in uppercase, a full-bleed image gallery, and a **team credit list** that names the photographer ([ydz-15](evidence/ydz-15-project-team-credits-1440.jpg)). Then a "Let's talk" block.

**Services** ([ydz-16](evidence/ydz-16-services-sectors-1440.jpg)) [C]. Six sector cards in two columns (Hotels & Resorts, Private jets, Public spaces, Residences, Restaurants, Yachts), each with a full-bleed visual, a white title and a "LEARN MORE" pill. Cards show grey gradient placeholders for 2–3 s before media appears.

**About** ([ydz-17](evidence/ydz-17-about-founders-1440.jpg)) [C]. A black-and-white founders portrait with giant "YODEZEEN" type, then "5 reasons" as pinned stat sections: 16 years, 70+ awards, 1200+ projects, 30+ partners, 8 offices (stats at 104 px), then the team.

**Contact.** `/contact` has no form: the city/clock list plus "NEW PROJECT REQUESTS: info@…" [C]. "LET'S TALK" opens `/connect-us`, a **multi-step** form. Step 1 asks first name, phone (with country code) and email, then NEXT. Fields show `*`, but none carries `required` ([ydz-18](evidence/ydz-18-connect-form-step1-1440.jpg)) [C].

**404.** A full-bleed landscape visual with "PAGE NOT FOUND", one line of help and "BACK TO HOME" ([ydz-19](evidence/ydz-19-404-1440.jpg)). HTTP **404**; title just "YODEZEEN"; no robots meta [C].

**Mobile (390)** [C]

- Header 75 px: round icon buttons (menu, contact) around a 108×21 logo. The buttons measure **42×42 px at 390** here and **40×40 px at 375** in pass 2. They scale with the viewport [I, consistent with the `--viewport` token]. Both sizes clear the 24 px minimum but fall short of the 44 px recommendation. Pass 2 views: [pass2/ydz-13](evidence/pass2/ydz-13-mobile-hero.jpg), [pass2/ydz-14](evidence/pass2/ydz-14-mobile-menu.jpg).
- The cookie notice covers roughly the bottom fifth of the screen ([ydz-21](evidence/ydz-21-projects-cookie-390.jpg)).
- The menu is full-screen with centred 48.88 px uppercase links, each 44 px tall ([ydz-22](evidence/ydz-22-menu-open-390.jpg)).
- Projects drop to **one column** (357 px wide at 390; 702 px at 768). Four columns hold from 1024 (235 px each, [ydz-24](evidence/ydz-24-projects-1024.jpg)).
- Breakpoints: essentially `max-width: 1023px` (444 rules) / `min-width: 1024px`, plus `(hover: hover)` guards.
- When the emulated touch device was in a landscape-shaped viewport, a full-screen **`.rotate-warning`** ("Rotate your phone for better experience") replaced the page ([ydz-23](evidence/ydz-23-rotate-gate.jpg)) [C]. It is rendered by a Vue component; that it triggers on touch + landscape is [I].

### 2.3 Micro-details (measured)

**Design tokens** (from `:root`) [C]

| Group | Values |
|---|---|
| Colour | bg `#e0e0e0`, light `#f3f3f3`, dark `#2d2a2a` (with 7/10/30/40/70 % alpha steps), dark-base `#212121`, pure white with 10–80 % steps |
| Easing | default `cubic-bezier(.24,1,.36,1)`; `--second-easing (.16,1,.3,1)`; `--third-ease (.22,1,.36,1)`; `--fourth-ease (.24,0,0,1)`; `--t-inOut (.76,0,.24,1)`; `--t-out (.25,1,.5,1)`; `--t-in (.5,0,.75,0)` |
| Durations | `--transition .5s ease-in-out`, `--transition-fast .3s`, `--transition-slow .8s`. Most common in CSS: 0.3 s (44×), 0.4 s (37×), 1 s (7×), 0.6 s, 0.8 s |
| Fluid scale | `--viewport: 1440`, `--viewheight: 800`, so sizes appear to be computed relative to a 1440×800 artboard [I] |
| Layering | z tokens for header (100 / 3000), cookie (101), preloader (99 / 9999), popup (5000), rotate-phone (9999) |

**Typography at 1440** [C]

| Role | Family | Size / line-height | Weight | Tracking | Case |
|---|---|---|---|---|---|
| Body default | HelveticaNeueCyr | 16 / 18.72 px (1.17) | 500 | +0.256 px (0.016em) | — |
| Nav links | NeueHaasDisplayPro | 12 / 12 px | 400 (LET'S TALK 500) | −0.144 px | UPPER |
| Project body copy | NeueHaasDisplayPro | **13 / 15.99 px (1.23)** | 500 | −0.156 px | UPPER, split per word |
| Fact strip | HelveticaNeueCyr | 12 / 12 px | 500 | −0.144 px | UPPER |
| Team names | HelveticaNeueCyr | **11 / 14.96 px** | 500 | −0.132 px | UPPER |
| Carousel project title | NeueHaasDisplayPro | 64 / 56 px | 600 | +0.256 px | UPPER |
| City clocks | FormaDJRBanner | 80 / 64 px (0.8) | 700 | +0.256 px | UPPER |
| Monograph display | NeueHaasDisplayPro | **240 / 192 px (0.8)** | 600 | −11.52 px (−0.048em) | — |
| About stats | — | 104 px | — | — | — |
| Mobile menu | — | 48.88 / 43.99 px | 600 | −1.47 px (−0.03em) | UPPER |

**Header and logo** [C]

- `position: fixed`, **72 px** tall (padding 16 px 25 px), transparent, no backdrop; `transition: transform .75s`, so it hides on scroll [I].
- Logo: inline SVG **112×22 px**, centred.
- LET'S TALK pill: 120×40 px. Its inner span carries `--text-left/--icon-left/--text-right/--icon-right` custom properties, so the text and icon swap sides on hover [I].
- Nav hover is a **text roll**: three stacked copies of each label inside the link, sliding up 12 px over **400 ms** `cubic-bezier(.22,1,.36,1)`.

**Grid** [C]: 24 px side padding (1392 px content at 1440); 4-column masonry (336 px) with about 16 px gaps; 235 px columns at 1024; a single column at 768 and below.

**Imagery** [C]

- Project cards use WebP with `srcset`. The first two are `loading="eager"`, the rest lazy.
- The home page renders mostly through canvas, frame sequences and video. Only 5 `<img>` were in the home DOM at first sample, 2 with empty `alt`.
- `og:image` is a single site-wide JPG at **600×314**.

### 2.4 Storytelling and conversion

- **Voice.** Short, uppercase, declarative; image first, copy second. The long concept text is set in small caps-locked type, which reads as texture rather than invitation [C for the style; I for the effect].
- **Proof stack.** Founded 2010, 1200+ projects, 70+ awards (50+ awards listed in microdata), 8 offices, live clocks, a monograph book, Wikipedia / Awwwards / Architizer / SBID links in the head [C].
- **Sector framing.** Services are verticals (jets, yachts, hotels…) rather than process steps, which tells a prospect "we have done your kind of thing" [C for the framing].
- **Honesty cues.** "Representative" tags on Dubai and Milan. Completed / In progress filter and URL segment. Photographer credits [C].
- **CTA system.** One persistent "LET'S TALK" pill (desktop) or paper-plane icon (mobile) → a multi-step form. Plus `info@` and per-city phone or WhatsApp (Dubai links to `wa.me`) [C]. There is no project-page-specific enquiry and no budget or timeline qualifiers in step 1.

### 2.5 Technical

**Meta and structured data** [C]

- Home: title, description and keywords (keywords repeat the description), OG with a 600×314 image, Twitter card. `viewport` is `width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no`.
- Structured data is **microdata, not JSON-LD**: `itemscope` blocks for Organization, Place, PostalAddress, Person ×2, OfferCatalog / Service / Offer, plus many `<meta itemprop>` entries (offices, countries, services, more than 50 awards).
- Section pages (`/projects`, `/services`, `/about`, `/contact`) have specific titles. **The project page and `/connect-us` fall back to the generic home title, description and OG image, and have no canonical and no structured data** (checked about 2.5 s after hydration on `bortok-residence`; pass 2 saw the same on `bali-resort-residences`).
- `/services` has two `<h1>`. The home `<h1>` ("YODEZEEN MAIN PAGE") is visually hidden at 1×1 px.

**Third parties** [C]

- Google Tag Manager, GA4, **two** Google Ads conversion IDs, DoubleClick, Meta Pixel, **Pinterest** tag (with an origin-trial meta), Cloudflare Insights.
- Cookies `_ga`, `_ga_*`, `_fbp`, `_pin_unauth`, `_gcl_au` were present **while the cookie notice was still unanswered**.
- The notice is implied-consent wording with only an ACCEPT button and a close ×.
- An inline script pushes `{event: "default_consent", analytics_storage: "denied", …}` into `dataLayer`. As a plain event rather than a `gtag('consent','default', …)` command, this alone does not set Consent Mode defaults [I]. That fits the cookies already being set.
- `sessionStorage.is_eu = "false"` suggests geo-dependent behaviour [I].
- Public runtime config exposes `dev_mode: true` and a Cloudflare Turnstile site key. No Turnstile widget appeared on form step 1.

**Accessibility** [C]

- No `<nav>` landmark and no skip link.
- Nav labels are tripled for the roll effect without `aria-hidden` [C]. In pass 2 the accessibility tree showed each link with three generic "projects" children, so the accessible name is very likely "projects projects projects" [I].
- A fixed custom cursor element `.cursor` (about 150×155 px, `pointer-events: none`) follows the pointer and shows context labels such as "OPEN GALLERY" [C; pass 2 measured 150×154].
- With focus on a nav link, computed `outline-style: none` and `box-shadow: none`. That was programmatic focus; `:focus-visible` under real keyboard use was not tested [I for keyboard].
- The mobile menu has no `role="dialog"`, and content behind it is not `inert` or `aria-hidden` [C].
- Focus is not moved into the menu. When the toggle is tapped, focus stays on it (relabelled "Close menu"), as seen in this pass. When the menu opens without the toggle receiving focus, `activeElement` stays on `<body>`, as seen in pass 2 [C, both]. The two readings agree.
- 0 `prefers-reduced-motion` in CSS (this pass) and in the loaded JS chunks (pass 2) [C].
- Pinch-zoom is disabled.
- Touch targets: the cookie close button is **17×17 px**; filter buttons are 17 px tall.

**Performance indicators** [C]: home at first sample made about 107 requests (37 JS, 17 CSS, 9 PNG, 2 MP4, 8 WOFF2) for **about 964 KB** transferred, excluding streamed video ranges. The preloader video is `preload="auto"` with a preloaded poster.

---

## 3. Comparison: visual and UX strengths

| Dimension | Wood & Weave | YODEZEEN | Lesson for ARCHIÓ |
|---|---|---|---|
| Visual identity | Warm, material palette (paper, ink, wood, copper); film grain; craft objects (wax seal, leather book, arched door) | Cool neutral greys; Swiss grotesk in caps; photography does all the colour | A restrained palette lets imagery lead. ARCHIÓ's oxblood / blush / sand can be the "material" layer without props |
| Typography | Light serif display (300) + humanist sans UI; body 16 / 1.65; measured line lengths (68ch) | Giant grotesk display (240 px, −0.048em); body copy 11–13 px uppercase | Pair a refined display face with a readable UI/body face; keep long text ≥ 16 px in sentence case |
| Rhythm | Section themes alternate (ink / paper / wood / stone) via `data-theme` | Long white pinned stretches between full-bleed images | Theme-switching sections give pace without new components |
| Imagery | Honest labels, room-level captions, annotated hotspots | Huge full-bleed visuals, masonry plus WebGL immersive mode | Gallery confidence *with* explanation |
| Navigation | Full-screen menu with focus trap; persistent Enquire; mobile CTA pill | Split nav around a centred logo; text-roll hover; wipe transitions | Simple IA plus one persistent CTA beats novelty |
| Project pages | Idea → facts → room-by-room story → CTA → next project | Fact strip with coordinates and outline map → concept → gallery → team credits | Combine: a fact strip and status, then a narrative by space or decision, then credits |
| Conversion | Repeated soft CTA, WhatsApp, qualifying form, price ranges, AI Q&A | One "Let's talk" pill, a 3-field first step, email per city | Short first step, optional qualifiers, WhatsApp for UAE |
| Proof | Founders on camera, process, cost and time transparency | Scale (1200+ projects, 70+ awards, 8 offices), monograph | Prove *thinking* (consultancy) rather than scale ARCHIÓ doesn't claim |
| Craft and engineering | CSP, HSTS, JSON-LD, honest 404, accessible dialogs | WebGL, frame sequences, canvas carousel | Spend engineering on robustness first, spectacle second |

---

## 4. Positioning and storytelling differences

| | Wood & Weave | YODEZEEN |
|---|---|---|
| Who it speaks to | Dubai homeowners (often first big home purchase), Indian diaspora cues (Vastu) | International developers, hospitality groups, UHNW owners (jets, yachts) |
| Core promise | Accountability: two founders, one contract, design *and* build | Range and prestige: any typology, anywhere, award-winning |
| Story device | Metaphor and ritual (sealing a letter, opening a book, a door lighting up); a long guided scroll | Spectacle and scale (preloader film, image sequences, immersive canvas, clocks) |
| Tone | Warm, candid, explanatory; admits limits ("ranges, not quotes", AI is not the founders) | Terse, uppercase, assertive; lets imagery and numbers speak |
| Depth of explanation | High: process, contract scope, costs, timelines, Vastu | Low: concepts per project, little on process or fees |
| Status honesty | Each project labelled by delivery state | Completed / In progress filter; "Representative" offices |
| Trust anchor | People (founders' faces, film, careers) | Institution (awards, offices, monograph) |

**Where ARCHIÓ fits.** ARCHIÓ is consultancy-led and its portfolio is **design visualisations**. It cannot borrow YODEZEEN's scale claims, and it does not offer W&W's build guarantee. Its credible story is *the quality of its thinking*: how a brief becomes a spatial strategy, then a concept, then a visualised and documented design across Residential, Commercial, Mixed-use and Landscape. That points to W&W-style explanation depth combined with YODEZEEN-style gallery confidence, both made honest about the visualisation status of the work.

---

## 5. Interactions worth adapting in principle

None of these should be reproduced as seen. Each row names the *principle* and an ARCHIÓ-specific direction.

| # | Seen on | Principle | ARCHIÓ direction | Guardrail |
|---|---|---|---|---|
| 1 | W&W plan study, scroll-built house elevation (§1.2) | Show a process as a drawing that builds up as the reader advances | A consultancy method diagram (brief → strategy → concept → visualisation → documentation) drawn in oxblood line on sand | Must make sense as a static image; ≤ 2 viewports of pin; reduced-motion shows the final state |
| 2 | W&W services hotspots | Annotate imagery to expose decisions | Hotspots on visualisations naming material, light and spatial moves: proves design intent behind a render | Keyboard-focusable and readable as a list for screen readers |
| 3 | W&W status labels; YODEZEEN Completed / In progress | Say what each project *is* | A status and type chip on every project: "Design visualisation", "Concept", "In delivery", "Completed"; filterable | Never imply a render is a photo of a built space |
| 4 | YODEZEEN fact strip with coordinates and country outline | A compact, scannable facts band | Location, typology (one of the four categories), area, scope, status, year; a small line-drawn site or emirate outline is optional | Plain text, not uppercase 12 px; semantic `<dl>` |
| 5 | YODEZEEN team credits incl. photographer | Credit contributors | Credit the visualisation artist or studio and consultants on each project | Real names only with permission |
| 6 | W&W full-screen menu with `inert` and focus return | Immersive menu that stays accessible | Large display-type menu on oxblood with a short contact block | `role="dialog"`, focus trap, Escape, ≤ 400 ms reveal |
| 7 | W&W native `<dialog>` lightbox | Gallery viewing with keyboard support | Visualisation lightbox with captions (space, status) and arrow keys | Swipe on touch; no hijacked scroll |
| 8 | YODEZEEN wipe page transitions | Continuity between pages | A short crossfade or panel wipe through the View Transitions API (supported by Next.js) | ≤ 400 ms, skipped under reduced motion, never blocks navigation |
| 9 | Both: hover scale 1.02 with ease-out | Quiet affordance on media | 1.02–1.03 scale, about 500 ms `cubic-bezier(.16,1,.3,1)` | Hover-only (`@media (hover:hover)`) |
| 10 | YODEZEEN text-roll nav hover | Tactile link feedback | Optional micro-roll on primary nav | Duplicate text `aria-hidden="true"`; visible focus ring |
| 11 | W&W floating mobile CTA pill | Persistent action on phones | "Book a consultation · WhatsApp" pill on mobile | Appears after the hero, hides near the footer and while typing, ≥ 44 px targets |
| 12 | YODEZEEN live city clocks | Signal place and availability | One Dubai clock with studio hours ("Dubai · 17:05 · studio open") near contact or WhatsApp | Correct time zone; not a gimmick wall |
| 13 | W&W published cost and time ranges | Transparency builds trust before contact | Indicative consultancy engagement scopes and timelines (fee ranges only if the owner approves) | Clearly "indicative" |
| 14 | W&W AI concierge with disclosure | Answer common questions on the spot | Possible later phase: an FAQ first; any AI assistant only with clear disclosure and published sources | Not in v1; privacy notice required |
| 15 | W&W theme-switching sections (`data-theme`) | Pace a long page through colour fields | Alternate sand / blush / off-white / oxblood bands using brand tokens | Each band must pass AA (see §7) |
| 16 | YODEZEEN sector pages | "We've done your kind of project" | One landing page per category (Residential, Commercial, Mixed-use, Landscape) with filtered work and category-specific consultancy notes | Clean, stable URLs |

---

## 6. Weaknesses to avoid (each verified)

| # | Weakness | Site | Evidence | Status | What ARCHIÓ does instead |
|---|---|---|---|---|---|
| 1 | **Intro gate on every visit** | W&W | Overlay `.intro-overlay` z 200; header `inert` during the intro; the inline script says it plays on every home visit; blank first seconds at 390 px ([wnw-26](evidence/wnw-26-intro-blank-390.jpg)); about **7.8 s** gated on a fresh 375 px load, the first ~3 s blank (pass 2) | [C] | No gate. At most a ≤ 1 s logo resolve on first visit, non-blocking, never delaying content |
| 2 | **Preloader video on every visit, with scroll locked** | YODEZEEN | 9.0 s **4K** video replays with `visited=true` set; `preload="auto"`; scroll locked at 0; in pass 2 it was still up at 30 s until SKIP was pressed ([ydz-01](evidence/ydz-01-preloader-video-1440.jpg)) | [C] | Hero media streams *inside* the page, with a poster as the LCP image |
| 3 | **Motion without reduced-motion support** | Both | 0 `prefers-reduced-motion` rules in either site's CSS; YODEZEEN's JS has none (pass 2); W&W's only JS check is Lenis's internal one; W&W's script says the OS setting is deliberately ignored | [C] | Every non-essential animation gated on `prefers-reduced-motion: no-preference`; Lenis disabled under reduce |
| 4 | **Heavy, pre-consent ad tracking** | YODEZEEN | GTM, GA4, 2× Google Ads, DoubleClick, Meta, Pinterest, CF Insights; ad cookies set before Accept; implied-consent notice | [C] | Consent first: Consent Mode v2 defaults *before* tags; real Accept / Decline; only GA4 until a paid campaign exists |
| 5 | **Tracking with no notice at all** | W&W | Clarity session recording + Meta + GA4, cookies set, no notice (the script documents a "none" mode) | [C] | Same as #4; session recording only with consent |
| 6 | **Low-contrast UI** | Both | W&W form underline rgba(26,18,14,.12) on paper = **1.28:1** (WCAG 1.4.11 needs 3:1); copper `#a2653c` on paper = **4.07:1** (passes only for large text). YODEZEEN inactive category tabs rgba(45,42,42,.1) on `#f2f0f0` ≈ **1.20:1**; white 12 px nav over bright photography with no scrim ([ydz-02](evidence/ydz-02-home-hero-cookie-1440.jpg)) | [C] | AA everywhere; field borders ≥ 3:1; a scrim or solid header state over imagery |
| 7 | **Tiny uppercase body copy** | YODEZEEN | Concept text 13 / 16 px uppercase; facts 12 px; team names 11 px | [C] | Body ≥ 16 px, sentence case, line-height ≥ 1.5, measure ≤ 70ch |
| 8 | **Pinch-zoom disabled** | YODEZEEN | `maximum-scale=1, user-scalable=no` | [C] | Never restrict zoom |
| 9 | **Transparent header colliding with content** | W&W | Logo and "Enquire" overlapping headings and facts during scroll ([wnw-04](evidence/wnw-04-brand-film-header-overlap-1440.jpg), [wnw-29](evidence/wnw-29-project-header-overlap-768.jpg)) | [C] | Header gains a solid or blurred background once content scrolls under it |
| 10 | **Inaccessible decorative markup** | YODEZEEN | Tripled nav text without `aria-hidden`; no nav landmark or skip link; mobile menu not modal and background not inert; hidden 1×1 H1; two H1 on /services | [C] | Semantic landmarks, skip link, one visible H1 per page, modal menu |
| 11 | **Missing focus indication** | YODEZEEN | `outline-style: none`, no shadow on a focused nav link (programmatic focus) | [C] style; [I] keyboard | 2 px focus ring with ≥ 3:1 contrast via `:focus-visible` |
| 12 | **Generic metadata on detail pages** | YODEZEEN | Project and connect pages use the home title, description and OG image; no canonical; OG 600×314 | [C] | Per-page title, description, canonical, 1200×630 OG; JSON-LD |
| 13 | **Taxonomy in project URLs** | YODEZEEN | `/projects/interior-design/residences&completed/<slug>` | [C] URL; [I] breaks when status changes | `/projects/<slug>`; filters as query params |
| 14 | **Orientation gate** | YODEZEEN | `.rotate-warning` full-screen in landscape on a touch device ([ydz-23](evidence/ydz-23-rotate-gate.jpg)) | [C] | Layouts that work in both orientations |
| 15 | **Small touch targets / obstructive notice** | YODEZEEN | Cookie close 17×17 px and desktop SKIP 48×21 px (WCAG 2.2 2.5.8 minimum 24×24); notice covers about 20 % of a 844 px screen | [C] | ≥ 44 px targets; compact consent bar |
| 16 | **Very long pinned pages** | Both | W&W home 35,212 px with a 12,130 px pinned section; YODEZEEN home 28,198 px with a 14,400 px pinned carousel, about 33,803 px | [C] | Home ≤ about 12 viewports; pins ≤ 2 viewports; scroll never hijacked |
| 17 | **Content blank until JS reveals it** | Both | W&W images blank until the scale reveal; YODEZEEN service cards grey for 2–3 s, project grid empty at 390 until reveal | [C] | Content visible by default; enhancement only adds polish |
| 18 | **Production hygiene** | YODEZEEN | `dev_mode: true` in public runtime config; no CSP or HSTS | [C] | CSP and HSTS headers, clean public env |
| 19 | **Inconsistent claims across pages** | W&W | Home "covers" section says a full home is seven kinds of work ([pass2/wnw-04](evidence/pass2/wnw-04-one-contract-axonometric.jpg)); Services H1 says six | [C] | One source of truth for service counts and scope lists (CMS-driven) |

---

## 7. Recommendations for ARCHIÓ

ARCHIÓ is a consultancy-led Dubai studio whose portfolio is design visualisations, working in Residential, Commercial, Mixed-use and Landscape. Brand: oxblood `#4C1114`, blush `#CEB6A8`, sand `#DACFBA`, off-white ground `#F8F7F4`; display face is an open-licence substitute for Optima (chosen in docs/04); Public Sans for UI; Lora for long-form.

### 7.1 Positioning and narrative

1. **Lead with the method, not scale.** The home story should answer: what does a consultancy engagement with ARCHIÓ produce, in what order, and why does that de-risk a client's project? (Principle from W&W's explanation depth.)
2. **Be explicit that the work is visualised design.** A status chip on every project and image ("Design visualisation", "Concept", "In delivery", "Completed") plus a one-line note on the work page. This turns a potential weakness into a sign of honesty, as W&W's "What it is" field and YODEZEEN's "Representative" tags do.
3. **Explain decisions on the images.** Use annotations (§5 #2) and a short "design moves" list per project, so a visualisation becomes evidence of consultancy thinking.
4. **Organise by the four categories.** Filters plus category landing pages, each saying what consultancy means for that typology. For Landscape, for example: climate, irrigation, shade.
5. **People as the trust anchor.** Named principals and consultants, credited per project (YODEZEEN credits principle). No invented stats; only figures the owner can substantiate.

### 7.2 Visual system (principles, not layouts)

6. **Palette use, with measured contrast:**

   | Pair | Ratio | Use |
   |---|---|---|
   | Oxblood on sand | 9.74:1 | Body and display ✓ |
   | Oxblood on blush | 7.79:1 | Body and display ✓ |
   | Sand on oxblood | 9.74:1 | Text on dark bands ✓ |
   | Blush on oxblood | 7.79:1 | Text on dark bands ✓ |
   | Blush on sand | **1.25:1** | ✗ never text, decoration only |
   | White on blush | **1.93:1** | ✗ never text |

   Theme bands (§5 #15) should cycle off-white, sand, blush and oxblood with a matching text colour, set through a `data-theme` token.
7. **Typography.** Light display for headlines (the Optima substitute), Public Sans for UI, labels and forms, Lora for project narratives.
   - Body ≥ 16 px with line-height 1.55–1.65 and measure ≤ 70ch.
   - Display tracking slightly negative (−0.01 to −0.02em).
   - Fluid sizes with `clamp()` and a **vh cap** on the hero size (W&W's `min(…vw, 9.5vh)` is a good principle for short laptop screens).
8. **Imagery ratios.**
   - Pick three and stick to them: 16:9 heroes, 3:2 landscape, 4:5 portrait.
   - Reserve space with `aspect-ratio` so nothing shifts as images load.
   - AVIF/WebP with `srcset` and `sizes`; `fetchpriority="high"` only on the LCP image; lazy-load the rest.
   - Images visible by default (no reveal that leaves blanks).
9. **Texture without weight.** If grain is wanted, inline SVG noise as W&W does (no image request), at very low opacity.

### 7.3 Interaction and motion

10. **No intro gate, no preloader.** First paint shows the brand, a headline and a visualisation. Never lock scroll, and never make access wait on video playback (§2.2, §6 #2).
11. **Motion tokens:**
    - Three durations: 200 ms (UI), 400 ms (reveals and transitions), 800 ms (hero only).
    - Two easings: an ease-out like `cubic-bezier(.16,1,.3,1)` and an ease-in-out like `cubic-bezier(.77,0,.18,1)`.
    - All of it inside `@media (prefers-reduced-motion: no-preference)`.
12. **Scroll.** Native scroll by default. If smooth scroll is used, disable it under reduced motion and on touch. Pinned scenes ≤ 2 viewports, and only for the method diagram.
13. **Page transitions.** A View Transitions crossfade ≤ 400 ms, progressive enhancement only.
14. **Header.** Transparent over the hero, then a solid sand or oxblood state once content passes under it. Hide on scroll-down and show on scroll-up. Both references carry a 700–750 ms header transform transition for this [C value; I behaviour]; use ≤ 400 ms.

### 7.4 Conversion

15. **One primary action:** "Book a consultation", shown in the header, at the end of every project and in the footer. **WhatsApp** is the secondary action (a UAE norm), phone and email tertiary.
16. **Two-stage enquiry.**
    - Stage 1: name, one contact method (phone with +971 default, or email) and category. This is YODEZEEN's short first step.
    - Stage 2, optional: stage, location, approximate area, timeline, budget band and a free-text brief. These are W&W's qualifiers.
    - Only 2–3 fields required. Honeypot plus Cloudflare Turnstile. `autocomplete` attributes. Clear success state. No forms that need JS to show content.
17. **Mobile CTA pill** after the hero (§5 #11), ≥ 44 px targets, hidden while the keyboard is open.
18. **Transparency block.** "What an engagement includes" with typical durations; fee ranges only if the owner approves.

### 7.5 Technical baseline (Next.js)

19. **SEO.**
    - Per-route `generateMetadata`: title pattern `Page · ARCHIÓ`, description, canonical, 1200×630 OG per project (from its hero visualisation), `en_AE` locale.
    - JSON-LD: Organization + LocalBusiness (Dubai address, phone, `areaServed`, `sameAs`), BreadcrumbList, Person for principals. For projects, `CreativeWork` with the image caption saying it is a visualisation.
    - Real 404 status with `noindex`.
    - Stable `/projects/<slug>` URLs.
20. **Privacy.** Consent banner with Accept and Decline of equal weight. Google Consent Mode v2 `default` set to denied **before** GTM or GA4 loads. No ad pixels, session recording or Pinterest until there is a campaign and consent. Respects UAE PDPL and GDPR for EU visitors.
21. **Accessibility.**
    - Skip link; landmarks; one visible H1; a modal menu with `inert` background.
    - `:focus-visible` rings.
    - Zoom never disabled.
    - WCAG 2.2 AA contrast, including ≥ 3:1 for field borders and icons.
    - Hidden duplicate text marked `aria-hidden`.
22. **Performance.**
    - Self-hosted fonts through `next/font` with metric-adjusted fallbacks (W&W's fallback-font approach) and at most 2–3 preloads.
    - Defer analytics until idle or first interaction (W&W's approach, *after* consent).
    - Budget: LCP < 2.5 s on 4G, CLS < 0.05, JS < 150 KB gzip on the home page.
    - Video only on demand (click to play, poster first).
23. **Security headers.** CSP (nonce- or hash-based), HSTS, `Referrer-Policy`, `Permissions-Policy`. No `dev_mode` style flags in the public runtime config.

### 7.6 What not to borrow

- Wax seals, leather books, arched doors, a founders' film set, Vastu framing (W&W's own identity and audience).
- Giant all-caps grotesk, city clock walls, jets and yachts verticals, a WebGL immersive gallery (YODEZEEN's scale and spectacle; costly and off-brand for a consultancy).
- Any copy, imagery, layout composition or naming from either site.

---

## Appendix A — Evidence index

All files are in [`docs/evidence/`](evidence/). For internal research only; do not publish. The parent session's 31 second-pass captures are in [`evidence/pass2/`](evidence/pass2/), under their original names. The body links ten of them where they add a view this pass lacks: the weave diagram, the one-contract axonometric, the work index, the mobile intro and menu, the YODEZEEN 4K intro, the monochrome Stillstone frame, the monograph and the mobile hero/menu.

| File | Shows |
|---|---|
| [wnw-01-intro-seal-1440.jpg](evidence/wnw-01-intro-seal-1440.jpg) | Intro overlay: wax seal and manifesto lines |
| [wnw-02-home-hero-1440.png](evidence/wnw-02-home-hero-1440.png) | Home hero: light beams, serif headline, two CTAs |
| [wnw-03-position-plan-study-1440.jpg](evidence/wnw-03-position-plan-study-1440.jpg) | Scroll-built elevation drawing with stage labels |
| [wnw-04-brand-film-header-overlap-1440.jpg](evidence/wnw-04-brand-film-header-overlap-1440.jpg) | Founders' film player; header logo overlapping a heading |
| [wnw-05-pillars-pinned-1440.jpg](evidence/wnw-05-pillars-pinned-1440.jpg) | Pinned pillar: plan drawing and sub-list |
| [wnw-06-founders-halves-1440.jpg](evidence/wnw-06-founders-halves-1440.jpg) | Founders in arched frames |
| [wnw-07-flagship-teaser-1440.jpg](evidence/wnw-07-flagship-teaser-1440.jpg) | Flagship teaser with spec card |
| [wnw-08-process-horizontal-1440.jpg](evidence/wnw-08-process-horizontal-1440.jpg) | Horizontal process timeline |
| [wnw-09-vastu-diagram-1440.jpg](evidence/wnw-09-vastu-diagram-1440.jpg) | Vastu compass diagram, labelled as a diagram |
| [wnw-10-ai-concierge-1440.jpg](evidence/wnw-10-ai-concierge-1440.jpg) | AI question box with disclosure |
| [wnw-11-footer-arch-1440.jpg](evidence/wnw-11-footer-arch-1440.jpg) | Footer arch before reveal |
| [wnw-12-footer-arch-lit-1440.jpg](evidence/wnw-12-footer-arch-lit-1440.jpg) | Footer arch lit with CTA and seal |
| [wnw-13-menu-open-1440.jpg](evidence/wnw-13-menu-open-1440.jpg) | Full-screen menu |
| [wnw-14-menu-hover-1440.png](evidence/wnw-14-menu-hover-1440.png) | Menu link hover (copper and shift) |
| [wnw-15-work-book-1440.jpg](evidence/wnw-15-work-book-1440.jpg) | Work as a "book" with project tabs |
| [wnw-16-work-room-masonry-1440.jpg](evidence/wnw-16-work-room-masonry-1440.jpg) | Room filter pills and 3-column masonry |
| [wnw-17-work-lightbox-1440.jpg](evidence/wnw-17-work-lightbox-1440.jpg) | Native dialog lightbox |
| [wnw-18-project-hero-1440.jpg](evidence/wnw-18-project-hero-1440.jpg) | Project hero with "Complete design" status |
| [wnw-19-project-room-1440.jpg](evidence/wnw-19-project-room-1440.jpg) | Alternating room section |
| [wnw-20-services-hero-1440.jpg](evidence/wnw-20-services-hero-1440.jpg) | Services hero |
| [wnw-21-services-hotspots-1440.jpg](evidence/wnw-21-services-hotspots-1440.jpg) | Annotated hotspots on a visual, deliverable chips |
| [wnw-22-services-cost-ranges-1440.jpg](evidence/wnw-22-services-cost-ranges-1440.jpg) | Cost and time range bars |
| [wnw-23-founders-1440.jpg](evidence/wnw-23-founders-1440.jpg) | Founders page hero |
| [wnw-24-enquire-form-1440.jpg](evidence/wnw-24-enquire-form-1440.jpg) | Enquiry form layout |
| [wnw-25-404-1440.jpg](evidence/wnw-25-404-1440.jpg) | 404 page |
| [wnw-26-intro-blank-390.jpg](evidence/wnw-26-intro-blank-390.jpg) | Mobile intro: blank screen with "Skip intro" |
| [wnw-27-home-hero-390.jpg](evidence/wnw-27-home-hero-390.jpg) | Mobile hero |
| [wnw-28-plan-study-390.jpg](evidence/wnw-28-plan-study-390.jpg) | Mobile plan-study drawing |
| [wnw-29-project-header-overlap-768.jpg](evidence/wnw-29-project-header-overlap-768.jpg) | Tablet: header logo over facts text |
| [wnw-30-services-1024.jpg](evidence/wnw-30-services-1024.jpg) | 1024 services hero |
| [ydz-01-preloader-video-1440.jpg](evidence/ydz-01-preloader-video-1440.jpg) | Preloader video with SKIP |
| [ydz-02-home-hero-cookie-1440.jpg](evidence/ydz-02-home-hero-cookie-1440.jpg) | Hero, split nav, implied-consent notice |
| [ydz-03-scroll-word-reveal-1440.jpg](evidence/ydz-03-scroll-word-reveal-1440.jpg) | Word-by-word scroll reveal |
| [ydz-04-about-split-1440.jpg](evidence/ydz-04-about-split-1440.jpg) | Info split: photo and uppercase statement |
| [ydz-05-projects-canvas-1440.jpg](evidence/ydz-05-projects-canvas-1440.jpg) | Pinned canvas project carousel |
| [ydz-06-we-do-sectors-1440.jpg](evidence/ydz-06-we-do-sectors-1440.jpg) | "We do" sectors type animation |
| [ydz-07-world-map-1440.jpg](evidence/ydz-07-world-map-1440.jpg) | Graticule office map |
| [ydz-08-footer-clocks-1440.jpg](evidence/ydz-08-footer-clocks-1440.jpg) | City list with live clocks, "Representative" tags |
| [ydz-09-footer-hover-cursor-1440.jpg](evidence/ydz-09-footer-hover-cursor-1440.jpg) | City hover expansion and ring cursor |
| [ydz-10-page-transition-wipe-1440.jpg](evidence/ydz-10-page-transition-wipe-1440.jpg) | Mid-transition horizontal wipe |
| [ydz-11-projects-masonry-1440.jpg](evidence/ydz-11-projects-masonry-1440.jpg) | Projects filters and 4-column masonry |
| [ydz-12-projects-immersive-webgl-1440.jpg](evidence/ydz-12-projects-immersive-webgl-1440.jpg) | WebGL2 immersive project field |
| [ydz-13-project-hero-1440.jpg](evidence/ydz-13-project-hero-1440.jpg) | Project hero |
| [ydz-14-project-facts-map-1440.jpg](evidence/ydz-14-project-facts-map-1440.jpg) | Fact strip with coordinates and outline map |
| [ydz-15-project-team-credits-1440.jpg](evidence/ydz-15-project-team-credits-1440.jpg) | Team credits incl. photographer |
| [ydz-16-services-sectors-1440.jpg](evidence/ydz-16-services-sectors-1440.jpg) | Sector service cards |
| [ydz-17-about-founders-1440.jpg](evidence/ydz-17-about-founders-1440.jpg) | About hero: founders and giant type |
| [ydz-18-connect-form-step1-1440.jpg](evidence/ydz-18-connect-form-step1-1440.jpg) | Multi-step contact form, step 1 |
| [ydz-19-404-1440.jpg](evidence/ydz-19-404-1440.jpg) | 404 page |
| [ydz-20-preloader-390.jpg](evidence/ydz-20-preloader-390.jpg) | Mobile vertical preloader |
| [ydz-21-projects-cookie-390.jpg](evidence/ydz-21-projects-cookie-390.jpg) | Mobile projects page with large cookie notice |
| [ydz-22-menu-open-390.jpg](evidence/ydz-22-menu-open-390.jpg) | Mobile full-screen menu |
| [ydz-23-rotate-gate.jpg](evidence/ydz-23-rotate-gate.jpg) | "Rotate your phone" gate |
| [ydz-24-projects-1024.jpg](evidence/ydz-24-projects-1024.jpg) | 1024 projects masonry (4 columns) |

## Appendix B — Third-party inventory

| Category | Wood & Weave | YODEZEEN |
|---|---|---|
| Tag manager | GTM `GTM-N4NJK4HS` | GTM |
| Analytics | GA4 `G-VL6HKZTGEX` | GA4, Cloudflare Web Analytics |
| Session recording | Microsoft Clarity | — |
| Ads / pixels | Meta Pixel | Meta Pixel, Google Ads ×2 (view-through conversion IDs `11247009895`, `17616282297`), DoubleClick, Pinterest |
| Consent UI | None (documented "none" mode) | Implied-consent notice, ACCEPT only |
| Cookies before any choice | `_ga`, `_ga_*`, `_fbp`, `_clck`, `_clsk` | `_ga`, `_ga_*`, `_fbp`, `_pin_unauth`, `_gcl_au` |
| Structured data | JSON-LD (Organization, LocalBusiness, BreadcrumbList, Person) | Microdata (Organization, Place, PostalAddress, Person, OfferCatalog/Service/Offer) |
| Security headers | CSP (hashes), HSTS | None observed |

All rows [C].

## Appendix C — Second-pass measurements (parent session, 25 Oct 2026)

A second, independent pass was made after the first session paused. The browser pane was **displayed** for these readings, but the caveats at the top of this document still apply: emulated viewports, one network and one machine. Screenshots are in [`evidence/pass2/`](evidence/pass2/); they are downscaled pane captures (800 px or 480 px wide) and are supporting evidence only.

| # | Site | Finding | Tag |
|---|---|---|---|
| C1 | W&W | On a fresh load at 375×812 the intro gate stayed up for **about 7.8 s** after navigation. This was measured in JS by polling until "Skip intro" was no longer rendered. The first ~3 s are a blank dark field before the seal appears ([pass2/wnw-15](evidence/pass2/wnw-15-mobile-intro.jpg)). | [C] for this run; real-device time may differ |
| C2 | YDZ | With the pane displayed, the home preloader video was still showing **30 s after navigation**; `scrollY` stayed at 0, and wheel input did not advance the page. Only "SKIP" released it. | [C] for this run; [I] that it waits for the video to finish or for Skip |
| C3 | YDZ | The desktop "SKIP" button measures **48×21 px**, below WCAG 2.2 SC 2.5.8's 24×24 px minimum unless the spacing exception applies. On mobile it is 93×34 px. | [C] |
| C4 | YDZ | The cookie notice reads "By continue to use this website, you agree to our Privacy policy", which is implied consent with a grammatical error. Analytics and ad cookies were already set before any choice (Appendix B). | [C] |
| C5 | YDZ | The mobile menu has no `role="dialog"`, and `document.activeElement` stayed on `<body>` after opening it. The menu and contact icon buttons are 40×40 px. | [C] |
| C6 | W&W | Contrast computed from measured colours: hero lede (paper at 50% on `#1a120e`) is **4.73:1**; muted labels (ink at 62% on paper) **4.91:1**. Both pass AA, but narrowly for 13 px text. **Re-check 27 Oct:** the ratios hold, but the 50 % colour (`#f2eee680`) belongs to the small hero caption `.hero-light__note` and the enquiry hint `.enq__hint`, not the hero lede. The lede is paper at 64 %, 7.03:1 (§1.3). | [C] |
| C7 | W&W | The Work index states "Every item here carries what it actually is." Each project carries a status: "Design and build, completed", "Designed, Build Starts in January 2027", "Complete design", "In progress" ([pass2/wnw-10](evidence/pass2/wnw-10-work-index.jpg)). This is the clearest precedent for ARCHIÓ's "Design visualisation" label. | [C] |

One reading differed between the passes. In the second pass, focus appeared to stay on the header logo link after opening W&W's menu.

**Resolved by re-check on 27 Oct [C].** After the toggle opens the menu, `document.activeElement` is `a.menu__mark`, the menu's own logo link inside `[data-menu]`. `<header>` and `<main>` are `inert`, `aria-expanded` is `true`, and Escape returns focus to `.menu-toggle`. Focus does move into the dialog; the logo link pass 2 saw is the in-dialog one. Details are in §1.2.

C2 also differs from this pass, where the YODEZEEN preloader cleared on its own within about 15 s. Both observations are kept in §2.2: a gate that waits for video playback is fragile either way.
