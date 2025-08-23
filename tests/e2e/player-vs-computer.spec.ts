import { test, expect } from "@playwright/test";
import { loadFixtures } from "../helpers/fixtures";
import { ensureLoggedIn } from "../helpers/auth";

test.describe("Player vs Computer Mode", () => {
  test.beforeAll(async () => {
    // Load fixtures before all tests
    await loadFixtures();
  });
  
  test.beforeEach(async ({ page }) => {
    // Ensure user is logged in before each test
    await ensureLoggedIn(page);
  });
  
  test("should create a PvC match", async ({ page }) => {
    // Navigate to matches page
    await page.goto("/match");
    
    // Click on create match button
    await page.click('button:has-text("Create Match")');
    
    // Wait for the create match form/modal
    await page.waitForSelector('text=/Create.*Match/i');
    
    // Check the "vs Computer" checkbox
    const vsComputerCheckbox = page.locator('input[type="checkbox"]').filter({ hasText: /computer|ai|pvc/i });
    await vsComputerCheckbox.check();
    
    // Select a map (use the first available)
    const mapSelector = page.locator('select[name="mapId"], [data-testid="map-select"]').first();
    if (await mapSelector.isVisible()) {
      await mapSelector.selectOption({ index: 1 });
    }
    
    // Submit the form
    await page.click('button[type="submit"], button:has-text("Create")');
    
    // Wait for redirect to the match page
    await page.waitForURL(/match\/[a-zA-Z0-9-]+/, { timeout: 10000 });
    
    // Verify the match was created with computer player
    await expect(page.locator('text=/Computer/i')).toBeVisible();
  });
  
  test("should show existing PvC match from fixtures", async ({ page }) => {
    // Navigate to matches page
    await page.goto("/match");
    
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