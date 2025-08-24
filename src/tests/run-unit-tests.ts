#!/usr/bin/env tsx
/**
 * Run only unit tests (excluding E2E tests)
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

async function runUnitTests() {
  console.log("🧪 Running unit tests...\n");

  // Unit tests in src/tests
  const unitTests = [
    "calculate-damage-test.ts",
    "awbw-move-planner-import.test.ts",
  ];

  for (const test of unitTests) {
    const testPath = path.join(__dirname, test);
    if (fs.existsSync(testPath)) {
      runTest(test, `npx tsx ${testPath}`);
    }
  }

  // AI module tests
  const aiTests = [
    "../server/ai/state-converter.test.ts",
    "../server/ai/action-adapter.test.ts",
  ];

  for (const test of aiTests) {
    const testPath = path.join(__dirname, test);
    if (fs.existsSync(testPath)) {
      runTest(path.basename(test), `npx tsx ${testPath}`);
    }
  }

  // Print summary
  console.log(`\n${"=".repeat(60)}`);
  console.log("UNIT TEST SUMMARY");
  console.log(`${"=".repeat(60)}`);
  
  const passed = testResults.filter(r => r.passed).length;
  const failed = testResults.filter(r => !r.passed).length;
  
  testResults.forEach(result => {
    const icon = result.passed ? "✅" : "❌";
    console.log(`${icon} ${result.name}`);
  });
  
  console.log(`\nTotal: ${passed} passed, ${failed} failed`);
  
  if (failed > 0) {
    console.log("\n❌ Some tests failed!");
    process.exit(1);
  } else {
    console.log("\n✅ All unit tests passed!");
  }
}

runUnitTests().catch(console.error);