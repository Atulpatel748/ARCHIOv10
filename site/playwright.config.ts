import { defineConfig, devices } from '@playwright/test';

const PORT = 3100;
const baseURL = `http://localhost:${PORT}`;

// End-to-end tests run against the production build, the code visitors get. Not part of `npm run check`: they need a build.
export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  outputDir: 'test-results',
  use: {
    baseURL,
    // Deterministic by default: no autoplay, no WebGL transition (ADR-005), no preloader minimum. Tests that need motion opt out.
    reducedMotion: 'reduce',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  // Firefox runs on GitHub only (CI=true): Playwright cannot start it on the owner's Windows PC.
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    ...(process.env.CI ? [{ name: 'firefox', use: { ...devices['Desktop Firefox'] } }] : []),
  ],
  webServer: {
    command: `npm run build && npm run start -- -p ${PORT}`,
    url: baseURL,
    // Locally an already running server on :3100 is reused, and then the empty Turnstile/SMTP env above does not apply; stop it first if a test depends on that. CI always starts fresh.
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
    // Pin the configuration the tests expect, so a developer's .env.local cannot change it: no Turnstile and no mail settings,
    // which makes the real /api/contact answer 503 not_configured. An empty value wins over .env files in Next.js.
    env: {
      NEXT_PUBLIC_TURNSTILE_SITE_KEY: '',
      TURNSTILE_SECRET_KEY: '',
      SMTP_HOST: '',
      SMTP_PORT: '',
      SMTP_USER: '',
      SMTP_PASS: '',
      CONTACT_TO_EMAIL: '',
      CONTACT_FROM_EMAIL: '',
    },
  },
});
