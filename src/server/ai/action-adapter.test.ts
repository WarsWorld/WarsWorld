/**
 * Test file for PerformActionAdapter with real database
 * Run with: npx tsx src/server/ai/action-adapter.test.ts
 */

import { PrismaClient } from "@prisma/client";
import { fileURLToPath } from "url";
import * as path from "path";
import * as fs from "fs/promises";
import { PerformActionAdapter } from "./action-adapter";
import { performAction } from "../services/perform-action";
import type { Position } from "../../shared/types/position";
import { clearTestDatabase } from "../../tests/helpers/database";
import { matchStore } from "../match-store";
import {
  applyMainEventToMatch,
  applySubEventToMatch,
} from "../../shared/match-logic/events/apply-event-to-match";
import type { MatchWrapper } from "../../shared/wrappers/match";

// ES module fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

// Test configuration
let testsPassed = 0;
let testsFailed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    testsPassed++;
    console.log(`✓ ${message}`);
  } else {
    testsFailed++;
    console.error(`✗ ${message}`);
    console.trace();
  }
}

function assertEqual<T>(actual: T, expected: T, message: string) {
  const condition = JSON.stringify(actual) === JSON.stringify(expected);

  if (!condition) {
    console.error(`  Expected: ${JSON.stringify(expected)}`);
    console.error(`  Actual: ${JSON.stringify(actual)}`);
  }

  assert(condition, message);
}

async function loadTestFixtures() {
  console.log("Loading test fixtures...");

  // Clear existing data first
  await clearTestDatabase();

  const fixturesDir = path.join(__dirname, "../../tests/fixtures");

  // Load users
  const usersData = await fs.readFile(path.join(fixturesDir, "users.json"), "utf-8");
  const users = JSON.parse(usersData);

  for (const user of users) {
    await prisma.user.create({
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        password: user.password,
        state: user.state,
        role: user.role,
        emailVerified: user.emailVerified ? new Date(user.emailVerified) : null,
        image: user.image,
        createdAt: new Date(user.createdAt),
        updatedAt: new Date(user.updatedAt),
      },
    });
  }

  // Load players
  const playersData = await fs.readFile(path.join(fixturesDir, "players.json"), "utf-8");
  const players = JSON.parse(playersData);

  for (const player of players) {
    await prisma.player.create({
      data: {
        id: player.id,
        name: player.name,
        displayName: player.displayName,
        secret: player.secret,
        kind: player.kind,
        preferences: player.preferences,
        achievements: player.achievements || [],
        userId: player.userId,
      },
    });
  }

  // Load maps
  const mapsData = await fs.readFile(path.join(fixturesDir, "maps.json"), "utf-8");
  const maps = JSON.parse(mapsData);

  for (const map of maps) {
    await prisma.wWMap.create({
      data: {
        id: map.id,
        name: map.name,
        tiles: map.tiles,
        predeployedUnits: map.predeployedUnits,
        numberOfPlayers: map.numberOfPlayers,
        createdAt: new Date(map.createdAt),
      },
    });
  }

  // Load matches
  const matchesData = await fs.readFile(path.join(fixturesDir, "matches.json"), "utf-8");
  const matches = JSON.parse(matchesData);

  for (const match of matches) {
    await prisma.match.create({
      data: {
        id: match.id,
        leagueType: match.leagueType,
        mode: match.mode,
        rules: match.rules,
        status: match.status,
        playerState: match.playerState,
        chatIsPublic: match.chatIsPublic,
        createdAt: new Date(match.createdAt),
        mapId: match.mapId,
        Player: {
          connect: match.Player?.map((p: any) => ({ id: p.id })) || [],
        },
      },
    });
  }

  console.log("Fixtures loaded successfully");
}

// Helper to get MatchWrapper from database using the same logic as the server
async function getMatchWrapper(matchId: string): Promise<MatchWrapper | null> {
  // Check if already in store
  const cached = matchStore.get(matchId);

  if (cached) {
    return cached;
  }

  // Load from database using the same logic as the server
  const rawMatch = await prisma.match.findUnique({
    where: { id: matchId },
    include: { map: true, Event: true },
  });

  if (!rawMatch) {
    return null;
  }

  // Use the same createMatchAndIndex logic as the server
  const match = matchStore.createMatchAndIndex(rawMatch, rawMatch.map);

  // Apply events exactly like the server does
  rawMatch.Event.forEach((dbEvent) => {
    applyMainEventToMatch(match, dbEvent.content);

    if (dbEvent.content.type === "move") {
      applySubEventToMatch(match, dbEvent.content);
    }
  });

  return match;
}

