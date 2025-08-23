/**
 * Test file for AWBW Move Planner import functionality
 * Run with: npx tsx src/tests/awbw-move-planner-import.test.ts
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { importAWBWMapFromMovePlanner } from "../server/tools/map-importer-utilities";
import type { AWBWMovePlannerExport } from "../server/tools/awbw-move-planner-types";
import { createPlayerMapping, convertAWBWUnitToWW } from "../server/tools/awbw-unit-converter";
import type { UnitWithVisibleStats } from "shared/schemas/unit";

// ES module fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load fixtures
const fixturePath = path.join(__dirname, "../../tests/fixtures/awbw-move-planner-sample.json");
const fixtureData: AWBWMovePlannerExport = JSON.parse(fs.readFileSync(fixturePath, "utf-8"));

// Load 2-player move planner data
const movePlanner2PlayerPath = "/Users/vincentdaubry/Documents/Projects/misc/WarsWorld/tmp/move-planner-2player.json";
const movePlanner2PlayerData: AWBWMovePlannerExport = JSON.parse(fs.readFileSync(movePlanner2PlayerPath, "utf-8"));

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

console.log("===== AWBW Move Planner Import Tests =====\n");

// Test 1: Player Mapping
console.log("--- Test 1: Player Mapping ---");
const playerMapping = createPlayerMapping(fixtureData.unitsState, fixtureData.buildingsState);
assert(playerMapping.size === 5, "Should map 5 unique players (including neutral)");
assert(playerMapping.has(3466389), "Should have mapping for player 3466389");
assert(playerMapping.has(3468084), "Should have mapping for player 3468084");
assert(playerMapping.has(3468043), "Should have mapping for player 3468043");
assert(playerMapping.has(3466493), "Should have mapping for player 3466493");
assert(playerMapping.has(""), "Should have mapping for neutral player (empty string)");

// Test 2: Unit Conversion
console.log("\n--- Test 2: Unit Conversion ---");

// Test Infantry conversion
const infantry180817171 = fixtureData.unitsState["180817171"];
assert(infantry180817171 !== undefined, "Infantry 180817171 should exist in fixture");
const convertedInfantry = convertAWBWUnitToWW(infantry180817171, playerMapping);
assert(convertedInfantry !== null, "Infantry should convert successfully");
if (convertedInfantry) {
  assertEqual(convertedInfantry.type, "infantry", "Unit type should be infantry");
  assertEqual(convertedInfantry.position, [14, 8], "Position should be [14, 8]");
  assertEqual(convertedInfantry.stats.hp, 90, "HP should be 90 (9 * 10)");
  assertEqual(convertedInfantry.stats.fuel, 94, "Fuel should be 94");
  assertEqual(convertedInfantry.playerSlot, playerMapping.get(3466389), "Should map to correct player slot");
  assertEqual(convertedInfantry.isReady, false, "Predeployed units should not be ready");
}

// Test Tank conversion
const tank180958329 = fixtureData.unitsState["180958329"];
assert(tank180958329 !== undefined, "Tank 180958329 should exist in fixture");
const convertedTank = convertAWBWUnitToWW(tank180958329, playerMapping);
assert(convertedTank !== null, "Tank should convert successfully");
if (convertedTank) {
  assertEqual(convertedTank.type, "tank", "Unit type should be tank");
  assertEqual(convertedTank.position, [13, 4], "Position should be [13, 4]");
  assertEqual(convertedTank.stats.hp, 60, "HP should be 60 (6 * 10)");
  assertEqual((convertedTank.stats as any).ammo, 8, "Ammo should be 8");
  assertEqual(convertedTank.stats.fuel, 56, "Fuel should be 56");
}

// Test Artillery conversion
const artillery180914789 = fixtureData.unitsState["180914789"];
assert(artillery180914789 !== undefined, "Artillery 180914789 should exist in fixture");
const convertedArtillery = convertAWBWUnitToWW(artillery180914789, playerMapping);
assert(convertedArtillery !== null, "Artillery should convert successfully");
if (convertedArtillery) {
  assertEqual(convertedArtillery.type, "artillery", "Unit type should be artillery");
  assertEqual(convertedArtillery.position, [12, 2], "Position should be [12, 2]");
  assertEqual(convertedArtillery.stats.hp, 90, "HP should be 90 (9 * 10)");
  assertEqual((convertedArtillery.stats as any).ammo, 8, "Ammo should be 8");
  assertEqual(convertedArtillery.stats.fuel, 50, "Fuel should be 50");
}

// Test B-Copter conversion
const bcopter181015366 = fixtureData.unitsState["181015366"];
assert(bcopter181015366 !== undefined, "B-Copter 181015366 should exist in fixture");
const convertedBCopter = convertAWBWUnitToWW(bcopter181015366, playerMapping);
assert(convertedBCopter !== null, "B-Copter should convert successfully");
if (convertedBCopter) {
  assertEqual(convertedBCopter.type, "battleCopter", "Unit type should be battleCopter");
  assertEqual(convertedBCopter.position, [6, 16], "Position should be [6, 16]");
  assertEqual(convertedBCopter.stats.hp, 100, "HP should be 100 (10 * 10)");
  assertEqual((convertedBCopter.stats as any).ammo, 6, "Ammo should be 6");
  assertEqual(convertedBCopter.stats.fuel, 86, "Fuel should be 86");
}

// Test APC conversion
const apc180965293 = fixtureData.unitsState["180965293"];
assert(apc180965293 !== undefined, "APC 180965293 should exist in fixture");
const convertedAPC = convertAWBWUnitToWW(apc180965293, playerMapping);
assert(convertedAPC !== null, "APC should convert successfully");
if (convertedAPC) {
  assertEqual(convertedAPC.type, "apc", "Unit type should be apc");
  assertEqual(convertedAPC.position, [9, 18], "Position should be [9, 18]");
  assertEqual((convertedAPC as any).loadedUnit, null, "Should have null loadedUnit field");
}

// Test 3: Building/Tile Extraction
console.log("\n--- Test 3: Building/Tile Verification ---");

// Check specific buildings from buildingsState
const neutralCity00 = fixtureData.buildingsState["0"]["0"];
assert(neutralCity00 !== undefined, "Neutral city should exist at [0,0]");
if (neutralCity00 && !Array.isArray(neutralCity00)) {
  assertEqual(neutralCity00.terrain_id, 34, "Terrain ID should be 34 (neutral city)");
  assertEqual(neutralCity00.buildings_x, 0, "X coordinate should be 0");
  assertEqual(neutralCity00.buildings_y, 0, "Y coordinate should be 0");
}

const osHQ = fixtureData.buildingsState["4"]["12"];
assert(osHQ !== undefined, "Orange Star HQ should exist at [4,12]");
if (osHQ && !Array.isArray(osHQ)) {
  assertEqual(osHQ.terrain_id, 42, "Terrain ID should be 42 (OS HQ)");
  assertEqual(osHQ.buildings_players_id, 3466389, "Should belong to player 3466389");
}

const bmHQ = fixtureData.buildingsState["16"]["8"];
assert(bmHQ !== undefined, "Blue Moon HQ should exist at [16,8]");
if (bmHQ && !Array.isArray(bmHQ)) {
  assertEqual(bmHQ.terrain_id, 47, "Terrain ID should be 47 (BM HQ)");
}

const commTower = fixtureData.buildingsState["8"]["8"];
assert(commTower !== undefined, "Comm tower should exist at [8,8]");
if (commTower && !Array.isArray(commTower)) {
  assertEqual(commTower.terrain_id, 133, "Terrain ID should be 133 (neutral comm tower)");
}

// Test 4: Full Import Process (without DB)
console.log("\n--- Test 4: Full Import Process ---");

// Import using the converter (without saving to DB)
import { importAWBWMovePlanner } from "../server/tools/awbw-unit-converter";

async function testFullImport() {
  try {
    const result = await importAWBWMovePlanner(fixtureData, {
      useBuildingsForTiles: true,
      mapName: "Test Import",
    });
    
    assert(result.tiles !== null, "Should have tiles array");
    assert(result.predeployedUnits !== null, "Should have predeployed units");
    assert(result.numberOfPlayers === 5, "Should have 5 players (including neutral)");
    
    // Verify some units are in the result
    const unitCount = result.predeployedUnits.length;
    assert(unitCount > 40, `Should have 40+ units, got ${unitCount}`);
    
    // Check specific unit exists
    const infantryAt14_8 = result.predeployedUnits.find(
      (u: UnitWithVisibleStats) => u.position[0] === 14 && u.position[1] === 8
    );
    assert(infantryAt14_8 !== undefined, "Should have infantry at [14,8]");
    if (infantryAt14_8) {
      assertEqual(infantryAt14_8.type, "infantry", "Unit at [14,8] should be infantry");
      assertEqual(infantryAt14_8.stats.hp, 90, "Infantry at [14,8] should have 90 HP");
    }
    
    // Check tiles dimensions
    assert(result.tiles.length === 21, "Should have 21 rows");
    assert(result.tiles[0].length === 21, "Should have 21 columns");
    
    // Verify specific tiles
    const tile00 = result.tiles[0][0];
    assert(tile00.type === "city", "Tile at [0,0] should be city");
    
    const tile412 = result.tiles[12][4];
    assert(tile412.type === "hq", "Tile at [4,12] should be HQ");
    if ("playerSlot" in tile412) {
      assertEqual(tile412.playerSlot, playerMapping.get(3466389), "HQ should belong to correct player");
    }
    
  } catch (error) {
    console.error("Full import test failed:", error);
    testsFailed++;
  }
}

// Test 5: Terrain Tile Mapping Verification
console.log("\n--- Test 5: Terrain Tile Mapping Verification ---");

// Import for testing terrain mapping
import { awbwTileMapping } from "../server/tools/map-importer-utilities";

// Define expected terrain mappings (1-based coordinates to 0-based)
const terrainTests = [
  { coord: [1, 0], awbwId: null, expectedType: "forest", description: "Forest at [2,1]" },
  { coord: [4, 0], awbwId: null, expectedType: "mountain", description: "Mountain at [5,1]" },
  { coord: [7, 0], awbwId: null, expectedType: "shoal", description: "Beach/shallow water at [8,1]" },
  { coord: [0, 1], awbwId: null, expectedType: "road", description: "Road at [1,2]" },
  { coord: [3, 1], awbwId: null, expectedType: "forest", description: "Forest at [4,2]" },
  { coord: [7, 1], awbwId: null, expectedType: "bridge", description: "Bridge at [8,2]" },
  { coord: [14, 1], awbwId: null, expectedType: "pipe", description: "Pipe at [15,2]" },
  { coord: [1, 2], awbwId: null, expectedType: "sea", description: "Coast/deep water at [2,3]" },
  { coord: [2, 2], awbwId: null, expectedType: "shoal", description: "Beach at [3,3]" },
  { coord: [6, 2], awbwId: null, expectedType: "mountain", description: "Mountain at [7,3]" },
  { coord: [1, 3], awbwId: null, expectedType: "sea", description: "Coast/deep water at [2,4]" },
  { coord: [4, 11], awbwId: null, expectedType: "plain", variant: "broken-pipe", description: "Broken pipe at [5,12]" },
];

// Since we don't have the actual map tile data, we'll verify the mapping exists
console.log("\nVerifying AWBW tile ID mappings exist for expected terrain types:");

// Check forest mapping (ID 3)
const forestMapping = awbwTileMapping["3"];
assert(forestMapping !== undefined, "Forest mapping (ID 3) should exist");
if (forestMapping) {
  assertEqual(forestMapping.type, "forest", "ID 3 should map to forest");
}

// Check mountain mapping (ID 2)  
const mountainMapping = awbwTileMapping["2"];
assert(mountainMapping !== undefined, "Mountain mapping (ID 2) should exist");
if (mountainMapping) {
  assertEqual(mountainMapping.type, "mountain", "ID 2 should map to mountain");
}

// Check shoal/beach mappings (IDs 29-32)
const shoalMapping = awbwTileMapping["29"];
assert(shoalMapping !== undefined, "Shoal mapping (ID 29) should exist");
if (shoalMapping) {
  assertEqual(shoalMapping.type, "shoal", "ID 29 should map to shoal");
}

// Check road mappings (IDs 15-25)
const roadMapping = awbwTileMapping["15"];
assert(roadMapping !== undefined, "Road mapping (ID 15) should exist");
if (roadMapping) {
  assertEqual(roadMapping.type, "road", "ID 15 should map to road");
}

// Check bridge mappings (IDs 26-27)
const bridgeMapping = awbwTileMapping["26"];
assert(bridgeMapping !== undefined, "Bridge mapping (ID 26) should exist");
if (bridgeMapping) {
  assertEqual(bridgeMapping.type, "bridge", "ID 26 should map to bridge");
}

// Check pipe mappings (IDs 101-110)
const pipeMapping = awbwTileMapping["101"];
assert(pipeMapping !== undefined, "Pipe mapping (ID 101) should exist");
if (pipeMapping) {
  assertEqual(pipeMapping.type, "pipe", "ID 101 should map to pipe");
}

// Check sea mapping (ID 28)
const seaMapping = awbwTileMapping["28"];
assert(seaMapping !== undefined, "Sea mapping (ID 28) should exist");
if (seaMapping) {
  assertEqual(seaMapping.type, "sea", "ID 28 should map to sea");
}

// Check broken pipe mappings (IDs 115-116)
const brokenPipeMapping = awbwTileMapping["115"];
assert(brokenPipeMapping !== undefined, "Broken pipe mapping (ID 115) should exist");
if (brokenPipeMapping) {
  assertEqual(brokenPipeMapping.type, "plain", "ID 115 should map to plain");
  assertEqual(brokenPipeMapping.variant, "broken-pipe-right-left", "ID 115 should have broken-pipe-right-left variant");
}

console.log("\n📝 Note: Full terrain verification requires the actual map tile export data.");
console.log("   The move-planner export only contains buildings/properties, not base terrain.");

// Run async test
testFullImport().then(() => {
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
});