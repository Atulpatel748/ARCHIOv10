# 05 — Design Options (Approval Gate 1)

Prepared 2026-10-27. Three distinct directions for ARCHIÓ, built as browser prototypes on the same brand kit, the same verified copy and the same images. That way the comparison is about **direction**, not content. Strategy, tokens and rules are in docs/04; research in docs/01 and docs/02; brand facts in docs/03.

**Nothing in production has been built.** The Next.js implementation starts only after you choose a direction.

## Round 2 — Option D: Cinematic Light (current proposal)

**Owner feedback on round 1 (A–C):** too safe or plain, too template-like, wrong mood. The owner chose the **Cinematic light** mood and **cinematic** motion. D is one fully developed prototype in that direction. The art direction is in docs/04 §10.

**Concept.** A gallery at dusk. The site begins in darkness, and light reveals the work. The client's moodboard already holds the key image: an arched plaster wall in raking light. D turns it into the site's language: plaster, low sun and long shadows, with oxblood, sand and paper as the colours of light.

| | |
|---|---|
| **Hero** | A **real-time 3D Ó monogram**, extruded from the brand kit's own Optima outline, standing in plaster against a plaster wall. A warm low sun rises on load and casts real shadows (the Á's shadow falls inside the ring). The light follows the pointer like a lamp you can move, and sets to dusk as you scroll away. Headline "Spaces that work." in very large Belleza. The text is real HTML, readable from the first frame; there is no intro gate. |
| **Statement** | "Good design is not about making something look expensive…" lights up **word by word** as you scroll, like light passing across a wall. Unlit words stay at 4.14:1 contrast, so the text is never unreadable. |
| **Projects** | Three **pinned full-screen scenes** (CSS `sticky`, native scrolling, no wheel hijacking). Each render starts in darkness and a **WebGL light sweep** turns the room on as you scroll, with a slow push-in. Sweep direction alternates left and right. The project title is set very large over the scene. Category, area and the **"Design visualisation"** status are always shown. |
| **Services** | The four kinds of space as a **giant typographic list**. Hover, focus or press one and the light comes up on a render behind the list. The stages are written as one editorial sentence, not columns. |
| **Studio and contact** | "We don't just design spaces. We guide decisions." rising line by line; founders named; contact on darkness with a soft slit of light; a large tone-on-tone oxblood wordmark in the footer. |
| **Palette** | **Night `#140708`**, a very dark shade derived from the kit oxblood (**owner to approve** as a brand extension), with sand and paper as light and blush as secondary. Contrast on night: paper 18.43:1, sand 12.80:1, blush 10.23:1, dimmed service names 4.27:1. |
| **Libraries** | **Three.js** (3D hero and light sweep, loaded as modules after the HTML) and **GSAP ScrollTrigger** (scrubbed light and words). No Framer Motion, no Lenis, no custom cursor. |
| **Taste dials** | 9 / 8 / 2 |

**Screenshots** (headless Chrome, software WebGL):

| Width | Captures |
|---|---|
| 1440 | [hero](../design-previews/screenshots/option-d-1440-fold.jpg); [statement lighting up](../design-previews/screenshots/option-d-1440-stop-1.jpg); [Dubai Marina mid-sweep](../design-previews/screenshots/option-d-1440-stop-2.jpg); [JLT mid-sweep, mirrored](../design-previews/screenshots/option-d-1440-stop-3.jpg); [Arabian Ranches 2](../design-previews/screenshots/option-d-1440-stop-4.jpg); [full page](../design-previews/screenshots/option-d-1440-full.jpg) |
| 1024 | [full page](../design-previews/screenshots/option-d-1024-full.jpg) |
| 390 | [hero](../design-previews/screenshots/option-d-390-fold.jpg); [scene](../design-previews/screenshots/option-d-390-stop-2.jpg); [full page](../design-previews/screenshots/option-d-390-full.jpg); [menu](../design-previews/screenshots/option-d-390-menu.jpg) |

The full-page captures are taken at scroll position 0, so the scenes show unlit and the sticky stages leave gaps. The "stop" captures show the real mid-scroll states. The live prototype is the true reference.

