# ARCHIO v10 — Production Audit & Remediation Report

**Status: NOT YET PRODUCTION-VERIFIED.** This is a source-level audit of the static React/Vite website archive. The project contains no Express server, MongoDB database, first-party API, authentication, or admin panel; those checks are not applicable to this architecture. Contact submissions are sent from the browser to Web3Forms.

## Confirmed fixes included in this package

- Secret/package hygiene: release excludes `.env` files (except `.env.example`), `.vercel/`, dependencies, build output, caches, and prior Playwright artifacts. The prior source archive had a Vercel OIDC token file; it is not included. The account owner should check/revoke any credential that may still be active.
- Assets: corrected PNG bytes that had `.jpg` extensions, with asset-signature and responsive-variant validation. `node scripts/check-assets.mjs` passed for 105 public image assets, 31 JPEG sources, AVIF twins, and the responsive image manifest.
- Contact/privacy copy: removed unsupported fixed auto-deletion promises and made Web3Forms/email processing and client retention responsibilities more explicit.
- Node version repeatability: `.nvmrc` specifies Node 24.15.0 and the manifests document a compatible supported engine range.
- Unknown routes: hosting-level 404 page uses the accessible heading “Not found”; unknown project slugs are routed to the app shell for its project-specific not-found handling. Preview middleware is configured to return an HTTP 404 page for other unknown clean paths.
- Header polish: removed the solid bottom border from `.site-header` and updated hero overlap, fallback top padding, and scroll offset to avoid a leftover one-pixel gap.
- Test stabilization: the mobile gallery E2E test waits for both gallery frames before reading their bounding boxes.

## Source-level checks performed in this pass

- ZIP integrity and file structure — passed.
- Asset integrity script — passed.
- Manifest and configuration inspection — reviewed root/client/shared package manifests, Vercel rewrites and security headers, Vite build/preview middleware, route definitions, environment example, and project architecture/security docs.
- Secret/artifact filename scan — no `.env` or private key/token files were found in the extracted release package; `.env.example` is intentionally included. A filename scan cannot prove there are no credentials embedded in source history or arbitrary content.

## Checks not completed

The full dependency install timed out in the available environment. The environment has Node 22.16.0, below the repository's declared supported version; therefore this run did **not** verify `npm test`, TypeScript, production build, Playwright/axe, live Vercel headers/routes, or `npm audit`. No test pass count is claimed. Use Node 24.15.0 or another version allowed by `engines`, with registry access, then run:

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

## Remaining release blockers / owner decisions

1. Set the actual production `VITE_SITE_URL` and Web3Forms access key in Vercel. Restrict the public form key to the production domain and submit a real test inquiry to verify delivery. The key is public by design and must never be treated as a server secret.
2. Verify Vercel behavior after deployment: route rewrites, unknown URL HTTP status, static asset content types, CSP/security headers, canonical/OG metadata on inner pages, and form delivery. Local source inspection does not establish live behavior.
3. Have the client confirm legal entity/contact details and approve a real inquiry-retention schedule; obtain qualified legal review of Privacy, Cookies, Terms, jurisdiction, and processor disclosures. This report is not legal advice or a compliance certification.
4. Obtain documentary rights/licences for project renders, team portraits, brand-kit artwork, preloader imagery, and third-party gallery code. Replace any asset whose rights cannot be confirmed. Code inspection cannot establish ownership or permissions.
5. Supply approved high-resolution source photos where current project source images are small, and the missing JLT reception renders if still required by the final design. Upscaling cannot recreate missing source detail.
6. Complete visual QA on the listed viewports (320, 375, 390, 414, 768, 1024, 1280, 1440, 1920px), including desktop/mobile header alignment, gallery stacking, reduced motion, keyboard focus, contrast, and no horizontal overflow. Historical results are not evidence of this archive's current state after these changes.
7. Run dependency vulnerability audit and review any findings before deployment.

## Architecture findings

- Static React + Vite client with shared Zod schemas/data; no own backend/database/admin/accounts.
- Main write flow: browser contact form → Web3Forms → studio email.
- Server-side upload, MongoDB, auth, role-based access and API endpoint checks are not applicable to the present project architecture.

## Final position

The package contains source-level remediation and asset checks, but is **not certified production-ready** until the supported-toolchain test suite, deployment checks, owner-provided configuration, asset-rights confirmation and legal review are complete. No live test, complete security audit, or legal clearance is claimed.
