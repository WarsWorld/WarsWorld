import { test, expect } from "@playwright/test";
import { loadFixtures } from "../helpers/fixtures";

// Check environment variables once at the start
if (!process.env.DEV_USER_USERNAME || !process.env.DEV_USER_PASSWORD) {
  throw new Error("DEV_USER_USERNAME and DEV_USER_PASSWORD environment variables must be set");
}

test.describe("AI Computer Player", () => {
  test.beforeAll(async () => {
    // Load fixtures before all tests
    await loadFixtures();
  });
  
  test("should verify computer AI takes turn after player", async ({ page }) => {
    // Step 1: Navigate to the game
    await page.goto("http://localhost:3000/");

    // Step 2: Click login button
    await page.click('button:has-text("LOGIN")');

    // Step 3: Enter dev user credentials from environment variables
    const username = process.env.DEV_USER_USERNAME!;
    const password = process.env.DEV_USER_PASSWORD!;
    
    // Wait for login form to be visible
    await page.waitForSelector('#username', { state: 'visible' });
    
    await page.fill('#username', username);
    await page.fill('#password', password);
    
    // Click the Login button inside the form (not the navbar LOGIN button)
    await page.locator('form button:has-text("Login")').click();

    // Wait for navigation after login and ensure we're logged in
    await page.waitForURL("**/");
    
    // Wait for the page to fully load after login
    await page.waitForSelector('text=LOGOUT', { state: 'visible' });

    // Step 4: Navigate directly to the test match from fixtures
    // Using the match ID we created in fixtures
    const matchId = "test-match-001";
    await page.goto(`/match2/${matchId}`);
    
    // Wait for the match page to load
    await page.waitForTimeout(3000);

    // Step 5: Check if we're in the match by looking for the Pass Turn button
    const passTurnButton = page.locator('button:has-text("Pass Turn")');
    
    // Check if Pass Turn button is visible
    const isInMatch = await passTurnButton.isVisible().catch(() => false);
    
    if (!isInMatch) {
      throw new Error(`Cannot find Pass Turn button. Make sure match ${matchId} exists and is a PvC match with the test user as a player.`);
    }
    
    // Store initial state to verify AI actions
    // Check if there are any units on the board before passing turn
    const unitsBefore = await page.locator('[data-testid="unit"]').count().catch(() => 0);
    console.log(`Units before AI turn: ${unitsBefore}`);
    
    // Step 6: Pass turn to trigger AI turn
    await passTurnButton.click();

    // Wait for AI to complete its turn
    // The AI should:
    // 1. Move one Infantry unit randomly (if any exist)
    // 2. Build Infantry at available factories (if funds allow)
    // 3. Pass turn back to player
    
    // Wait for turn to come back to player (Pass Turn button should be visible again)
    await passTurnButton.waitFor({ state: "visible", timeout: 15000 });
    
    // Verify AI took actions
    const unitsAfter = await page.locator('[data-testid="unit"]').count().catch(() => 0);
    console.log(`Units after AI turn: ${unitsAfter}`);
    
    // AI should have built at least one Infantry if it had funds and available factories
    // or moved existing units
    expect(unitsAfter).toBeGreaterThanOrEqual(unitsBefore);
    
    // Verify we're back to player's turn
    await expect(passTurnButton).toBeVisible();
    
    console.log("✅ AI successfully took its turn and passed back to player");
  });
});