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
  // The built site only: the contact-form function does not run under `vite preview`, so inquiry.spec.js answers
  // /api/v1/inquiries itself (the function has its own tests in client/api).
  webServer: process.env.E2E_NO_SERVER
    ? undefined
    : { command: 'npm run preview -w client -- --port 4173 --strictPort', url: baseURL, reuseExistingServer: true, timeout: 60_000 },
});
