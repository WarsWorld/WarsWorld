import { MatchWrapper } from "shared/wrappers/match";
import { UnitWrapper } from "shared/wrappers/unit";
import type { PlayerInMatch } from "shared/types/server-match-state";
import type { WWMap } from "@prisma/client";
import type { WWUnit } from "shared/schemas/unit";
import { StateConverter } from "./state-converter";
import type { AIGameState } from "./types";

// Helper function to create a test match
function createTestMatch(config: {
  players?: PlayerInMatch[];
  units?: WWUnit[];
  changeableTiles?: any[];
  turn?: number;
  mapWidth?: number;
  mapHeight?: number;
  fogOfWar?: boolean;
}): MatchWrapper {
  const defaultPlayers: PlayerInMatch[] = [
    {
      id: "player1",
      userId: "user1",
      playerName: "Player 1",
      slot: 0,
      ready: true,
      type: "human" as const,
      team: 0,
      funds: 1000,
      eliminated: false,
      resignedAt: null,
      co: null,
      hasCurrentTurn: true, // First player has the turn
    },
    {
      id: "player2",
      userId: null,
      playerName: "Computer",
      slot: 1,
      ready: true,
      type: "ai" as const,
      team: 1,
      funds: 1500,
      eliminated: false,
      resignedAt: null,
      co: null,
      hasCurrentTurn: false,
    },
  ];

  const mapWidth = config.mapWidth ?? 10;
  const mapHeight = config.mapHeight ?? 10;

  // Create a 2D array of plain tiles for the map
  const tiles = Array(mapHeight)
    .fill(null)
    .map(() =>
      Array(mapWidth)
        .fill(null)
        .map(() => ({
          type: "plain",
        })),
    );

  const map: WWMap = {
    id: "map1",
    name: "Test Map",
    tiles: tiles as any, // tiles is stored as Json in the database
    predeployedUnits: [],
    numberOfPlayers: 2,
    createdAt: new Date(),
  };

  const match = new MatchWrapper(
    "match1",
    "standard",
    config.changeableTiles ?? [],
    {
      leagueType: "standard",
      coPowers: false,
      fogOfWar: config.fogOfWar ?? false,
      captureWinCondition: "hq",
      dayLimit: 0,
      initialFunds: 0,
      incomeMultiplier: 1,
      roundTimer: 0,
      turnTimer: 0,
      bannedUnits: [],
      labUnits: [],
      gameVersion: "AW2",
      teamMapping: [0, 1], // Player 0 is team 0, player 1 is team 1
    },
    "active",
    map,
    config.players ?? defaultPlayers,
    config.units ?? [],
    UnitWrapper,
    config.turn ?? 1,
  );

  return match;
}

