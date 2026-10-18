# ARCHIO v10 — Source remediation audit (19 October 2026)

This report describes changes made to the source archive in this delivery. It is not a legal opinion, licence clearance, live deployment check, or certification that the full test suite passes.

## Fixed in this delivery

- **Secret hygiene:** the release source package excludes `.env`, `.env.local`, `.vercel/`, local AI/editor tooling, installed dependencies, caches, and previous test/build artifacts. The uploaded archive contained a Vercel OIDC token file; its value is not reproduced here. The prior audit notes that token had expired on 12 October 2026, but the account owner should still check the Vercel account and revoke any active/reusable credential if the token or session could remain valid.
- **Image MIME/extension correctness:** seven Arabian Ranches renders and one team portrait had PNG bytes under `.jpg` names. The JPEG fallback files have been re-encoded as real JPEGs at their original dimensions, preserving their visual content. AVIF variants are present; run `npm run images -- --force` with the supported Node toolchain before final deployment to regenerate variants from the corrected JPEG fallbacks.
- **Prevent recurrence:** `scripts/check-assets.mjs` now verifies image file signatures, JPEG-to-AVIF twins, and every responsive image variant in `image-widths.json`. It runs automatically before root test/build scripts, as the client workspace lifecycle pre-scripts, and inside the Vite production-build hook (including direct `vite build` deployment commands). The AVIF generator also refuses files with non-JPEG data under a `.jpg` extension.
- **Privacy accuracy:** the Privacy notice now lists all form fields collected, identifies Vercel/Web3Forms/email handling, advises visitors not to submit sensitive details, and no longer promises an unimplemented 24-month deletion job. It says inquiries are delivered by email and the studio must follow a documented retention process.
- **Cookie/storage wording:** the Cookie policy no longer makes an unsupported categorical claim that no cookies can be set in every browser/runtime. It describes the site's use of session storage and the Web3Forms form handoff, and flags production-domain verification.
- **Contact promise:** form timeout guidance now matches the form's stated two-working-day response window.
- **Node version repeatability:** `.nvmrc` now pins Node `24.15.0`, which satisfies the repository's declared engine range. The README uses `npm ci` and documents the asset-integrity command.
- **Terms wording:** the IP clause no longer asserts that every image, render, layout, and brand asset is already owned or licensed. It no longer makes an unsupported blanket ownership/licence claim; asset-rights confirmation remains a launch blocker.

## Checks run for this delivery

- `node scripts/check-assets.mjs` — **passed**: 105 public image assets were scanned; 31 JPEG sources have AVIF equivalents; the responsive image manifest and referenced variants are present.
- File-signature scan after conversion — all `.jpg` files under `client/public/images` now contain actual JPEG data.
- Full automated test suite, typecheck, production build, Playwright/axe run, and `npm audit` — **not verified here**. The working container provides Node `22.16.0`, below the supported project range, and `npm ci` did not complete because package installation stalled. Use Node `24.15.0` or a compatible newer version with registry access, then run the commands below.

```bash
npm ci
npm run images -- --force
npm run check:assets
npm test
npm run typecheck -w client
npm run build
npm run test:e2e
npm run audit:deps
```

## Still requires the client or account owner

1. Confirm the legally registered entity name, actual studio email, address, phone, and UAE trade-licence details in `client/src/constants/site.js`. The code cannot reliably infer these facts from the brand or parent company name.
2. Add `VITE_SITE_URL` for the final production domain and the Web3Forms key in Vercel; restrict the public key to the production domain and send a real end-to-end inquiry to verify delivery.
3. Confirm rights to every project render, team portrait, the preloader background image, brand-kit assets, and the source/licence for `client/src/components/ui/morph-gallery.tsx`. Replace any item whose rights cannot be documented. Only add the two missing JLT reception renders after final, approved files are supplied.
4. Supply higher-resolution source photos for Dubai Marina and JLT. Many source images are only 626–800px wide; enlarging them in code will not restore missing detail. The Arabian Ranches renders remain 3200×2560; the Pooja team portrait remains 1920×1920.
5. Have qualified counsel review the Privacy notice, Cookie policy, Terms, jurisdiction, processor disclosures, data subject rights, and the studio's actual email retention procedure. The text is made more honest by this delivery but is not legal sign-off.
6. Verify live Vercel behavior after deployment: security headers, that every known route loads through the explicit rewrites, that unknown paths return HTTP 404 and display `404.html`, `image/avif` content type, canonical/OG metadata on inner routes, mobile performance, and form delivery. Unknown-path fallthrough and the matching local preview middleware are now implemented, but the live deployment has not been tested. The current static app pre-renders the home route; non-home routes still rely on the client app/shell, so full route-by-route crawler previews need a separately tested pre-rendering/server-rendering change.
7. Check mobile/desktop visual quality with the supplied originals and confirm the design/assets are distinct enough from any reference inspiration. A source-code review cannot confirm contractual, ownership, or originality facts.

## Release position

**Not yet production-certified.** The code-level fixes above are applied to the attached source package, but business facts, third-party access, asset rights, legal sign-off, live hosting behavior, and automated tests remain open. Do not describe this as “everything legally cleared” or “all tests passed” until those steps are completed.
