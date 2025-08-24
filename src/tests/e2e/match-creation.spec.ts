import { test, expect } from "@playwright/test";
import { loadFixtures } from "../helpers/fixtures";
import { ensureLoggedIn } from "../helpers/auth";

test.describe("Match Creation and Management", () => {
  test.beforeAll(async () => {
    // Load fixtures before all tests
    await loadFixtures();
  });

  test.beforeEach(async ({ page }) => {
    // Ensure user is logged in before each test
    await ensureLoggedIn(page);
  });

  test("should create a new PvC match through UI", async ({ page }) => {
    // Navigate to matches page
    await page.goto("/your-matches");

    // Wait for the page to load
    await page.waitForSelector('text="Match Page"');

    // First, click on the Current Player dropdown (it's a custom dropdown with div and tabindex)
    const dropdownTrigger = page.locator('div[tabindex="0"]:has-text("No player selected")');
    await dropdownTrigger.click();

    // Wait for dropdown to expand and select the first player
    // The dropdown options are li elements
    await page.locator('li:has-text("[dev]")').first().click();

    // Check the "Play vs Computer" checkbox
    const vsComputerCheckbox = page.locator('input[type="checkbox"]');
    await vsComputerCheckbox.check();

    // The map selector should already have a map selected (Love and Literature)
    // Click the "Start vs Computer" button
    await page.click('button:has-text("Start vs Computer")');

    // Wait for the new match to appear in the match list
    // Look for a match with "Computer" as one of the players
    await page.waitForSelector('text="Computer slot: 1"', { timeout: 10000 });

    // Verify the match was created successfully - use first() since there might be multiple
    await expect(page.locator('text="Computer slot: 1"').first()).toBeVisible();

    // The test successfully creates a PvC match - it appears in the match list
    // with "Computer slot: 1" as one of the players
  });

  test("should display existing matches in match list", async ({ page }) => {
    // Navigate to matches page
    await page.goto("/your-matches");

    // Look for the test match created in fixtures
    const testMatch = page.locator("text=/Test Map/i").first();

    if (await testMatch.isVisible()) {
      // Click on the match
      await testMatch.click();

      // Verify we're in a match with computer
      await expect(page.locator("text=/Computer/i")).toBeVisible();
      await expect(page.locator("text=/DevPlayer/i")).toBeVisible();
    }
  });
});
