# ARCHIÓ — Motion for React / Framer Motion integration

This source copy adds real Motion for React components to the existing ARCHIO homepage. Motion for React is the current name for the React animation library commonly called Framer Motion. The source uses the official modern package entry point:

```jsx
import { motion, useReducedMotion } from 'motion/react';
```

## Included homepage interactions

- Reveal-on-scroll for the studio manifesto and selected-work heading.
- Staggered project-card entrances as the selected-work section enters view.
- Spring-based hover lift and tap feedback on featured project links.
- Small arrow feedback on project links.
- Motion-controlled lift/tap response on the existing “View all projects” CTA wrapper.
- Reduced-motion handling through `useReducedMotion()`.
- Existing ARCHIÓ hero-logo docking, slideshow logic, “We design” scroll sequence, header and original color/theme CSS remain in place.

## Setup on your PC

The archive's original `package-lock.json` does not yet include the new package because the build environment could not reach npm. **Run `npm install` first** from the folder containing the root `package.json`; this updates the lockfile and installs the `motion` dependency. Do not run `npm ci` until that lockfile has been updated.

```bash
npm install
npm run build
npm test
npm run dev
```

The site runs with the existing project scripts. Open the localhost URL printed by Vite in your browser.

## Scope / validation note

This is a separate source copy; the uploaded original archive has not been changed. The private `.env.local` file was deliberately not copied into this deliverable; use the private file from your original source and do not publish secrets. The JSX integration is written, but a production build could not be run in the current environment because npm registry access failed with `EAI_AGAIN`. After `npm install` succeeds on a network-connected machine, run the build and tests above before deploying.
