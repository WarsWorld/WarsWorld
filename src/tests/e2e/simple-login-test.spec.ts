import { test, expect } from "@playwright/test";
import { loadFixtures } from "../helpers/fixtures";

// Check environment variables once at the start
if (!process.env.DEV_USER_USERNAME || !process.env.DEV_USER_PASSWORD) {
  throw new Error("DEV_USER_USERNAME and DEV_USER_PASSWORD environment variables must be set");
}

test.describe("Simple Login Test", () => {
  test.beforeAll(async () => {
    // Load fixtures before all tests
    await loadFixtures();
  });
  
  test("should login with development user", async ({ page }) => {
    // Step 1: Navigate to the game
    await page.goto("http://localhost:3000/");
    
    // Step 2: Click login button
    await page.click('button:has-text("LOGIN")');
    
    // Step 3: Enter dev user credentials
    const username = process.env.DEV_USER_USERNAME!;
    const password = process.env.DEV_USER_PASSWORD!;
    
    // Wait for login form to be visible
    await page.waitForSelector('#username', { state: 'visible' });
    
    await page.fill('#username', username);
    await page.fill('#password', password);
    
    // Click the Login button inside the form
    await page.locator('form button:has-text("Login")').click();
    
    // Wait for navigation after login
    await page.waitForURL("**/");
    
    // Verify we're logged in by checking for LOGOUT button
    await page.waitForSelector('text=LOGOUT', { state: 'visible' });
    
    console.log("✅ Successfully logged in with development user");
  });
});