import { defineConfig, devices } from "@playwright/test";

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./src/tests/e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: "list",
  timeout: 5000,
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  webServer: [
    {
      command: "npm run test:db:push && npm run dev",
      url: "http://localhost:3000",
      reuseExistingServer: false, // Never reuse existing server to avoid conflicts
      timeout: 120 * 1000,
      env: {
        NODE_ENV: "test",
      },
    },
  ],

  globalSetup: "./src/tests/helpers/global-setup.ts",
  globalTeardown: "./src/tests/helpers/global-teardown.ts",
});