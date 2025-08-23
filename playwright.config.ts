import { defineConfig, devices } from "@playwright/test";

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: "list",
  timeout: 5000,
  use: {
    baseURL: "http://localhost:3001",
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
      command: "cross-env NODE_ENV=test npm run prisma:push && cross-env NODE_ENV=test concurrently \"next dev -p 3001\" \"cross-env PORT=3001 tsx watch src/server/main-wss-development.ts --tsconfig tsconfig.server.json\"",
      url: "http://localhost:3001",
      reuseExistingServer: false, // Never reuse existing server to avoid conflicts
      timeout: 120 * 1000,
      env: {
        NODE_ENV: "test",
      },
    },
  ],

  globalSetup: "./tests/helpers/global-setup.ts",
  globalTeardown: "./tests/helpers/global-teardown.ts",
});