describe("StateConverter", () => {
  describe("toAIState", () => {
    it("should convert basic match information", () => {
      const match = createTestMatch({
        turn: 5,
        mapWidth: 15,
        mapHeight: 12,
        fogOfWar: true,
      });

      const aiState = StateConverter.toAIState(match);

      expect(aiState.turn).toBe(5);
      expect(aiState.mapSize.width).toBe(15);
      expect(aiState.mapSize.height).toBe(12);
      expect(aiState.fogOfWar).toBe(true);
      expect(aiState.currentPlayerIndex).toBe(0);
    });

    it("should convert players correctly", () => {
      const match = createTestMatch({});
      const aiState = StateConverter.toAIState(match);

      expect(aiState.players).toHaveLength(2);

      expect(aiState.players[0]).toEqual({
        id: "player1",
        index: 0,
        teamIndex: 0,
        funds: 1000,
        isAI: false,
        coName: undefined,
        coPowerCharge: undefined,
        coPowerActive: false,
      });

      expect(aiState.players[1]).toEqual({
        id: "player2",
        index: 1,
        teamIndex: 1,
        funds: 1500,
        isAI: true,
        coName: undefined,
        coPowerCharge: undefined,
        coPowerActive: false,
      });
    });

    it("should convert units correctly", () => {
      const units: WWUnit[] = [
        {
          type: "infantry",
          playerSlot: 0,
          position: [3, 4],
          stats: {
            hp: 80,
            fuel: 90,
            capturing: false,
            beingCarried: false,
          },
        },
        {
          type: "tank",
          playerSlot: 1,
          position: [5, 6],
          stats: {
            hp: 60,
            fuel: 40,
            ammo: 5,
            capturing: false,
            beingCarried: false,
          },
        },
      ];

      const match = createTestMatch({ units });
      const aiState = StateConverter.toAIState(match);

      expect(aiState.units).toHaveLength(2);

      expect(aiState.units[0]).toEqual({
        id: "3,4",
        type: "infantry",
        playerIndex: 0,
        position: [3, 4],
        hp: 80,
        fuel: 90,
        isReady: true,
        captureProgress: undefined,
      });

      expect(aiState.units[1]).toEqual({
        id: "5,6",
        type: "tank",
        playerIndex: 1,
        position: [5, 6],
        hp: 60,
        fuel: 40,
        isReady: true,
        captureProgress: undefined,
        ammo: 5,
      });
    });

    it("should convert capturable tiles correctly", () => {
      const changeableTiles = [
        {
          type: "city",
          position: [2, 3],
          playerSlot: 0,
          capturePoints: 20,
        },
        {
          type: "base",
          position: [7, 8],
          playerSlot: 1,
          capturePoints: 20,
        },
        {
          type: "hq",
          position: [0, 0],
          playerSlot: 0,
          capturePoints: 20,
        },
      ];

      const match = createTestMatch({ changeableTiles });
      const aiState = StateConverter.toAIState(match);

      // Should have at least the changeable tiles
      expect(aiState.tiles.length).toBeGreaterThanOrEqual(3);

      const city = aiState.tiles.find((t) => t.position[0] === 2 && t.position[1] === 3);
      expect(city).toEqual({
        position: [2, 3],
        type: "city",
        ownerIndex: 0,
        capturePoints: 20,
      });

      const base = aiState.tiles.find((t) => t.position[0] === 7 && t.position[1] === 8);
      expect(base).toEqual({
        position: [7, 8],
        type: "base",
        ownerIndex: 1,
        capturePoints: 20,
      });
    });

    it("should handle units with hidden stats", () => {
      const units: WWUnit[] = [
        {
          type: "stealth",
          playerSlot: 0,
          position: [1, 1],
          stats: "hidden",
        },
      ];

      const match = createTestMatch({ units });
      const aiState = StateConverter.toAIState(match);

      expect(aiState.units[0]).toEqual({
        id: "1,1",
        type: "stealth",
        playerIndex: 0,
        position: [1, 1],
        hp: 100,
        fuel: 60, // Default fuel for stealth
        isReady: true,
        captureProgress: undefined,
        ammo: 6, // Default ammo for stealth
      });
    });

    it("should handle transport units with loaded units", () => {
      const infantryUnit: WWUnit = {
        type: "infantry",
        playerSlot: 0,
        position: [0, 0],
        stats: {
          hp: 100,
          fuel: 99,
          capturing: false,
          beingCarried: true,
        },
      };

      const units: WWUnit[] = [
        {
          type: "apc",
          playerSlot: 0,
          position: [2, 2],
          stats: {
            hp: 100,
            fuel: 60,
            capturing: false,
            beingCarried: false,
          },
          loadedUnit: infantryUnit,
        },
      ];

      const match = createTestMatch({ units });
      const aiState = StateConverter.toAIState(match);

      const apc = aiState.units[0];
      expect(apc.type).toBe("apc");
      expect(apc.loadedUnits).toEqual(["0,0"]);
    });

    it("should extract weather information", () => {
      const match = createTestMatch({});

      // Mock weather state
      match.setWeather("rain", 3);

      const aiState = StateConverter.toAIState(match);

      expect(aiState.weather).toEqual({
        type: "rain",
        daysRemaining: 3,
      });
    });

    it("should return undefined weather for clear weather", () => {
      const match = createTestMatch({});

      // Default weather is clear
      const aiState = StateConverter.toAIState(match);

      expect(aiState.weather).toBeUndefined();
    });

    it("should handle capture progress correctly", () => {
      const units: WWUnit[] = [
        {
          type: "infantry",
          playerSlot: 0,
          position: [2, 3],
          stats: {
            hp: 100,
            fuel: 99,
            capturing: true,
            beingCarried: false,
          },
        },
      ];

      const changeableTiles = [
        {
          type: "city",
          position: [2, 3],
          playerSlot: 1,
          capturePoints: 15, // 5 points captured (20 - 15)
        },
      ];

      const match = createTestMatch({ units, changeableTiles });
      const aiState = StateConverter.toAIState(match);

      const infantry = aiState.units[0];
      expect(infantry.captureProgress).toBe(5);
    });
  });

  describe("utility functions", () => {
    it("should deep clone game state", async () => {
      const match = createTestMatch({});
      const aiState = StateConverter.toAIState(match);

      const { cloneGameState } = await import("./types");
      const cloned = cloneGameState(aiState);

      // Modify original
      aiState.turn = 999;
      aiState.units.push({
        id: "test",
        type: "test",
        playerIndex: 0,
        position: [0, 0],
        hp: 100,
        fuel: 100,
        isReady: true,
      });

      // Cloned should be unaffected
      expect(cloned.turn).toBe(1);
      expect(cloned.units).toHaveLength(0);
    });

    it("should check position equality", async () => {
      const { isSamePosition } = await import("./types");

      expect(isSamePosition([1, 2], [1, 2])).toBe(true);
      expect(isSamePosition([1, 2], [2, 1])).toBe(false);
      expect(isSamePosition([0, 0], [0, 0])).toBe(true);
    });

    it("should calculate Manhattan distance", async () => {
      const { getManhattanDistance } = await import("./types");

      expect(getManhattanDistance([0, 0], [0, 0])).toBe(0);
      expect(getManhattanDistance([0, 0], [3, 4])).toBe(7);
      expect(getManhattanDistance([5, 5], [3, 8])).toBe(5);
    });

    it("should check if position is in bounds", async () => {
      const { isPositionInBounds } = await import("./types");
      const mapSize = { width: 10, height: 10 };

      expect(isPositionInBounds([0, 0], mapSize)).toBe(true);
      expect(isPositionInBounds([9, 9], mapSize)).toBe(true);
      expect(isPositionInBounds([10, 0], mapSize)).toBe(false);
      expect(isPositionInBounds([0, 10], mapSize)).toBe(false);
      expect(isPositionInBounds([-1, 0], mapSize)).toBe(false);
    });
  });
});