**Verified for D:**

- **Layout and loading, at 1440, 1024 and 390:** no horizontal overflow, broken images or console errors.
- **Hero:** renders with shadows in a real GPU browser and in headless Chrome.
- **Light sweeps and word lighting:** progress with scroll (captured mid-way).
- **Services:** buttons toggle `aria-pressed` and the matching light.
- **Reduced motion emulated:**
  - `no-motion` mode is on, and all words are fully lit;
  - no light sweeps start (renders shown lit);
  - the 3D hero renders one still frame.
- **Without WebGL:** a flat monogram and plain images remain. This fallback is coded but was not exercised with WebGL actually disabled.

**Not verified yet:**

- Frame rate on a mid-range phone.
- Safari and Firefox.
- Production bundle weight (Three.js is estimated at 150–180 KB gzip and must be measured).
- Lighthouse.

The browser's automatic `/favicon.ico` request returns 404 on the preview server; it is harmless, and production ships real icons.

**Trade-offs to accept with D:**

- It is the heaviest direction: two WebGL uses plus GSAP.
- It depends most on **sharp, high-resolution renders**, because full-screen scenes expose the current 800 px placeholders.
- The dark "night" shade is an extension of the brand kit that the owner must approve.
- Cinematic sites are polarising: brilliant for brand impression, slower for someone who only wants a phone number. The phone number, WhatsApp and contact stay one tap away in the header and menu.

**Decision needed:** approve D as the direction, or name the changes (for example: lighter scenes, a different hero line, no 3D on phones). Once it is approved: Phase 6 (implementation plan, docs/06), then a detailed multi-page preview at Approval Gate 2.

---

## Round 1 (archived): options A, B and C

The owner reviewed these and asked for a bolder, less template-like direction with a different mood. They are kept for reference.

## How to view the prototypes

```bash
node design-previews/serve.mjs
```

Then open http://localhost:4173/. That page links to all three options. In Claude Code the same server is registered as **design-previews** in `.claude/launch.json`.

Screenshots are in `design-previews/screenshots/`, captured at **1440×900, 1024×768 and 390×844** with headless Chrome by `design-previews/screenshot.mjs`. For each width there is a fold image (`-fold.jpg`) and a full-page image (`-full.jpg`); at 390 there is also the open menu (`-menu.jpg`). A static screenshot does not prove an interaction works; the interactions were tested separately (see "What was verified").

## Shared across all three options

- **Brand.**
  - Exact vector logos recovered from the brand kit.
  - Kit colours: `#4C1114` oxblood, `#CEB6A8` blush, `#DACFBA` sand, `#F8F7F4` off-white.
  - Belleza standing in for Optima; Public Sans for UI and body; Lora for long-form text (A and B).
- **Copy.** Taken from the company profile wherever possible: "Spaces that work", "Form serves function", "We don't just design spaces. We guide decisions.", the philosophy, approach and "why choose us" lines. Punctuation was adjusted (no em-dashes). Three things are marked as placeholders rather than invented:
  - the mixed-use description;
  - service deliverables;
  - project names, which are working titles.
- **Honesty.**
  - Every project carries **"Design visualisation"** as its status, and the footer repeats that all project images are visualisations.
  - No testimonials, counters, awards or invented facts.
  - The founders are named with their roles from the profile.
- **Sections.** All three show the header and navigation (including the open mobile menu), hero, project showcase, services (four categories and the six services grouped Define / Design / Support), contact form and footer. Each option also includes one trust section in its own form.
- **Contact.** One label everywhere: "Start a conversation". The form asks for name, email or phone, project type, optional details and a consent line. It is not connected: submitting shows validation, then "Preview only… nothing was sent."
- **Motion rules.**
  - No intro gate, no preloader, no custom cursor, no smooth-scroll library, no autoplay.
  - Reveals respect `prefers-reduced-motion`.
- **Images.** Low-resolution placeholders extracted from the profile (at most 800 px), so they look soft at large sizes. The original renders are required before the build (docs/03 §7).

