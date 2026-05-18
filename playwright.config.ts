import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config — smoke tests E2E contra `pnpm dev` en local o contra
 * un preview deployment en CI.
 *
 *   - En local: arranca el servidor con `pnpm dev` automáticamente.
 *   - En CI: setea `E2E_BASE_URL` apuntando al preview y se salta el web server.
 */

const baseURL = process.env.E2E_BASE_URL ?? 'http://localhost:3000';
const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './e2e',
  outputDir: './e2e/.results',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 2 : undefined,
  reporter: isCI ? [['html', { open: 'never' }], ['github']] : 'list',
  globalSetup: './e2e/global-setup.ts',
  globalTeardown: './e2e/global-teardown.ts',
  timeout: 30_000,
  expect: { timeout: 5_000 },

  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: isCI ? 'retain-on-failure' : 'off',
    locale: 'es-ES',
    timezoneId: 'Europe/Madrid',
  },

  projects: [
    {
      name: 'setup',
      testMatch: /\.setup\.ts$/,
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: './e2e/.auth/admin.json',
      },
      dependencies: ['setup'],
      testIgnore: /\.setup\.ts$/,
    },
  ],

  // Solo arranca el servidor en local; en CI esperamos que ya esté corriendo
  // (ver e2e.yml — usa `pnpm start` con seed previo).
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: 'pnpm start',
        url: 'http://localhost:3000',
        reuseExistingServer: !isCI,
        timeout: 120_000,
        stdout: 'pipe',
        stderr: 'pipe',
      },
});
