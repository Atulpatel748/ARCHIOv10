import { defineConfig } from '@playwright/test';

const baseURL = process.env.E2E_BASE_URL ?? 'http://localhost:4173';
const chromiumPath = process.env.PLAYWRIGHT_CHROMIUM_PATH;
const launchOptions = {
  ...(chromiumPath ? { executablePath: chromiumPath } : {}),
  ...(process.env.PLAYWRIGHT_CHROMIUM_ARGS ? { args: process.env.PLAYWRIGHT_CHROMIUM_ARGS.split(' ') } : {}),
};

export default defineConfig({
  testDir: './e2e',
  timeout: 45_000,
  expect: { timeout: 8_000 },
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { baseURL, trace: 'retain-on-failure', launchOptions },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1440, height: 900 } } },
    { name: 'mobile', use: { viewport: { width: 390, height: 844 } }, testMatch: /public\.spec\.js|inquiry\.spec\.js/ },
  ],
  // The built site only. The contact form posts to Web3Forms, so inquiry.spec.js answers that request itself.
  webServer: process.env.E2E_NO_SERVER
    ? undefined
    : {
        // Builds first, so the tests always run against the current source, with a stand-in form key (a build without a
        // real key refuses to send, and the tests answer Web3Forms themselves).
        command: 'npm run build -w client && npm run preview -w client -- --port 4173 --strictPort',
        env: { WEB3FORMS_ACCESS_KEY: 'e2e-test-key' },
        url: baseURL,
        reuseExistingServer: false, // never test an old build left running on 4173; a stray server fails the start loudly instead
        timeout: 120_000,
      },
});
