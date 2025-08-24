#!/usr/bin/env npx tsx
/**
 * Task to import an AWBW map with move-planner units and create a playable match
 * Usage: npx tsx src/server/tasks/import-and-play-awbw-map.ts <map-export-path> <move-planner-export-path>
 */

import * as fs from "fs";
import * as path from "path";
import { prisma } from "../prisma/prisma-client";
import { importAWBWMap, convertAWBWMapToWWMap } from "../tools/map-importer-utilities";
import { importAWBWMovePlanner, createPlayerMapping } from "../tools/awbw-unit-converter";
import type { AWBWMovePlannerExport } from "../tools/awbw-move-planner-types";

async function main() {
  // Get file paths from command line arguments
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error(
      "Usage: npx tsx src/server/tasks/import-and-play-awbw-map.ts <map-export-path> <move-planner-export-path>",
    );
    console.error("  <map-export-path>: Path to AWBW map export (tile data)");
    console.error(
      "  <move-planner-export-path>: Path to AWBW move planner export (units and buildings)",
    );
    process.exit(1);
  }

  const mapFilePath = path.resolve(args[0]);
  const movePlannerFilePath = path.resolve(args[1]);

  // Check if files exist
  if (!fs.existsSync(mapFilePath)) {
    console.error(`Map file not found: ${mapFilePath}`);
    process.exit(1);
  }

  if (!fs.existsSync(movePlannerFilePath)) {
    console.error(`Move planner file not found: ${movePlannerFilePath}`);
    process.exit(1);
  }

  console.log(`📁 Loading AWBW map data from: ${mapFilePath}`);
  console.log(`📁 Loading AWBW move-planner data from: ${movePlannerFilePath}`);

  try {
    // Load the map export (tile data as string)
    const mapContent = fs.readFileSync(mapFilePath, "utf-8");

    // Load the move planner JSON file
    const movePlannerContent = fs.readFileSync(movePlannerFilePath, "utf-8");
    const movePlannerData: AWBWMovePlannerExport = JSON.parse(movePlannerContent);

    console.log(`📊 Map name: ${movePlannerData.plannerName}`);
    console.log(`📊 Units found: ${Object.keys(movePlannerData.unitsState).length}`);

    // Import the map and create it in the database
    console.log("🗺️  Importing map to database...");

    // Convert the map tiles
    const tiles = convertAWBWMapToWWMap(mapContent);

    // Import units and player data from move planner (but NOT tiles since we have proper tile data)
    const { predeployedUnits, numberOfPlayers } = await importAWBWMovePlanner(movePlannerData, {
      useBuildingsForTiles: false, // Don't use buildings for tiles, we have proper map data
      mapName: movePlannerData.plannerName || "Imported AWBW Map",
    });

    // Apply building ownership from move planner to tiles
    // This is necessary because the map export has hardcoded player slots that don't match actual players
    if (movePlannerData.buildingsState) {
      // Create player mapping from move planner
      const playerMapping = createPlayerMapping(
        movePlannerData.unitsState,
        movePlannerData.buildingsState,
      );

      // Apply ownership to tiles
      for (const xStr in movePlannerData.buildingsState) {
        const x = parseInt(xStr);

        for (const yStr in movePlannerData.buildingsState[xStr]) {
          const y = parseInt(yStr);
          const buildingData = movePlannerData.buildingsState[xStr][yStr];
          const building = Array.isArray(buildingData) ? buildingData[0] : buildingData;

          // Check if this tile is a property that can have ownership
          const tile = tiles[y][x];

          if (tile && "type" in tile && "playerSlot" in tile) {
            // Apply ownership from move planner
            if ("buildings_players_id" in building && building.buildings_players_id !== undefined) {
              const playerSlot = playerMapping.get(building.buildings_players_id);

              if (playerSlot !== undefined) {
                tiles[y][x] = { ...tile, playerSlot };
              }
            } else {
              // Neutral property
              tiles[y][x] = { ...tile, playerSlot: -1 };
            }
          }
        }
      }

      console.log("📊 Applied building ownership from move planner to tiles");
    }

    console.log(`📊 Original player count: ${numberOfPlayers}`);
    console.log(`📊 Original unit count: ${predeployedUnits.length}`);

    // Dynamically remap units to 2 players for PvC match
    // Strategy:
    // - For even player counts: first half -> human (0), second half -> computer (1)
    // - For odd player counts: majority -> human (0), rest -> computer (1)
    let remappedUnits = predeployedUnits;
    let remappedTiles = tiles;

    if (numberOfPlayers > 2) {
      // Create mapping: split players into two groups
      const playerSlotMapping = new Map<number, number>();
      const midPoint = Math.ceil(numberOfPlayers / 2);

      for (let slot = 0; slot < numberOfPlayers; slot++) {
        if (slot < midPoint) {
          playerSlotMapping.set(slot, 0); // Human player
        } else {
          playerSlotMapping.set(slot, 1); // Computer player
        }
      }

      console.log(
        `📊 Player slot mapping: ${Array.from(playerSlotMapping.entries())
          .map(([from, to]) => `${from}→${to}`)
          .join(", ")}`,
      );

      // Remap units
      remappedUnits = predeployedUnits.map((unit) => ({
        ...unit,
        playerSlot: playerSlotMapping.get(unit.playerSlot) ?? unit.playerSlot,
      }));

      // Remap tiles (properties)
      remappedTiles = tiles.map((row) =>
        row.map((tile) => {
          if ("playerSlot" in tile && typeof tile.playerSlot === "number") {
            const mappedSlot = playerSlotMapping.get(tile.playerSlot);

            if (mappedSlot !== undefined) {
              return { ...tile, playerSlot: mappedSlot };
            }
          }

          return tile;
        }),
      );

      console.log(`📊 Remapped ${numberOfPlayers} players to 2 players`);
    } else if (numberOfPlayers === 2) {
      console.log(`📊 Map already has 2 players, no remapping needed`);
    } else if (numberOfPlayers === 1) {
      // For 1-player maps, we need to ensure there's still a computer opponent
      console.log(`⚠️  Map only has 1 player, computer will have no units`);
    }

    console.log(`📊 Remapped property ownership to 2 players`);

    // Now create the map in database with remapped units
    const importedMap = await prisma.wWMap.create({
      data: {
        name: movePlannerData.plannerName || "Imported AWBW Map",
        numberOfPlayers: 2, // Force 2 players for PvC
        tiles: remappedTiles as any,
        predeployedUnits: remappedUnits as any,
      },
    });

    console.log(`✅ Map imported with ID: ${importedMap.id}`);

    // Get the human player (development user)
    const devPlayer = await prisma.player.findFirst({
      where: {
        name: {
          startsWith: "[dev]",
        },
      },
    });

    if (!devPlayer) {
      console.error("❌ No development player found. Please run 'npm run prisma:seed' first.");
      process.exit(1);
    }

    console.log(`👤 Found player: ${devPlayer.name} (${devPlayer.id})`);

    // Create a new match
    console.log(`🎮 Creating new match...`);

    // Match configuration based on the template match
    const matchData = {
      leagueType: "standard" as const,
      mode: "pvc" as const, // Player vs Computer
      rules: {
        dayLimit: 50,
        fogOfWar: false,
        teamMapping: [0, 1], // Two teams
        captureLimit: 50,
        labUnitTypes: [],
        weatherSetting: "clear",
        bannedUnitTypes: [],
        fundsPerProperty: 1000,
        unitCapPerPlayer: 50,
      },
      status: "playing" as const,
      mapId: importedMap.id,
      playerState: [
        {
          id: devPlayer.id,
          army: "orange-star",
          coId: {
            name: "andy",
            version: "AW2",
          },
          name: devPlayer.name,
          slot: 0,
          funds: 10000,
          ready: true,
          status: "alive",
          powerMeter: 0,
          COPowerState: "no-power",
          hasCurrentTurn: true,
          timesPowerUsed: 0,
        },
        {
          id: "computer-player-001",
          army: "blue-moon",
          coId: {
            name: "andy",
            version: "AW2",
          },
          name: "Computer",
          slot: 1,
          funds: 10000,
          ready: true,
          status: "alive",
          powerMeter: 0,
          COPowerState: "no-power",
          hasCurrentTurn: false,
          timesPowerUsed: 0,
        },
      ],
      chatIsPublic: false,
    };

    // Create the match with player connection
    const createdMatch = await prisma.match.create({
      data: {
        ...matchData,
        Player: {
          connect: {
            id: devPlayer.id,
          },
        },
      },
    });

    console.log(`✅ Match created successfully!`);
    console.log(`🎮 Match ID: ${createdMatch.id}`);
    console.log(`🗺️  Map: ${movePlannerData.plannerName || "Imported Map"}`);
    console.log(`👥 Players:`);
    console.log(`   - ${devPlayer.name} (Human) - Orange Star`);
    console.log(`   - Computer - Blue Moon`);
    console.log(`\n🚀 You can now log in and play the match!`);
  } catch (error) {
    console.error("❌ Error importing map or creating match:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the task
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
