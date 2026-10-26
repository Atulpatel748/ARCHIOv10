# 03 — Brand and Asset Inventory

Prepared 2026-10-25. Every fact below was read directly from the three files the owner supplied in `D:\ARCHIO`. Nothing here is invented. Where a fact is inferred rather than read, it says so.

## 1. Source files (preserved, never modified)

| File | Type | Size | SHA-256 (recorded before any work) |
|---|---|---|---|
| `Archio Logobrand kit.pdf` | 9-page brand kit, 1500×1500 pt pages, made in Canva | 9.6 MB | `DE74088A424D3FB55158BD322CFF7D9500A3FB1A35CCB180A23C360D011BD488` |
| `Archió Company Profile.pdf` | 24-page company profile, 1440×810 pt (16:9), made in Canva. The filename uses a decomposed "o + combining acute" (`Archio%CC%81`). | 35.8 MB | `A23CAA88D2F56AE1604A3F0C2D5F3F01A1553B47E1D4264AE96684BFEE184283` |
| `logo.png` | Monogram icon, 90×88 px, RGB with no alpha, sand background | 8 KB | `5DBEBE41D5DA6340B3EF55D11C5BB21B5DAD55AA784BE85AC676A18172BBE287` |

There is no website code, no starter project, no `package.json` and no screenshot in the folder. The brief mentions "the supplied screenshot", but none was supplied, so the technology stack could not be checked against one.

## 2. Brand kit — page by page

| Page | Content | Status |
|---|---|---|
| 1 | Wordmark **ARCHIÓ** in blush on oxblood `#4C1114` | Approved brand asset |
| 2 | Wordmark in oxblood on blush `#CEB6A8` | Approved |
| 3 | Wordmark in oxblood on sand `#DACFBA` | Approved |
| 4 | Letter grid: A R C / H I Ó, widely spaced | Approved (brand motif) |
| 5 | **Monogram**: a large Optima "O" enclosing "Á" (the acute breaks out above the A) | Approved; this is the shape in `logo.png` |
| 6 | **Horizontal lockup**: Ó + ARCHIO. The accent is on the large Ó and absent from the small wordmark. | Approved |
| 7 | Moodboard on blush: oxblood doors with brass pulls, plaster stairs, arched plaster wall in raking light, oxblood velvet sofa, draped silk, embossed floral plaster, heels against a curtain | **Reference only.** The ten images are 615–853 px wide, Pinterest-sized, and of unknown ownership. They must not be published. |
| 8 | Palette on off-white `#F8F7F4`: `#4C1114`, `#CEB6A8`, `#DACFBA` | Approved |
| 9 | Typography: "Primary font – optima, font size 65.7"; "Secondary font – public sans (website, proposals, UI) size 48"; "Lora, third body font – portfolio, brochures, write ups size 48" | Approved |

### Verified brand tokens

| Token | Value | Source |
|---|---|---|
| Oxblood | `#4C1114` | Kit p.8 (hex printed); fill on p.1 |
| Blush | `#CEB6A8` | Kit p.8; fill on p.2 and p.7 |
| Sand | `#DACFBA` | Kit p.8; fill on p.3–6 |
| Off-white ground | `#F8F7F4` | Kit p.8–9 page fill (read from the PDF content stream; not printed as a swatch) |
| Profile maroon | `#431718` | Company profile background fill. **Conflict:** slightly darker than the kit's `#4C1114`. The website follows the kit. |
| Profile text sand | `#DACFBA` | Profile text fill; matches the kit |

### Typography

| Role (per kit) | Font | Licence | Web plan |
|---|---|---|---|
| Primary / display | Optima (embedded as `OptimaLTPro-Roman`) | Commercial (Linotype/Monotype). Web use needs a paid webfont licence. | **Owner decision 2026-10-25: not licensed.** The logo uses vector outlines (below). Headings use the closest open-licence face, chosen in docs/04. |
| Secondary: website, UI | Public Sans | SIL OFL (free) | Self-host with `next/font` |
| Body: portfolio, write-ups | Lora | SIL OFL (free) | Self-host with `next/font` |

## 3. Logo files recovered as vectors

The brand kit embeds Optima as TrueType subsets. A one-off script rendered the glyph outlines from pages 1, 4, 5 and 6 into SVG paths. The script is in the session scratchpad, not the project. The outputs are exact geometry from the approved kit, not redrawn or retyped. They use `fill="currentColor"`, so CSS sets their colour.

