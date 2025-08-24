# Tests

All tests are now consolidated in the `src/tests` directory.

## Structure

```
src/tests/
├── e2e/                    # End-to-end Playwright tests
│   ├── ai-gameplay.spec.ts
│   ├── awbw-import-test.spec.ts
│   ├── match-creation.spec.ts
│   └── simple-login-test.spec.ts
├── fixtures/               # Static test data
│   ├── *.json             # Database fixtures
│   └── awbw-*.txt/json    # AWBW import test data
├── helpers/                # Test utilities
│   ├── auth.ts
│   ├── fixtures.ts
│   ├── global-setup.ts
│   └── global-teardown.ts
├── calculate-damage-test.ts    # Unit test for damage calculation
├── awbw-move-planner-import.test.ts  # Unit test for AWBW import
├── run-all-tests.ts        # Run all tests (unit + e2e)
└── run-unit-tests.ts       # Run only unit tests
```

## AI Module Tests

The AI module tests are located in:

```
src/server/ai/
├── state-converter.test.ts  # Tests for StateConverter
└── action-adapter.test.ts   # Tests for PerformActionAdapter
```

## Running Tests

### Run all tests (unit + e2e)

```bash
npm test
# or
npm run test:all
```

### Run only unit tests

```bash
npm run test:unit
```

### Run only e2e tests

```bash
npm run test:e2e
```

### Run specific test file

```bash
npx tsx src/tests/calculate-damage-test.ts
npx tsx src/server/ai/state-converter.test.ts
```

### Run e2e tests with UI

```bash
npm run test:e2e:ui
```

## Test Results

✅ **Unit Tests (All Passing)**

- calculate-damage-test.ts
- awbw-move-planner-import.test.ts
- state-converter.test.ts
- action-adapter.test.ts

⚠️ **E2E Tests (Partial)**

- Some E2E tests may fail due to UI timing issues
- Core functionality is verified through unit tests

## Notes

- All test paths have been updated after moving from `/tests` to `/src/tests`
- The Playwright configuration (`playwright.config.ts`) has been updated to reflect the new paths
- Package.json scripts have been updated for the new structure
