import { Page } from "@playwright/test";

export async function loginAsDevUser(page: Page) {
  // Navigate to home page (uses baseURL from config)
  await page.goto("/");
  
  // Click login button in navbar
  await page.click('button:has-text("LOGIN")');
  
  // Wait for login form to be visible
  await page.waitForSelector('#username', { state: 'visible' });
  
  // Fill in credentials
  const username = process.env.DEV_USER_USERNAME || "development_user";
  const password = process.env.DEV_USER_PASSWORD || "secret";
  
  await page.fill('#username', username);
  await page.fill('#password', password);
  
  // Click the Login button inside the form (not the navbar LOGIN button)
  await page.locator('form button:has-text("Login")').click();
  
  // Wait for navigation after login
  await page.waitForURL("**/");
  
  // Wait for LOGOUT button to confirm we're logged in
  await page.waitForSelector('text=LOGOUT', { state: 'visible' });
}

export async function ensureLoggedIn(page: Page) {
  // Check if already logged in by looking for LOGOUT button
  const isLoggedIn = await page.locator('text=LOGOUT').isVisible().catch(() => false);
  
  if (!isLoggedIn) {
    await loginAsDevUser(page);
  }
}