---

## Option A — Plaster and Light

**Editorial architectural minimalism.** An off-white page where oxblood is used only as ink, like a well-printed architecture monograph. The work and the words carry the brand; colour stays in reserve until the contact section, where it arrives as a full oxblood field.

| | |
|---|---|
| **Homepage composition** | 1. Split hero: a short Belleza headline ("Spaces that work.") with lede and CTA on the left; a tall render bleeding off the right edge. 2. Type-only philosophy statement. 3. **Asymmetric editorial work grid**: a large residential image, a smaller commercial one dropped lower, a wide landscape one offset. 4. The Ó aperture: one circular framed image beside the approach text, on sand. 5. Services as four categories plus a Define, Design, Support timeline. 6. Contact on oxblood. 7. Footer with a large wordmark. |
| **Typography** | Belleza display at up to 100 px; Public Sans 300 for body; Lora for the philosophy follow-up and approach text. |
| **Colour** | Off-white page; oxblood ink (14.03:1); sand for the approach band; oxblood as the single full field for contact and footer. |
| **Images** | Large, uncropped-feeling renders with generous margins. One circular aperture as the brand signature. Captions below the images, never on them. |
| **Navigation** | Visible desktop nav with an underlined "Start a conversation". "Menu" text button on phones (full-screen sheet, focus managed). |
| **Motion** | Near-still: text rises 12 px and fades (450 ms); images reveal with a clip-path wipe (900 ms, once); a gentle 1.03 image scale on hover (pointer devices only). |
| **Project presentation** | Editorial grid with a facts line under each image (category, area, status). |
| **Libraries implied** | None beyond a little JS (IntersectionObserver). GSAP only if project pages need sequencing. Three.js optional. |
| **Advantages** | Calmest and most legible. Renders read true on a light ground. Closest to how research says premium studios behave (restraint, one focal point per screen). The lightest page to build and to load. Ages well. |
| **Trade-offs** | The least immediately "ownable" colour impression. It relies more on image quality than B or C, which makes the original renders essential. |
| **Why it may suit ARCHIÓ** | It presents a young studio's work with confidence and makes no claims it cannot back. The oxblood contact field makes the brand colour the moment of action. |
| **Taste dials** (variance / motion / density) | 7 / 4 / 3 |

Screenshots:

- [desktop fold](../design-previews/screenshots/option-a-1440-fold.jpg) · [desktop full](../design-previews/screenshots/option-a-1440-full.jpg)
- [tablet full](../design-previews/screenshots/option-a-1024-full.jpg)
- [mobile fold](../design-previews/screenshots/option-a-390-fold.jpg) · [mobile full](../design-previews/screenshots/option-a-390-full.jpg) · [mobile menu](../design-previews/screenshots/option-a-390-menu.jpg)

---

## Option B — The Oxblood Room

**Warm, material-led, immersive.** The whole site sits inside the brand's oxblood, as the company profile does, with sand and blush type. It feels like stepping into a lined room. The home page's project showcase is the **WebGL ("GL") slider**: a plaster-like displacement sweep between the three projects.

