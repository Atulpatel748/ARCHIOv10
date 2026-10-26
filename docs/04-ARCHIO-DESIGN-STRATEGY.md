# 04 — ARCHIÓ Design Strategy

Prepared 2026-10-25. This sets the foundation that all three visual options in docs/05 share. It takes inputs from:

- docs/01 (industry research, cited as `01 §n`);
- docs/02 and the reference-site pass (Wood & Weave = W&W, YODEZEEN = YDZ; evidence in `docs/evidence/`);
- docs/03 (brand kit and verified business content).

Nothing here is approved until the owner chooses a direction at Approval Gate 1.

---

## 1. Design read

> Reading this as: a **portfolio-and-services site for a young, consultancy-led interior design studio in Dubai**. It is written for homeowners, investors and business owners who are researching designers over weeks or months. The language is **quiet, exact and warm**, built on the brand kit (Optima-style capitals, oxblood, sand and off-white) and the moodboard (plaster, raking light, arches, oxblood velvet).

The site has two jobs, in this order:

1. **Experience.** Show ARCHIÓ's taste and spatial thinking through the work.
2. **Persuade.** Make a careful buyer trust a studio that has no reviews, awards or built-project photography yet, then make contact easy.

The second job decides most of the structure. ARCHIÓ cannot borrow the signals of scale that larger Dubai studios lean on: project counters, years and award badges (01 §1). Its premium position has to come from **clarity of method and quality of presentation**, which are fully in its control.

## 2. Brand personality

| Trait | What it means on the page | What it rules out |
|---|---|---|
| **Considered** | Every element has a reason; one focal point per screen. | Decorative motion, filler sections, stock imagery |
| **Exact** | Facts before adjectives: area, community, scope, status, deliverables. | "Luxury", "bespoke", "timeless", "elevate", "spaces that tell stories" (01 §1 ban list) |
| **Warm** | Oxblood and sand, a flared humanist display face, founders named and pictured. | Cold grotesque minimalism; anonymous "the team" voice |
| **Honest** | Visualisations labelled as visualisations; only the client's own claims. | Fake testimonials, counters, logo walls, invented credits |
| **Advisory** | Copy speaks like a consultant explaining a decision: "We guide decisions." | Sales urgency, pop-ups, four CTAs in a hero (as on one Dubai site, 01 §9) |

**Voice.** First person plural, plain words, short sentences. The client's own lines are strong enough to carry the site and are used verbatim, for example "Good design is not about making something look expensive." Visible copy uses no em-dashes (design-taste rule), so the client's dashes become commas or full stops.

## 3. Positioning on the page

- **One-line positioning (draft for owner approval):** *"An interior design consultancy in Dubai for homes, workplaces and the spaces between."* Mixed-use and landscape are named on the Services page, not crammed into the hero.
- **Differentiator:** consultancy-led. ARCHIÓ helps clients decide (plans, materials, coordination) before money is spent on site. Both references position on *design and build* (W&W's "one contract") or on *scale and spectacle* (YDZ's 1200+ projects and cinematic film). ARCHIÓ takes the third position: **advice you can act on**.
- **Proof** comes in three forms, all real:
  1. The three visualised projects, told as decisions.
  2. The founders by name.
  3. A written process and deliverables.

## 4. Information architecture

| Route | Purpose | Key content (verified) |
|---|---|---|
| `/` Home | Experience, then orientation | Positioning, the three projects, services in brief, approach, founders, contact |
| `/work` | Portfolio index | Three projects with status "Design visualisation"; filter by category (Residential, Commercial, Landscape). Mixed-use appears once work exists. |
| `/work/dubai-marina-residence`, `/work/jlt-office`, `/work/arabian-ranches-landscape` | Project stories | Facts block, premise, key moves, materials, gallery, scope. Slugs and titles are drafts; real project names come from the client. |
| `/services` | Services, bookable separately | Four categories (Residential, Commercial, Mixed-use, Landscape) and six services grouped by stage: *Define* (Consultation, Space Planning), *Design* (Concept Development, Material & Finish Selection), *Support* (Design Review & Advisory, Project Coordination Support). From 01 §7; grouping to be confirmed by the owner. |
| `/studio` | Trust | About, founders, approach, vision, mission, philosophy, "why choose us" (all from the profile) |
| `/contact` | Conversion | Short form, WhatsApp, phone, email, Instagram |
| `/privacy`, 404 | Legal and recovery | Privacy notice (UAE PDPL, 01 §8); a custom 404 that points to the work (both references do this well) |

