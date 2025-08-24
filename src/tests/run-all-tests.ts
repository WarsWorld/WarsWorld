#!/usr/bin/env tsx
/**
 * Run all tests in the project
 */

import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const testResults: { name: string; passed: boolean; error?: string }[] = [];

function runTest(name: string, command: string) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`Running: ${name}`);
  console.log(`${"=".repeat(60)}`);

  try {
    execSync(command, { stdio: "inherit" });
    testResults.push({ name, passed: true });
    console.log(`✅ ${name} passed`);
  } catch (error) {
    testResults.push({ name, passed: false, error: error?.toString() });
    console.log(`❌ ${name} failed`);
  }
}

async function runAllTests() {
  console.log("🧪 Running all tests in the project...\n");

  // Unit tests in src/tests
  const unitTests = ["calculate-damage-test.ts", "awbw-move-planner-import.test.ts"];

  for (const test of unitTests) {
    const testPath = path.join(__dirname, test);

    if (fs.existsSync(testPath)) {
      runTest(test, `npx tsx ${testPath}`);
    }
  }

  // AI module tests
  const aiTests = ["../server/ai/state-converter.test.ts", "../server/ai/action-adapter.test.ts"];

  for (const test of aiTests) {
    const testPath = path.join(__dirname, test);

    if (fs.existsSync(testPath)) {
      runTest(path.basename(test), `npx tsx ${testPath}`);
    }
  }

  // E2E tests (Playwright)
  console.log(`\n${"=".repeat(60)}`);
  console.log("Running: E2E Tests (Playwright)");
  console.log(`${"=".repeat(60)}`);

  try {
    execSync("npm run test:e2e", { stdio: "inherit" });
    testResults.push({ name: "E2E Tests", passed: true });
    console.log("✅ E2E Tests passed");
  } catch (error) {
    testResults.push({ name: "E2E Tests", passed: false, error: error?.toString() });
    console.log("❌ E2E Tests failed");
  }

  // Print summary
  console.log(`\n${"=".repeat(60)}`);
  console.log("TEST SUMMARY");
  console.log(`${"=".repeat(60)}`);

  const passed = testResults.filter((r) => r.passed).length;
  const failed = testResults.filter((r) => !r.passed).length;

  testResults.forEach((result) => {
    const icon = result.passed ? "✅" : "❌";
    console.log(`${icon} ${result.name}`);
  });

  console.log(`\nTotal: ${passed} passed, ${failed} failed`);

  if (failed > 0) {
    console.log("\n❌ Some tests failed!");
    process.exit(1);
  } else {
    console.log("\n✅ All tests passed!");
  }
}

runAllTests().catch(console.error);
