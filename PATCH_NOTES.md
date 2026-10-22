# Patch notes

Changed files:
- `client/package.json`: added the official `motion` package, current Motion for React distribution (formerly Framer Motion).
- `client/src/pages/HomePage.jsx`: replaced the homepage's local CSS-only reveal hooks for the manifesto/selected work with Motion for React scroll reveals, staggered project entry, hover lift, tap feedback, and small arrow animations. Existing hero docking and category scroll sequence are preserved.

Added documentation:
- `FRAMER_MOTION_INTEGRATION.md`
- `SETUP_FIRST.txt`

The source code syntax was checked. Full Vite build and runtime tests could not be executed because the environment cannot resolve `registry.npmjs.org` (`EAI_AGAIN`), so dependency installation/build still needs to run on a network-connected PC.
