# ARCHIO v10 — final release checklist

This checklist separates code work from decisions and access that only the studio or account owner can provide.

## Studio facts and access

- [ ] Confirm the registered legal entity name and parent-company relationship.
- [ ] Confirm the real inquiry/contact email, phone, address and UAE trade-licence details in `client/src/constants/site.js`.
- [ ] Confirm the purchased domain and set `VITE_SITE_URL` in Vercel to its canonical HTTPS origin.
- [ ] Set the Web3Forms access key in Vercel, restrict it to the production domain in Web3Forms, redeploy and submit a real test inquiry.
- [ ] Check Vercel for any active token/session associated with the `.env.local` file found in the original archive; revoke any active credential that may have been exposed. Do not distribute the original `.7z` archive.

## Legal and data handling

- [ ] Have qualified counsel review the Privacy notice, Cookie policy and Terms for the studio's actual business entity and operating jurisdictions.
- [ ] Name and document the Web3Forms, hosting and email-provider relationships as appropriate under the providers' current terms.
- [ ] Approve an inquiry-retention schedule and assign responsibility for deletion in the studio inbox, exports and backups. The static website has no database or automatic deletion job.
- [ ] Confirm the response-time promise shown on the Contact page can be met by the studio.
- [ ] Confirm the live deployment does not set non-essential cookies or load unlisted analytics/tracking integrations.

## Asset rights and quality

- [ ] Document permission/licences for every project render, team portrait, the preloader background photo, brand-kit asset and the source/licence for `client/src/components/ui/morph-gallery.tsx`.
- [ ] Confirm the final JLT reception renders and their project descriptions before adding them as `10.jpg` and `11.jpg`; the versions with a placeholder “LOGO” are intentionally absent.
- [ ] Ask the studio for higher-resolution originals for the Dubai Marina and JLT galleries; do not upscale low-resolution images and present them as originals.
- [ ] With Node 24.15.0 or another compatible version, run `npm run images -- --force` to rebuild responsive AVIF variants from the corrected JPEG fallbacks.

## Automated and live verification

- [ ] `npm ci`
- [ ] `npm run check:assets`
- [ ] `npm test`
- [ ] `npm run typecheck -w client`
- [ ] `npm run build`
- [ ] `npm run test:e2e`
- [ ] `npm run audit:deps`
- [ ] Deploy and check known direct links (including project detail URLs) on desktop and mobile.
- [ ] Check that a random unknown path and an unknown project slug return HTTP 404 and show the custom 404 page.
- [ ] Verify security headers, AVIF `Content-Type`, page canonical/Open Graph tags, contact-form delivery, keyboard operation and reduced-motion behavior on the live domain.
- [ ] Re-run Lighthouse / PageSpeed on the production URL and visually inspect mobile breakpoints.

**Release gate:** do not declare production certification complete until all items are either checked or formally accepted by the studio. Legal sign-off, asset ownership, account-level token revocation and live hosting behavior cannot be established from source code alone.
