# Test Fixtures

This directory contains static test fixtures exported from the development database.
These JSON files provide consistent test data that won't change even as the development database evolves.

## Files

- `users.json` - Test user accounts (e.g., development_user)
- `players.json` - Player profiles linked to test users
- `maps.json` - Game maps (preferably small 2-player maps for faster tests)
- `matches.json` - Sample matches including PvC matches for AI testing
- `export-summary.json` - Metadata about when fixtures were exported

## Usage

These fixtures are automatically loaded by Playwright tests via `loadFixtures()` in the test helpers.

## Updating Fixtures

To update fixtures with new data from the development database:

```bash
# 1. Ensure your dev database has the necessary test data
#    - development_user account
#    - A PvC match with that user
#    - A small 2-player map

# 2. Export new fixtures
npm run test:fixtures:export

# 3. Commit the updated JSON files
git add src/tests/fixtures/*.json
git commit -m "Update test fixtures"
```

**Important:** Only update fixtures when adding new test scenarios. The whole point of static fixtures is to keep tests consistent and reproducible.