| File | Content | Aspect |
|---|---|---|
| `design-previews/shared/logo-wordmark.svg` | ARCHIÓ wordmark | 248 × 61 |
| `design-previews/shared/logo-monogram.svg` | O + Á monogram | 376 × 359 |
| `design-previews/shared/logo-lockup.svg` | Ó + ARCHIO horizontal lockup | 452 × 209 |
| `design-previews/shared/letter-grid.svg` | A R C / H I Ó grid | 1012 × 789 |

**Status: provisional.** They are accurate for previews and probably for production too, but the client should still supply the master vector logo files (SVG, AI or EPS) so the final site uses the originals. The favicon and app icons will be generated from `logo-monogram.svg`. `logo.png` (90 px, no transparency) is too small for any web use.

## 4. Company profile — verified content

| Page | Section | Content (summary; quoted copy is the client's own) |
|---|---|---|
| 1 | Cover | "Archió — Interior Design Studio — A unit of Beracah Trading" |
| 2 | About Us | "An interior design consultancy focused on creating spaces that work functionally, aesthetically, and commercially." Works closely with clients to understand how a space must perform. The team has "a strong foundation in luxury residential and high-end commercial design" and a stated "track record"; it applies this "to Dubai's market across residential, commercial, and mixed-use environments". |
| 3 | Our Team | **Pooja Vijayakumar**, Co-Founder, Design. **S. Harshitha**, Co-Founder, Strategy & Growth. Two circular portraits (479×720 source). |
| 4 | Our Approach | "WE EXECUTE WHAT WE DESIGN". "We don't just design spaces. We guide decisions." Process benefits: clear direction from concept to execution; efficient use of budget and resources; practical solutions for real-world use; consistent communication. |
| 5 | Our Services | "We focus primarily on consultancy-based interior design": Interior Design Consultation; Concept Development; Space Planning; Material & Finish Selection; Design Review & Advisory; Project Coordination Support. |
| 6 | Vision / Mission | Vision: purposeful spaces, "form always serves function". Mission: "design solutions rooted in clarity and practicality… honest, expert advice". |
| 7 | Why Choose Us | "We measure success in outcomes, not optics." Function equal to aesthetics; unbiased, consultancy-driven advice, "not sales-driven"; solutions shaped by real constraints; clear communication from brief to handover; "involvement where it matters". |
| 8 | Our Philosophy | "Good design is not about making something look expensive. It's about making it work efficiently, intuitively, and consistently." |
| 9 | Our Projects | Cover with 01 / 02 / 03 |
| 10–15 | 01 Residential | **Dubai Marina, 2,500 sqft.** 12 images: double-height living room with marble, a bar under the stair, dining, kitchens, bedrooms (including a child's room), dressing, media wall. The copy says "We design and build interiors…". |
| 16–20 | 02 Commercial | **JLT, 2,000 sqft.** 10 images: reception (the wall reads "LOGO"), boardroom, open office, private offices, pantry. |
| 21–23 | 03 Landscape | **Arabian Ranches 2, 6,500 sqm.** 6 images: entrance path with palms, pergola, outdoor kitchen, pool, night lighting. "Classic Arabian architecture and a relaxed, resort-style way of living outdoors." |
| 24 | Contact | "Let's Build Something Purposeful". **+971 55 654 1410**, **info@beracahlogistics.com**, Instagram **Archio_designstudio**. "A unit of Beracah Trading". |

Text was extracted programmatically from the PDF. Some display headings come out without the letter "E" ("PROJCTS", "RSIDNTIAL", "COMMRCIAL", "LANDSCAP"). On screen they render correctly, so this is a gap in the font's Unicode map, not a typo in the profile.

## 5. Extracted imagery (`design-previews/assets/profile-extract/`)

All 31 unique raster images were extracted once (duplicates removed by hash). `manifest.json` maps each file to its profile pages. JPEG streams were copied byte-for-byte. Flate images were re-encoded losslessly to PNG. Four images had a soft-mask (alpha) layer that was dropped; it only shapes their corners on the slide.

| Group | Files | Size | What it is | Use |
|---|---|---|---|---|
| Velvet texture | `p02-…a2024904.jpg` | 800×534 | Oxblood velvet background, probably Canva stock | Do not use; licence unknown |
| Blueprint texture | `p10-…6d92288e.jpg` | 800×533 | Faded floor-plan background behind project pages | Do not use; licence unknown |
| Founder portraits | `p03-…` (2) | 479×720 | Pooja Vijayakumar, S. Harshitha | Placeholders; need full-res originals and permission |
| Project covers | `p09-…` (3) | ≤800 px | Residential bedroom, commercial office, landscape pool | Placeholders |
| Residential | `p10`–`p15` (12) | ≤800 px | Dubai Marina visualisations | Placeholders |
| Commercial | `p16`–`p20` (10) | ≤800 px | JLT visualisations | Placeholders |
| Landscape | `p21`–`p23` (6) | ≤800 px | Arabian Ranches 2 visualisations | Placeholders |

**Quality finding.** Every image is at most 800 px on its long side. A full-bleed hero on a 1440 px, 2× display needs roughly 2880 px, and a half-width tile about 1440 px. At 800 px these images will look soft at any meaningful size. They are fine for layout previews only.

**Nature of the imagery.** The images look like 3D renders: perfect materials and lighting, and a "LOGO" placeholder on the JLT reception wall. **Owner decision 2026-10-25:** the site labels them as *design visualisations* and never as completed or photographed projects.

## 6. Conflicts and decisions

| # | Conflict | Resolution |
|---|---|---|
| 1 | Name spelling: "ARCHIÓ" (kit wordmark), "Archió" (profile), "ARCHIO" (lockup, the brief) | Display: **ARCHIÓ** / **Archió**, as in the kit. Plain-text fallbacks (URLs, file names, slugs): `archio`. The legal or trading name to show in the footer needs confirming (see §7). |
| 2 | Oxblood `#4C1114` (kit) vs `#431718` (profile) | The kit wins: `#4C1114`. |
| 3 | "Consultancy-based interior design" (p.5) vs "We design and build…" (p.10, p.21) and "We execute what we design" (p.4) | **Owner decision: consultancy-led.** The site presents design consultancy with execution *coordination* and makes no contracting or build claims. "We execute what we design" is not used as a headline unless the client confirms they carry out execution. |
| 4 | The brief lists residential, commercial and mixed-use; the profile adds landscape | **Owner decision: four categories.** Mixed-use is presented as a service with no project, because none exists yet. |
| 5 | The contact email is on `beracahlogistics.com`, the parent company's logistics domain | Use it as supplied for now and ask whether ARCHIÓ has, or will have, its own domain and mailbox. |
| 6 | The profile's "track record" and "strong foundation in luxury residential…" claims | These are the client's own words, so they may be used as written. Nothing stronger (years, project counts, awards) may be added. |
| 7 | Optima is in the kit but unlicensed for the web | **Owner decision:** vector logo plus an open-licence heading face. |

## 7. Missing materials — request list for the client

1. **Original project renders** at 2400 px or larger (ideally the renderer's full output), for all 28 project images and the 3 covers, with confirmation that ARCHIÓ owns or may publish them.
2. **Built-project photographs**, if any exist. They would add credibility next to the visualisations.
3. **Master logo files** (SVG, AI, EPS or PDF vector), so we can confirm the recovered outlines.
4. **Founder portraits** in full resolution, with written permission to publish. Short bios are optional; we will not write any ourselves.
5. **Domain and email**: the site's domain, and whether to keep `info@beracahlogistics.com`.
6. **Legal and trading line** for the footer, e.g. "ARCHIÓ is a unit of Beracah Trading", plus a trade licence number if they want one shown.
7. **Location**: an office address, or the service area to state (for example "Dubai, UAE"), for the contact page and local SEO. Without it, the site says "Dubai" only, as the profile does.
8. **Project details** they are happy to publish beyond location and area: brief, scope of ARCHIÓ's role, year, status (concept or in progress).
9. **Mixed-use work**, if any exists.
10. **Language**: is an Arabic version wanted? The default is English only.
11. **Enquiry handling**: who receives website enquiries, and is WhatsApp on +971 55 654 1410 acceptable as a contact channel?

## 8. Recommended usage summary

- **Logo.** Use the lockup in the header on desktop, the monogram alone for compact or mobile headers, the favicon and social images, and the wordmark in the footer and on the OG image. Logos sit only on `#F8F7F4`, `#DACFBA`, `#CEB6A8` or `#4C1114` grounds, in oxblood or sand, never on photographs without a solid field behind them.
- **Colour.** Oxblood is the ink and accent; off-white and sand are the grounds; blush is a quiet secondary tone. Contrast pairings get checked in docs/04: oxblood on off-white passes WCAG AA easily, but blush text on sand fails and must never carry text.
- **Type.** Public Sans for UI (navigation, labels, forms, captions). Lora for long-form project and studio writing. An open-licence display face stands in for Optima in headings.
- **Imagery.** Use only the client's project visualisations, each with a visible "Design visualisation" label. No stock photography is presented as ARCHIÓ work. Moodboard images are mood guidance for art direction only.