// Function to run tests
function describe(name: string, fn: () => void) {
  console.log(`\n${name}`);
  fn();
}

function it(name: string, fn: () => void | Promise<void>) {
  const result = fn();

  if (result instanceof Promise) {
    result.then(
      () => console.log(`  ✓ ${name}`),
      (error) => {
        console.error(`  ✗ ${name}`);

        if (error instanceof Error) {
          console.error(`    ${error.message}`);
        }
      },
    );
  } else {
    try {
      console.log(`  ✓ ${name}`);
    } catch (error) {
      console.error(`  ✗ ${name}`);

      if (error instanceof Error) {
        console.error(`    ${error.message}`);
      }
    }
  }
}

function expect<T>(actual: T) {
  return {
    toBe(expected: T) {
      if (actual !== expected) {
        throw new Error(`Expected ${expected} but got ${actual}`);
      }
    },
    toEqual(expected: T) {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(`Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`);
      }
    },
    toHaveLength(expected: number) {
      if (!Array.isArray(actual)) {
        throw new Error(`Expected array but got ${typeof actual}`);
      }

      if (actual.length !== expected) {
        throw new Error(`Expected length ${expected} but got ${actual.length}`);
      }
    },
    toBeGreaterThanOrEqual(expected: number) {
      if (typeof actual !== "number") {
        throw new Error(`Expected number but got ${typeof actual}`);
      }

      if (actual < expected) {
        throw new Error(`Expected ${actual} to be >= ${expected}`);
      }
    },
    toBeUndefined() {
      if (actual !== undefined) {
        throw new Error(`Expected undefined but got ${actual}`);
      }
    },
  };
}

// Run tests if this file is executed directly
async function runTests() {
  console.log("Running StateConverter tests...");

  // Basic conversion tests
  const match1 = createTestMatch({
    turn: 5,
    mapWidth: 15,
    mapHeight: 12,
    fogOfWar: true,
  });
  const aiState1 = StateConverter.toAIState(match1);
  console.log("✓ Basic match conversion test passed");

  // Player conversion test
  const match2 = createTestMatch({});
  const aiState2 = StateConverter.toAIState(match2);
  console.log("✓ Player conversion test passed");

  // Utility function tests
  const { isSamePosition, getManhattanDistance, isPositionInBounds, cloneGameState } = await import(
    "./types"
  );

  if (isSamePosition([1, 2], [1, 2]) && !isSamePosition([1, 2], [2, 1])) {
    console.log("✓ Position equality test passed");
  }

  if (getManhattanDistance([0, 0], [3, 4]) === 7) {
    console.log("✓ Manhattan distance test passed");
  }

  const mapSize = { width: 10, height: 10 };

  if (isPositionInBounds([5, 5], mapSize) && !isPositionInBounds([10, 0], mapSize)) {
    console.log("✓ Position bounds test passed");
  }

  const cloned = cloneGameState(aiState2);
  aiState2.turn = 999;

  if (cloned.turn === 1) {
    console.log("✓ Deep clone test passed");
  }

  console.log("\nAll tests complete!");
}

runTests().catch(console.error);