Desktop navigation is **visible** (Work, Services, Studio, Contact), because NN/g measured hidden desktop navigation as slower and less used (01 §9, [F 27]). Phones use a menu button, with Contact kept visible next to it.

**One contact intent, one label:** "Start a conversation" everywhere (nav, project pages, footer). It describes the first step, a conversation, which matches the consultancy offer. It does not copy W&W's "Begin with a conversation".

## 5. Visual system: shared foundations

### 5.1 Colour roles

| Token | Hex | Role |
|---|---|---|
| `--paper` | `#F8F7F4` | Main ground (light options) |
| `--sand` | `#DACFBA` | Secondary ground, material and plaster surfaces, image mats |
| `--blush` | `#CEB6A8` | Quiet tertiary surface (material swatches, hover fills). **Never carries text** below oxblood or ink weight. |
| `--oxblood` | `#4C1114` | Ink and the single accent; used as a full field (footer, statement, the dark option) |
| `--ink` | oxblood itself | The kit uses oxblood as its type colour. On paper it reaches 14.03:1, so no separate black is needed. |

Measured contrast (docs/03): oxblood on paper 14.03:1, on sand 9.74:1, on blush 7.79:1. Blush on sand is 1.25:1 and sand on paper 1.44:1, so these pairs never separate regions or show focus.

**The "AI palette" question.** The design-taste guidance flags cream with oxblood and espresso as a cliché of machine-made premium sites, and so does 01 §15. Here the brand kit names these exact colours, so they are kept, but used in a way that avoids the cliché:

- No brass, gold or copper anywhere (copper is W&W's accent).
- The ground is the kit's near-neutral `#F8F7F4`, not a yellow cream.
- Oxblood is used as **ink and full fields**, not as scattered thin accents.
- There is one accent and no second colour.
- There are no gradients, glows or grain.

### 5.2 Typography

| Role | Face | Rules |
|---|---|---|
| Display and headings | **Belleza** (OFL), standing in for Optima | Chosen by side-by-side test against the kit's Optima outlines (`design-previews/_font-test.html`). It is the closest open face, with flared strokes and similar C, R and A, and it has the Ó glyph; Tenor Sans renders Ó incorrectly, Marcellus reads like Trajan, Quattrocento Sans has no flare. It has a single weight, so hierarchy comes from size, case, spacing and colour, never bold. |
| UI, navigation, labels, body | **Public Sans** 300/400/500 | The kit names it for "website, proposals, UI". Body 17px with 1.6 line height, measure 60–68ch. |
| Long-form narrative (one role only) | **Lora** 400/italic | Project stories and studio philosophy only, never headlines (01 §10). |
| Logo | Vector outlines recovered from the kit | Never typeset in Belleza. |

**Type scale** (five steps, fluid):

| Step | Size |
|---|---|
| Display | `clamp(2.75rem, 1.4rem + 4.2vw, 5.75rem)` |
| H2 | `clamp(2rem, 1.3rem + 2.1vw, 3.25rem)` |
| H3 | `clamp(1.375rem, 1.2rem + 0.6vw, 1.75rem)` |
| Body | `1.0625rem` |
| Small | `0.8125rem` |

Belleza capitals take +0.04em tracking, the kit's wordmark spacing. Sentence-case headings take 0.

**Not used** (on purpose): Cormorant and serif display faces (W&W), Neue Haas or Helvetica caps (YDZ), Inter, all-caps body copy (YDZ prints long project text in small caps, which reads poorly).

### 5.3 Grid and spacing

- **Grid:** 12 columns.
  - Outer margin `clamp(16px, 4.4vw, 64px)`; gutter `clamp(16px, 2vw, 32px)`; content max 1440px.
  - Images may bleed past the margin on purpose; text never does.
  - Below 768px everything collapses to one column. Tablet (768–1023) uses 6 columns.
- **Spacing scale** (4px base): 4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 192. Section rhythm is `clamp(96px, 12vw, 192px)`.
- **Corners:** radius 0 everywhere (architectural, matches W&W's documented `--radius: 0` and the kit's square swatches). Round shapes are allowed **only** where they come from the monogram's O: one circular image aperture per option at most. They are never used for buttons or cards.
- **Grouping:** space and hairlines (`1px` oxblood at 16% opacity), no cards and no shadows (01 §11).
- **Header:** 72px on desktop and 64px on mobile (both references use 80px). It is transparent over the hero, then solid paper after scrolling.

### 5.4 Imagery

- Only the client's own visualisations are used. Every project shows **"Design visualisation"** in its facts block, and the first image of each project carries a short caption saying so (01 §5). The label is legible and never grey fine print. W&W's status line ("Complete design", "In progress") confirms that this works on a premium site.
- Each space is shown as wide, mid and detail, with a scale cue. Enlargements open at least twice the inline size (01 §5, [F 24]).
- **Crop ratios:** hero 16:9 desktop and 4:5 mobile (art-directed, not just squashed); project tiles 4:5; detail 1:1; landscape 3:2.
- **Delivery (production):** AVIF/WebP via `next/image`. The hero is never lazy-loaded and gets `fetchpriority=high`. All other images are lazy with explicit dimensions (01 §13).
- **Blocker:** the extracted images are at most 800px, so originals of 2400px or more are required before launch (docs/03 §7).
- **Provenance:** file names like `dubai-marina-apartment-living-room-visualisation.avif`, with IPTC `digitalCreation` metadata (01 §5).

### 5.5 Motion principles

Each motion must serve one of four purposes: **reveal sequence, confirm an action, preserve context across a transition, or explain**.

| Use | Spec |
|---|---|
| Image reveal on entering view | `clip-path: inset()` from the bottom, 700–900ms, `cubic-bezier(0.22, 1, 0.36, 1)`, plays once |
| Text entrance | Opacity plus 12px translate, 450ms, stagger 60ms, maximum 4 items |
| Hover on project links | Image scale 1.0 to 1.03 over 600ms; underline draw 250ms. Gated by `(hover: hover) and (pointer: fine)` |
| Button press | `scale(0.98)`, 120ms |
| Menu open/close | 350ms open, 250ms close (exit faster than enter), `clip-path` wipe |
| Page transition | Cross-document View Transition (project tile into project hero) where supported; plain navigation elsewhere (01 §12) |

- **Never:** intro gates or preloaders, scrolljacking or horizontal hijack, smooth-scroll libraries (Lenis), custom cursors, auto-advancing carousels, parallax on text, looping marquees.
  - Both references gate their content behind an intro: W&W for about 7.8s on a fresh mobile load, and YDZ with a scroll-locked 4K video that had not cleared after 30s in our test.
  - YDZ ships a custom cursor and has no reduced-motion handling at all.
  - ARCHIÓ shows its work immediately; that is the brief's strongest differentiator against both.
- **Reduced motion:** under `prefers-reduced-motion: reduce`, reveals become 200ms opacity fades, hover scale is removed, the WebGL transition becomes a crossfade, and View Transitions are skipped.

### 5.6 Library position (to confirm at Gate 1)

| Library | Decision | Reason |
|---|---|---|
| **Next.js** (App Router) and **SCSS modules** | Use | Brief stack; static generation suits the content |
| **GSAP + ScrollTrigger** | Use only if the chosen option needs scroll-linked sequencing (options A and B do, lightly). Otherwise CSS scroll-driven animations plus IntersectionObserver. | GSAP is free including plugins; it is the right tool for pinned or scrubbed sequences. W&W uses it too. |
| **Framer Motion (`motion`)** | **Drop by default** | Its jobs here (menu presence, route transitions) are covered by CSS transitions and the View Transitions API. Two animation runtimes in one tree fight over frames (design-taste rule). It returns only if a specific interaction needs springs or gestures. |
| **Three.js** | Use in **one** place, the project slider's displacement transition (option B; optional in A) | This is how "GL sliders" is read: WebGL image transitions with a shader displacement map. Hand-written on Three.js, so no extra slider package. Lazy-loaded below the fold, with a CSS crossfade fallback for no-WebGL and reduced motion. If the owner meant a specific package, it gets swapped in. |
| Lenis or another smooth scroll | Do not use | Native scroll is faster, accessible and keeps scroll position semantics. |
| Analytics, chat widgets, pixels | Not at launch | Both references load GTM, Meta pixel and either Clarity or Pinterest/Ads tags. ARCHIÓ adds analytics only after the owner chooses a consent approach (01 §8, §9). |

## 6. Page-level storytelling

### 6.1 Home sequence

The section families are all different (the design-taste repetition ban):

1. **Hero:** positioning line, one image, one CTA. At most three text elements; no eyebrow and no scroll cue.
2. **Philosophy:** the client's own line, "Good design is not about making something look expensive." Full width, type-led.
3. **Work:** the three projects, each with its status label. The presentation varies by option.
4. **Services:** four categories and six services by stage, never six identical icon cards (01 §7).
5. **Approach:** the profile's four process benefits, shown as a sequence.
6. **Founders:** two names, roles and portraits. Bios only once the client writes them.
7. **Contact:** the form summary, WhatsApp, phone and email.

### 6.2 Project page template (01 §6)

1. Hero image.
2. Title, then the facts block: Category, Community, Area, Status "Design visualisation", ARCHIÓ scope.
3. **Premise.** What the space needed to do.
4. **Key moves.** Up to three decisions, each with an image.
5. **Materials.** A material board with named finishes; needs client input.
6. Gallery.
7. Next project.
8. Contact.

Copy runs 300–600 words, written from the founders' brief. **No invented specifics**: anything not in the profile is a placeholder marked for the client.

### 6.3 Services page

Four categories, each a short paragraph from the client's own descriptions (residential and commercial copy exists in the profile; mixed-use and landscape need confirmation). Then the six services grouped by stage. For each service: *what it is*, *when it fits*, *what you receive*. The "what you receive" parts are placeholders until the client confirms them.

## 7. What we take from the references, and what we don't

| Principle observed | Source | ARCHIÓ adaptation |
|---|---|---|
| Every project labelled by status ("Complete design", "In progress") | W&W `/work` | A "Design visualisation" status in every facts block. Our own wording. |
| Facts strip on project pages (style, location, status, area) | YDZ project page | A facts block with category, community, area, scope and status |
| Room-by-room project storytelling | W&W project pages | Premise, key moves and materials, written as decisions |
| Status and type filters on the portfolio | YDZ `/projects` | A category filter once there are more than three projects |
| Own form endpoint with a honeypot, no third-party form service | W&W `/api/enquire` | A Next.js route handler with validation, honeypot and rate limit |
| Custom 404 that leads back to the work | Both | Yes |
| Cinematic intro gates (wax seal; 4K film) | Both | **Rejected.** Content first. |
| Custom cursor, Lenis smooth scroll, scroll-locked sequences | YDZ (and Lenis on both) | **Rejected** |
| All-caps body copy, generic per-page titles, 21px-tall tap targets | YDZ | **Rejected.** Sentence case, unique titles, 44px targets. |
| Copper, Cormorant serif, founders in arches, weave diagram, "one contract" | W&W signatures | **Not used** |
| Neue Haas caps, Monograf book, office clocks, desert films | YDZ signatures | **Not used** |

**ARCHIÓ's own signatures,** none of them present in either reference:

1. **The Ó aperture.** The monogram's O becomes the single round device: a circular window that frames one image or the founders.
2. **Optima-style capitals in oxblood on paper.** A flared humanist voice that is neither serif nor grotesque, which none of the 16 studios in 01 or the two references use.
3. **Decision-led storytelling.** Each project page shows choices ("we moved the bar under the stair to free the living room"), never adjectives. The specifics come from the client.
4. **Honest status as a design element.** The visualisation label is part of the typographic system, not a disclaimer.

## 8. Accessibility, SEO and performance targets (design-level)

- **WCAG 2.2 AA:**
  - Contrast pairs as in §5.1.
  - Visible 2px focus rings in oxblood on light grounds and sand on oxblood.
  - Targets of 44×44px or larger.
  - A skip link.
  - The menu as a real dialog with focus moved in and returned.
  - No information conveyed by motion alone.
- **SEO:**
  - A unique title and description per page (YDZ reuses one site-wide; that is avoided).
  - One `<h1>` per page.
  - Organization JSON-LD with `alternateName` `["ARCHIÓ","Archio"]`, and LocalBusiness only once a staffed address is confirmed (01 §14).
  - No doorway pages.
- **Performance budget:**
  - LCP 2.5s or less on mid-range mobile over 4G.
  - Hero image about 200KB or less on mobile.
  - At most 4 font files on first load.
  - JS on the home page about 120KB gzip or less, excluding the lazily loaded Three.js chunk in option B (W&W ships about 359KB including trackers).
  - CLS 0.1 or less.

## 9. Open decisions for the owner (carried into Gate 1)

1. Choice of direction (A, B or C, or a combination of named elements).
2. The positioning line in §3.
3. The service grouping by stage in §4.
4. Whether ARCHIÓ ever carries out execution, which decides whether "We execute what we design" can appear.
5. The contact label "Start a conversation".
6. The client-material requests in docs/03 §7, above all the original renders, which block the build's image quality.

---

## 10. Round 2 art direction: Cinematic Light (owner feedback, 27 Oct 2026)

**Owner feedback on options A–C:** too safe and plain, too template-like, wrong mood. Owner chose the **Cinematic light** mood with **cinematic** motion (signature WebGL moments, pinned scroll scenes, kinetic type, native scrolling kept).

**What changes from the foundation above:**

| Area | Round 1 | Round 2 (Cinematic Light) |
|---|---|---|
| Mood | Quiet, polite, monograph | Gallery at dusk: darkness, raking light, plaster, long shadows. Drawn from the client's moodboard (arched plaster wall in raking light). |
| Ground | Off-white, oxblood or sand | **Night** `#140708`, a very dark shade derived from the kit oxblood (owner to approve as a brand extension). Kit oxblood is used for panels, sand and paper as "light". |
| Taste dials | 6–7 / 3–6 / 3–4 | **9 / 8 / 2** (high variance, cinematic motion, sparse) |
| Hero | Words plus a render | A **real-time 3D Ó monogram** extruded from the kit's own outline, standing in plaster against a plaster wall, lit by a moving sun (Three.js, real shadows). Pointer and scroll move the light. |
| Projects | Grid, slider or list | **Pinned full-screen scenes** (CSS `position: sticky`, no wheel hijacking). Each render starts in darkness and a WebGL **light sweep** turns the room on as you scroll. The project title is set very large. |
| Statement | Static quote | **Kinetic type:** the philosophy line lights up word by word as you scroll, like light passing across a wall. |
| Services | Cards, tabs or accordion | A giant typographic list of the four kinds of space. Hover or focus brings up light on a render behind it. The stages are written as one editorial sentence, not columns. |
| Libraries | Mostly CSS | **Three.js** (hero and light sweep) plus **GSAP ScrollTrigger** (scrubbed light, kinetic type). Framer Motion is still not needed. No Lenis. |

**Kept from the foundation:** brand colours and type, honest "Design visualisation" labels, verified copy only, one contact label, no intro gate (the 3D hero renders behind real HTML text, and the text is readable from the first frame), no custom cursor, no autoplay video.

**Guardrails for cinematic motion** (from 01 §12 and docs/02 §6):

- **Reduced motion:** with `prefers-reduced-motion: reduce`, the 3D hero shows one still lit frame, words are fully lit, renders are fully lit, scenes are not pinned and reveals are instant.
- **No WebGL:** the HTML and image fallbacks carry all content.
- **Mobile:** pins are released below 768 px (NN/g: scroll-linked effects are worst on mobile). The light sweep becomes a short reveal. The 3D hero renders at lower resolution with a smaller shadow map.
- **Performance:**
  - The render loops run only while their section is on screen and the tab is visible.
  - Three.js is loaded as a module after the HTML.
  - Device pixel ratio is capped at 1.75.
  - The hero text is real HTML, so it is visible before any WebGL work finishes.