async function setupTestMatch(): Promise<string> {
  // Load the Plain only XS map which has predeployed units
  const mapsData = await fs.readFile(
    path.join(__dirname, "../../tests/fixtures/maps.json"),
    "utf-8",
  );
  const maps = JSON.parse(mapsData);
  const testMap = maps.find((m: any) => m.name === "Plain only XS");

  if (!testMap) {
    throw new Error("Test map 'Plain only XS' not found in fixtures");
  }

  // Update the test match to use our test map
  const match = await prisma.match.findFirst({
    where: { status: "playing" },
  });

  if (!match) {
    throw new Error("No test match found in fixtures");
  }

  // Update the match to use our test map
  await prisma.match.update({
    where: { id: match.id },
    data: { mapId: testMap.id },
  });

  // Also update the map in the database
  await prisma.wWMap.upsert({
    where: { id: testMap.id },
    create: {
      id: testMap.id,
      name: testMap.name,
      tiles: testMap.tiles,
      predeployedUnits: testMap.predeployedUnits,
      numberOfPlayers: testMap.numberOfPlayers,
      createdAt: new Date(testMap.createdAt),
    },
    update: {
      tiles: testMap.tiles,
      predeployedUnits: testMap.predeployedUnits,
    },
  });

  return match.id;
}

console.log("===== PerformActionAdapter Tests (Real Database) =====\n");

