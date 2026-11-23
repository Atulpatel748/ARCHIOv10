# 07 — Content and assets the studio still needs to supply

Written 22 Nov 2026 for the design-improvement branch (`feature/archio-complete-design-improvement`). It updates the request list in `03-BRAND-AND-ASSET-INVENTORY.md` §7 for the fields added in ADR-013. The site already has places for everything below; each shows only once its content exists, so nothing here is visible on the site as a placeholder. Nothing on this list may be filled in by guesswork (CONSTRAINTS.md, floor rules).

## 1. Project status (one per project)

Field: `status` in `site/src/content/projects.ts`. Allowed values: `Design Visualisation`, `In Progress`, `Completed`. Shown on the home cards, the home flagship card and the project page facts.

| Project | What we know | Needed |
| --- | --- | --- |
| Dubai Marina Residence | Studio's questionnaire answer (13 Nov 2026): completed as white-label work. Not verified (CONSTRAINTS.md, E3). All images are renders. | A written status. If "Completed", proof (site photos or client permission), as E3 already asks by 11 Feb 2027. |
| JLT Office | Same as above. | Same. |
| Arabian Ranches 2 Garden | Same as above. | Same. |

## 2. Case-study text (per project, each part optional)

Field: `caseStudy` in `site/src/content/projects.ts`. Parts, in page order: Brief, Challenge, Key decisions, Space planning, Materials, Lighting, Specifications. A part with no text is not shown. One or two short paragraphs each, in the studio's words. Specifications should only list what the studio is happy to publish (no supplier or client names without permission).

## 3. Images

Measured on 22 Nov 2026 in `site/public/images`:

- Every project image file is exactly 3 times the size of its 800 px extract from the company profile (for example 800 × 707 became 2400 × 2121; 626 × 800 became 1878 × 2400). These are enlargements, not originals; the site never calls them originals, but they look soft on large, sharp screens.
- The three hero images were widened to 16:9 with an AI tool (ADR-004) and the 2560 px copy is stretched from 1920 px.
- No two image files are identical. Two JLT renders (`reception-lounge`, `reception-waiting`) are in the folder but not used: the reception wall reads "LOGO" (a render placeholder).
- Founder portraits exist only as 479 × 720 extracts and are not shown, at the studio's request (commit 172bafe).

Needed: the renderer's original files (2400 px or larger) for all project images, real 16:9 hero renders, written confirmation of the right to publish them, and site photographs of any finished project.

## 4. About page

- Founder bios: none supplied; the page shows names and roles only. Short bios (no invented qualifications) if the studio wants them.
- Founder portraits: only if the studio changes its earlier "no photos" decision, in full resolution, with permission.

## 5. Wording to confirm

- Home hero: "We don't just design spaces / We guide decisions" (the studio's own line, company profile p.4) and "Consultancy-led interior design for residential and commercial spaces" (from the brief). The button says "Start a conversation", like the contact page heading; the header pill and other buttons still say "Contact us" or "Start a project". Change it to "Contact us" if the studio wants one wording everywhere.
- The "Our positioning" block on the home page was removed because it repeated the hero line word for word.