| | |
|---|---|
| **Homepage composition** | 1. Statement hero: "Form serves function." in paper, "Not the other way around." in blush; a short lede and CTA at the right. 2. The **GL project slider** directly beneath, full content width, with project title, facts, status and three named controls (Residential, Commercial, Landscape). 3. Philosophy with three **material details** cropped from the visualisations (upholstered panels, book-matched marble, timber joinery). 4. Services as **tabs** for the four categories, each with an image, then the stages. 5. "We guide decisions" with the two founders named. 6. Contact. 7. Footer with the monogram. |
| **Typography** | Belleza in paper and blush on oxblood; Public Sans 300 in sand for body; Lora for philosophy text. |
| **Colour** | One dark theme throughout: oxblood ground, deeper `#3B0C0F` panels, sand body text (9.74:1), blush secondary (7.79:1), paper for headings (14.03:1). |
| **Images** | Framed within the oxblood field. Material close-ups bring texture forward. |
| **Navigation** | Wordmark left; nav with an outlined "Start a conversation". Full-screen deep-oxblood sheet on phones. |
| **Motion** | One signature moment: the 1.2 s WebGL transition, only when the visitor chooses a project (no autoplay; arrow keys work). It falls back to a CSS crossfade without WebGL or with reduced motion. Small reveals elsewhere. |
| **Project presentation** | One project at a time, cinematic, with facts and the status label always visible. |
| **Libraries implied** | **Three.js** for the slider, lazy-loaded after first paint. An estimated 150–180 KB gzip, since Three.js tree-shakes poorly; to be measured in the build. GSAP optional. |
| **Advantages** | The strongest brand recall: unmistakably the colours of the profile and kit. Uses Three.js and "GL sliders" from the requested stack where they add value. Most atmospheric. |
| **Trade-offs** | A dark site is harder for long reading and for form-heavy pages. Renders look heavier and less accurate on oxblood. The 800 px placeholders show their softness more in the large slider. Most JavaScript of the three. The light/dark contrast inside the images is high. |
| **Why it may suit ARCHIÓ** | If the studio wants to be remembered first and read second. It extends the company profile's look directly onto the web. |
| **Taste dials** | 7 / 6 / 3 |

Screenshots:

- [desktop fold](../design-previews/screenshots/option-b-1440-fold.jpg) · [desktop full](../design-previews/screenshots/option-b-1440-full.jpg)
- [**WebGL transition mid-way**](../design-previews/screenshots/option-b-gl-transition-midway.jpg)
- [tablet full](../design-previews/screenshots/option-b-1024-full.jpg)
- [mobile fold](../design-previews/screenshots/option-b-390-fold.jpg) · [mobile full](../design-previews/screenshots/option-b-390-full.jpg) · [mobile menu](../design-previews/screenshots/option-b-390-menu.jpg)

---

## Option C — The Consultancy