async function runTests() {
  try {
    // Set up test database and fixtures
    await loadTestFixtures();
    const matchId = await setupTestMatch();

    // Get the match wrapper
    const match = await getMatchWrapper(matchId);
    assert(match !== null, "Should retrieve match from database");

    if (!match) {
      throw new Error("Failed to get match wrapper");
    }

    // Create adapter with real match
    const adapter = new PerformActionAdapter(match);

    // Test 1: Move Unit
    console.log("--- Test 1: Move Unit (Real Data) ---");

    // Find the player 0 infantry from predeployed units at [1, 1]
    const infantry = match.units.find(
      (u) =>
        u.data.type === "infantry" &&
        u.data.position[0] === 1 &&
        u.data.position[1] === 1 &&
        u.data.playerSlot === 0,
    );

    assert(infantry !== undefined, "Should find player 0 infantry at [1,1]");

    if (infantry) {
      const unitId = `${infantry.data.position[0]},${infantry.data.position[1]}`;
      const path: Position[] = [
        [1, 1],
        [1, 2],
        [1, 3],
      ]; // Move toward enemy

      try {
        await adapter.moveUnit(unitId, path);

        // Verify the event was created - check all recent events
        const allEvents = await prisma.event.findMany({
          where: { matchId },
          orderBy: { index: "desc" },
          take: 5,
        });

        console.log(
          "  Recent events:",
          allEvents.map((e) => e.content.type),
        );

        // Find move event with matching path
        const moveEvent = allEvents.find(
          (e) =>
            e.content.type === "move" && JSON.stringify(e.content.path) === JSON.stringify(path),
        );

        assert(moveEvent !== undefined, "Move event should be created in database");
      } catch (error) {
        console.error("Move unit failed:", error);
        testsFailed++;
      }
    }

    // Test 2: Ranged Attack With Artillery
    console.log("\n--- Test 2: Ranged Attack With Artillery ---");

    // Refresh match after move
    const match2 = await getMatchWrapper(matchId);

    if (!match2) {
      throw new Error("Failed to refresh match");
    }

    // Find the player 0 artillery at [2, 1]
    const artillery = match2.units.find(
      (u) =>
        u.data.type === "artillery" &&
        u.data.position[0] === 2 &&
        u.data.position[1] === 1 &&
        u.data.playerSlot === 0,
    );

    // Find the enemy artillery at [2, 4] (within artillery range - 3 tiles)
    const enemyArtillery = match2.units.find(
      (u) =>
        u.data.type === "artillery" &&
        u.data.position[0] === 2 &&
        u.data.position[1] === 4 &&
        u.data.playerSlot === 1,
    );

    assert(artillery !== undefined, "Should find player 0 artillery at [2,1]");
    assert(enemyArtillery !== undefined, "Should find enemy artillery at [2,4]");

    if (artillery && enemyArtillery) {
      const artilleryId = `${artillery.data.position[0]},${artillery.data.position[1]}`;

      const adapter2 = new PerformActionAdapter(match2);

      try {
        // For indirect units, path should just be the current position
        const attackPath: Position[] = [[2, 1]];
        await adapter2.attackWithUnit(artilleryId, attackPath, enemyArtillery.data.position);

        // Verify the attack event was created
        const allEvents = await prisma.event.findMany({
          where: { matchId },
          orderBy: { index: "desc" },
          take: 5,
        });

        // Find attack event - it's stored as "move" with attack subEvent
        const attackEvent = allEvents.find(
          (e) => e.content.type === "move" && e.content.subEvent?.type === "attack",
        );

        assert(attackEvent !== undefined, "Artillery attack event should be created in database");
      } catch (error) {
        console.error("Artillery attack failed:", error);
        testsFailed++;
      }
    }

    // Test 3: Load Unit into Transport
    console.log("\n--- Test 3: Load Unit into APC ---");

    // Refresh match
    const match3 = await getMatchWrapper(matchId);

    if (!match3) {
      throw new Error("Failed to refresh match");
    }

    // First move APC one tile up
    const apc = match3.units.find(
      (u) =>
        u.data.type === "apc" &&
        u.data.position[0] === 3 &&
        u.data.position[1] === 1 &&
        u.data.playerSlot === 0,
    );

    assert(apc !== undefined, "Should find APC at [3,1]");

    if (apc) {
      const apcId = `${apc.data.position[0]},${apc.data.position[1]}`;
      const apcPath: Position[] = [
        [3, 1],
        [3, 2],
      ]; // Move APC one tile up

      const adapter3 = new PerformActionAdapter(match3);

      try {
        // Move APC one tile up and wait
        await adapter3.moveUnit(apcId, apcPath);

        // Verify APC move event was created
        const apcMoveEvents = await prisma.event.findMany({
          where: { matchId },
          orderBy: { index: "desc" },
          take: 5,
        });

        const apcMoveEvent = apcMoveEvents.find(
          (e) =>
            e.content.type === "move" && JSON.stringify(e.content.path) === JSON.stringify(apcPath),
        );

        assert(apcMoveEvent !== undefined, "APC move event should be created in database");

        // Now refresh match and move infantry 2 to load into APC
        const match3b = await getMatchWrapper(matchId);

        if (!match3b) {
          throw new Error("Failed to refresh match after APC move");
        }

        // Find the second infantry at [4, 1]
        const infantry2 = match3b.units.find(
          (u) =>
            u.data.type === "infantry" &&
            u.data.position[0] === 4 &&
            u.data.position[1] === 1 &&
            u.data.playerSlot === 0,
        );

        assert(infantry2 !== undefined, "Should find infantry 2 at [4,1]");

        if (infantry2) {
          // Use loadUnit to load infantry into APC
          const infantryId = `${infantry2.data.position[0]},${infantry2.data.position[1]}`;
          // Path for infantry to move from [4,1] to APC at [3,2]
          const loadPath: Position[] = [
            [4, 1],
            [3, 2],
          ];

          const adapter3b = new PerformActionAdapter(match3b);

          await adapter3b.loadUnit(infantryId, loadPath);

          // Verify the load event was created
          const allEvents = await prisma.event.findMany({
            where: { matchId },
            orderBy: { index: "desc" },
            take: 5,
          });

          // Find the load event - infantry moves from [4,1] to APC at [3,2]
          const loadEvent = allEvents.find(
            (e) =>
              e.content.type === "move" &&
              e.content.path?.length === 2 &&
              JSON.stringify(e.content.path[0]) === JSON.stringify([4, 1]) &&
              JSON.stringify(e.content.path[1]) === JSON.stringify([3, 2]),
          );

          assert(loadEvent !== undefined, "Infantry load event should be created in database");
        }
      } catch (error) {
        console.error("Load unit failed:", error);
        testsFailed++;
      }
    }

    // Test 4: End Turn
    console.log("\n--- Test 4: End Turn (Real Data) ---");

    try {
      const finalMatch = await getMatchWrapper(matchId);

      if (!finalMatch) {
        throw new Error("Failed to get final match");
      }

      const adapter4 = new PerformActionAdapter(finalMatch);

      await adapter4.endTurn();

      // Verify the end turn event was created
      const allEvents = await prisma.event.findMany({
        where: { matchId },
        orderBy: { index: "desc" },
        take: 5,
      });

      console.log(
        "  Events after end turn:",
        allEvents.map((e) => e.content.type),
      );

      // Find endTurn event (passTurn action creates endTurn event)
      const endTurnEvent = allEvents.find(
        (e) => e.content.type === "endTurn" || e.content.type === "passTurn",
      );

      assert(endTurnEvent !== undefined, "End turn event should be created in database");
    } catch (error) {
      console.error("End turn failed:", error);
      testsFailed++;
    }

    // Test 5: Unit ID validation
    console.log("\n--- Test 5: Unit ID Validation (Real Data) ---");

    try {
      await adapter.moveUnit("invalid-id", [
        [0, 0],
        [1, 1],
      ]);
      assert(false, "Should throw error for invalid unit ID");
    } catch (error: any) {
      assert(error.message.includes("Invalid unit ID format"), "Should validate unit ID format");
    }

    try {
      await adapter.moveUnit("999,999", [
        [0, 0],
        [1, 1],
      ]);
      assert(false, "Should throw error for non-existent unit");
    } catch (error: any) {
      assert(error.message.includes("Unit not found"), "Should validate unit exists");
    }
  } catch (error) {
    console.error("Test setup failed:", error);
    testsFailed++;
  } finally {
    // Clean up
    await prisma.$disconnect();
  }
}

// Run tests
runTests()
  .then(() => {
    // Print summary
    console.log("\n===== Test Summary =====");
    console.log(`Tests passed: ${testsPassed}`);
    console.log(`Tests failed: ${testsFailed}`);

    if (testsFailed === 0) {
      console.log("\n✅ All tests passed!");
      process.exit(0);
    } else {
      console.log("\n❌ Some tests failed!");
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
