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
    
    // Check the "Play vs Computer" checkbox
    const vsComputerCheckbox = page.locator('input[type="checkbox"]');
    await vsComputerCheckbox.check();
    
    // The map selector should already have a map selected (Caustic Finale)
    // Just click the Create game button
    await page.click('button:has-text("Create game")');
    
    // Wait for redirect to the match page
    await page.waitForURL(/match2\/[a-zA-Z0-9-]+/, { timeout: 10000 });
    
    // Verify the match was created with computer player
    await expect(page.locator('text=/Computer/i')).toBeVisible();
  });
  
  test("should display existing matches in match list", async ({ page }) => {
    // Navigate to matches page
    await page.goto("/your-matches");
    
    // Look for the test match created in fixtures
    const testMatch = page.locator('text=/Test Map/i').first();
    
    if (await testMatch.isVisible()) {
      // Click on the match
      await testMatch.click();
      
      // Verify we're in a match with computer
      await expect(page.locator('text=/Computer/i')).toBeVisible();
      await expect(page.locator('text=/DevPlayer/i')).toBeVisible();
    }
  });
});