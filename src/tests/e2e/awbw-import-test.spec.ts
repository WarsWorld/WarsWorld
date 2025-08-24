import { test, expect } from "@playwright/test";
import { execSync } from "child_process";
import * as path from "path";
import * as fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check environment variables once at the start
if (!process.env.DEV_USER_USERNAME || !process.env.DEV_USER_PASSWORD) {
  throw new Error("DEV_USER_USERNAME and DEV_USER_PASSWORD environment variables must be set");
}

test.describe("AWBW Map Import Test", () => {
  let matchId: string;

  test.beforeAll(async () => {
    // Get fixture paths
    const mapPath = path.join(__dirname, "../fixtures/awbw-map-2player.txt");
    const movePlannerPath = path.join(__dirname, "../fixtures/awbw-move-planner-2player.json");

    // Check fixtures exist
    if (!fs.existsSync(mapPath)) {
      throw new Error(`Map fixture not found: ${mapPath}`);
    }

    if (!fs.existsSync(movePlannerPath)) {
      throw new Error(`Move planner fixture not found: ${movePlannerPath}`);
    }

    console.log("📁 Importing AWBW map using fixtures...");

    // Run the import script and capture output
    const scriptPath = path.join(__dirname, "../../server/tasks/import-and-play-awbw-map.ts");
    const output = execSync(`npx tsx ${scriptPath} ${mapPath} ${movePlannerPath}`, {
      encoding: "utf-8",
    });

    console.log("Import output:", output);

    // Extract match ID from output
    const matchIdMatch = output.match(/Match ID: ([a-z0-9]+)/);

    if (!matchIdMatch) {
      throw new Error("Could not extract match ID from import output");
    }

    matchId = matchIdMatch[1];
    console.log(`✅ Created match with ID: ${matchId}`);
  });

  test("should load imported AWBW map without errors", async ({ page }) => {
    test.setTimeout(30000); // 30 second timeout
    // Step 1: Navigate to the game
    await page.goto("http://localhost:3000/");

    // Step 2: Click login button
    await page.click('button:has-text("LOGIN")');

    // Step 3: Enter dev user credentials
    const username = process.env.DEV_USER_USERNAME!;
    const password = process.env.DEV_USER_PASSWORD!;

    // Wait for login form to be visible
    await page.waitForSelector("#username", { state: "visible" });

    await page.fill("#username", username);
    await page.fill("#password", password);

    // Click the Login button inside the form
    await page.locator('form button:has-text("Login")').click();

    // Wait for navigation after login
    await page.waitForURL("**/");

    // Verify we're logged in
    await page.waitForSelector("text=LOGOUT", { state: "visible" });

    console.log("✅ Successfully logged in");

    // Step 4: Navigate to the match
    console.log(`🎮 Navigating to match: /match2/${matchId}`);

    // Listen for page errors (uncaught exceptions)
    const pageErrors: string[] = [];
    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
      console.error(`Page error: ${error.message}`);
    });

    // Navigate to match page
    await page.goto(`http://localhost:3000/match2/${matchId}`);

    // Wait a reasonable time for any rendering errors to occur
    // The critical error would happen immediately if tile playerSlots were wrong
    await page.waitForTimeout(5000);

    // Check that no critical errors occurred
    const criticalError = pageErrors.find((err) =>
      err.includes("Could not find player while rendering tile with playerSlot"),
    );

    if (criticalError) {
      throw new Error(`Critical rendering error: ${criticalError}`);
    }

    // The fact that we got here without the critical error means the tiles rendered successfully
    console.log("✅ No 'Could not find player while rendering tile' error occurred");

    // Check for missing sprite/texture errors
    const spriteError = pageErrors.find(
      (err) =>
        err.includes("pipeseam") ||
        err.includes("pipeSeam") ||
        err.includes("Cannot read properties of undefined") ||
        err.includes("textures"),
    );

    if (spriteError) {
      console.log("⚠️ Sprite loading error detected:", spriteError);
      throw new Error(`Sprite loading error: ${spriteError}`);
    }

    console.log("✅ No sprite loading errors for pipeSeam tiles");
    console.log("✅ The player slot mapping and sprite rendering fixes are working correctly");

    // Optional: Take a screenshot for debugging
    await page.screenshot({ path: `test-results/awbw-import-${matchId}.png`, fullPage: true });
  });
});