**Contemporary studio, rational and process-first.** A sand page (the kit's own ground for the wordmark) with a structured, index-like system. It leads with the consultancy claim and treats the work, the services and the reasons to choose ARCHIÓ as clear, scannable information.

| | |
|---|---|
| **Homepage composition** | 1. Claim hero: "We don't just design spaces. We guide decisions." with lede and CTAs, then a **triptych** of residential, commercial and landscape (three sizes, so not equal cards). 2. Work as an **index list** (title, category, area, status) with a sticky **preview pane** that changes on hover or keyboard focus. 3. Services as a **stage-tagged accordion** of the six services, with the four categories as quiet tags. 4. "We measure success in outcomes, not optics." with the five "why choose us" lines and the founders, on an off-white band. 5. Contact with a boxed form on off-white. 6. Footer with a full-width wordmark. |
| **Typography** | Public Sans 400–600 carries most of the page; Belleza for headings and project names. No Lora, which saves one font family. |
| **Colour** | Sand page with oxblood text (9.74:1); off-white bands for the trust section and form; filled oxblood buttons. |
| **Images** | Smaller and more numerous, closer to their native resolution, so the current placeholders look sharpest here. |
| **Navigation** | Compact 64 px header with centred nav and a filled contact button. "Menu" on phones. |
| **Motion** | Minimal: a short image crossfade in the index preview, row indent on hover, accordion icon rotation. |
| **Project presentation** | A list first and imagery second, so visitors compare projects quickly. |
| **Libraries implied** | No animation library needed. |
| **Advantages** | Clearest information and the fastest route to contact. Best fit with the "consultancy, not decoration" positioning. Lightest and most robust. Tolerates low-resolution images best. |
| **Trade-offs** | Less emotional and less image-led than A or B. A sand page risks reading as beige if photography is weak. Feels more like a service business than a design studio. |
| **Why it may suit ARCHIÓ** | If the studio wins work on trust and process, for example with commercial clients and investors, more than on spectacle. |
| **Taste dials** | 6 / 3 / 4 |

Screenshots:

- [desktop fold](../design-previews/screenshots/option-c-1440-fold.jpg) · [desktop full](../design-previews/screenshots/option-c-1440-full.jpg)
- [tablet full](../design-previews/screenshots/option-c-1024-full.jpg)
- [mobile fold](../design-previews/screenshots/option-c-390-fold.jpg) · [mobile full](../design-previews/screenshots/option-c-390-full.jpg) · [mobile menu](../design-previews/screenshots/option-c-390-menu.jpg)

---

## Side-by-side

| | A. Plaster and Light | B. The Oxblood Room | C. The Consultancy |
|---|---|---|---|
| Ground | Off-white | Oxblood (dark) | Sand |
| Feels like | An architecture monograph | A lined, lit room | A well-run studio |
| Hero | Split: words and a tall render | Statement above the GL slider | Claim and a triptych |
| Work on home | Asymmetric editorial grid | One project at a time, WebGL transition | Index list with a preview pane |
| Services | Categories and a stage timeline | Category tabs and stages | Stage-tagged accordion |
| Signature | The Ó aperture | GL displacement transition | Full-width wordmark and index |
| JS weight (prototype) | Lowest | Highest (Three.js, lazy) | Lowest |
| Long reading | Best | Weakest | Good |
| Brand recall | Medium | Highest | Medium |
| Tolerance for current low-res images | Low | Lowest | Highest |
| Uses the requested Three.js / GL slider | Optional | Yes, as the centrepiece | No |

## Recommendation

**A, with B's GL slider as an optional feature.**

**A is the strongest base.** It does what the research says builds trust for a young studio:

- restraint;
- one focus per screen;
- honest labelling;
- images that read true.

It also keeps reading and forms comfortable and has the best performance and accessibility margin. Its oxblood contact field still makes the brand colour unmistakable.

**B's slider is the best use of Three.js in all three options.** If you want the requested WebGL slider, it can replace A's static work grid on the home page. It would sit on A's light ground, while the full grid stays on `/work`. Because B's dark theme carries legibility and image-accuracy costs, I would not take the whole of B.

**Choose C instead** if the studio expects most enquiries from commercial clients who value process over atmosphere.

This is a recommendation. The choice is yours, and any named elements can be combined.

## What was verified (and what was not)

**Verified in headless Chrome (CDP), for all three options at 1440, 1024 and 390:**

- No horizontal overflow; no broken images; no console errors.
- All reveal content visible after scrolling.
- No interactive target under 24 px, apart from the inline "privacy notice" text link, which WCAG 2.5.8 exempts.
- With reduced motion emulated, all content is visible at load and the WebGL slider does not start.

**Interactions checked by script in the browser pane (Chromium):**

- **Form:** empty submit shows four field errors and focuses the first; a valid submit shows the preview-only message.
- **Option B tabs:** click and arrow keys select, only one panel is visible, focus follows.
- **Option C index:** row focus swaps the preview image.
- **Mobile menu (A):** opens with focus on the first link and the page behind inert; Escape closes it and returns focus to the toggle.
- **Option B WebGL slider:** initialises a canvas; the transition was captured mid-way in a real GPU browser.

**Contrast:** every text and UI pair used was computed against WCAG. Examples: oxblood on off-white 14.03:1, sand on oxblood 9.74:1, form border on off-white 3.67:1, error text 8.65:1 or higher.

**Not verified yet** (part of Phases 9–11 after approval):

- Safari, Firefox and real phones.
- Screen-reader passes.
- Lighthouse and Core Web Vitals.
- Production image delivery.

The prototypes load fonts from Google Fonts for convenience. Production self-hosts them through `next/font` (docs/04 §5.2).

## Decisions needed at Gate 1

1. **Direction:** A, B, C, or a named combination (recommended: A, with B's GL slider on the home page).
2. **Hero line:** "Spaces that work." (A), "Form serves function." (B), "We guide decisions." (C), or another of the studio's own lines.
3. **Service grouping** by stage (Define, Design, Support): correct for how the studio works?
4. **Contact label:** "Start a conversation", OK?
5. **Original renders and logo files** (docs/03 §7). They are the main blocker for image quality, whichever direction is chosen.
