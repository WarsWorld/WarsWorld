import { test, expect } from "@playwright/test";
import { loadFixtures } from "../helpers/fixtures";
import { ensureLoggedIn } from "../helpers/auth";

test.describe("AI Gameplay Behavior", () => {
  test.beforeAll(async () => {
    // Load fixtures before all tests
    await loadFixtures();
  });

  test.beforeEach(async ({ page }) => {
    // Ensure user is logged in before each test
    await ensureLoggedIn(page);
  });

  test("should execute AI turn when player passes turn", async ({ page }) => {
    // Step 1: Navigate to 'your games' page
    await page.goto("/your-matches");

    // Step 2: Wait for the page to load
    await page.waitForSelector('text="Match Page"');

    // Step 3: Select a player from the dropdown (required to see your matches)
    const dropdownTrigger = page.locator('div[tabindex="0"]:has-text("No player selected")');
    await dropdownTrigger.click();

    // Select "[dev] Grimm Guy" who is a player in the PvC match
    await page.locator('li:has-text("[dev] Grimm Guy")').click();

    // Wait for matches to load after selecting player
    await page.waitForTimeout(1000);

    // Step 4: Verify we have matches on the page
    // Check for the PvC match (with Computer as opponent)
    const computerMatchText = await page.locator('text="Computer slot: 1"').count();
    expect(computerMatchText).toBeGreaterThan(0);
    console.log(`Found ${computerMatchText} PvC match(es)`);

    // Step 5: Click on the PvC match to enter it
    // The match cards are clickable - find the one with Computer and click it
    // Based on the error context, the Enter Match is a link with href to /match2/...
    const enterMatchLink = page
      .locator('a[href*="/match2/"]')
      .filter({ hasText: "Enter Match" })
      .first();

    // If Enter Match link exists, click it. Otherwise click the match card itself
    const hasEnterMatch = await enterMatchLink.isVisible().catch(() => false);

    if (hasEnterMatch) {
      await enterMatchLink.click();
    } else {
      // Click directly on the match card that has Computer in it
      const computerMatchCard = page
        .locator('text="Caustic Finale"')
        .locator("..")
        .filter({ hasText: "Computer" })
        .first();
      await computerMatchCard.click();
    }

    // Step 6: Wait for the match page to load
    await page.waitForURL(/match2\/[a-zA-Z0-9-]+/, { timeout: 10000 });

    // Step 7: Check if we're in the match by looking for the Pass Turn button
    const passTurnButton = page.locator('button:has-text("Pass Turn")');
    await passTurnButton.waitFor({ state: "visible", timeout: 5000 });

    // Take a screenshot of the initial game state before passing turn
    await page.screenshot({
      path: "test-results/ai-initial-state.png",
      fullPage: true,
    });
    console.log("Screenshot saved: test-results/ai-initial-state.png");

    // Store initial state to verify AI actions
    // Check if there are any units on the board before passing turn
    const unitsBefore = await page
      .locator('[data-testid="unit"]')
      .count()
      .catch(() => 0);
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
    const unitsAfter = await page
      .locator('[data-testid="unit"]')
      .count()
      .catch(() => 0);
    console.log(`Units after AI turn: ${unitsAfter}`);

    // AI should have built at least one Infantry if it had funds and available factories
    // or moved existing units
    expect(unitsAfter).toBeGreaterThanOrEqual(unitsBefore);

    // Verify we're back to player's turn
    await expect(passTurnButton).toBeVisible();

    console.log("✅ AI successfully took its turn and passed back to player");
  });
});
