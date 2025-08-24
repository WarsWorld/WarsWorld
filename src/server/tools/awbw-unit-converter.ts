import type { UnitWithVisibleStats } from "shared/schemas/unit";
import type { PlayerSlot } from "shared/schemas/player-slot";
import { unitPropertiesMap } from "shared/match-logic/game-constants/unit-properties";
import type {
  AWBWUnit,
  AWBWMovePlannerExport,
  AWBWBuildingsState,
} from "./awbw-move-planner-types";
import { awbwUnitNameToWWType } from "./awbw-move-planner-types";
import type { Tile } from "shared/schemas/tile";
import type { WWMap } from "@prisma/client";
import { awbwTileMapping } from "./map-importer-utilities";

/**
 * Creates a player ID to playerSlot mapping from units AND buildings
 */
export function createPlayerMapping(
  units: Record<string, AWBWUnit>,
  buildingsState?: AWBWBuildingsState,
): Map<string | number, PlayerSlot> {
  const playerIds = new Set<string | number>();

  // Extract unique player IDs from units
  for (const unit of Object.values(units)) {
    if (unit.units_players_id !== undefined && unit.units_players_id !== "") {
      playerIds.add(unit.units_players_id);
    }
  }

  // Extract unique player IDs from buildings (for owned properties)
  if (buildingsState) {
    for (const xStr in buildingsState) {
      for (const yStr in buildingsState[xStr]) {
        const buildingData = buildingsState[xStr][yStr];
        const building = Array.isArray(buildingData) ? buildingData[0] : buildingData;

        if ("buildings_players_id" in building && building.buildings_players_id !== undefined) {
          playerIds.add(building.buildings_players_id);
        }
      }
    }
  }

  // Sort for consistent mapping
  const sortedIds = Array.from(playerIds).sort();

  // Map to sequential playerSlots
  const mapping = new Map<string | number, PlayerSlot>();
  sortedIds.forEach((id, index) => {
    mapping.set(id, index);
  });

  return mapping;
}

/**
 * Converts an AWBW unit to WarsWorld format
 */
export function convertAWBWUnitToWW(
  awbwUnit: AWBWUnit,
  playerMapping: Map<string | number, PlayerSlot>,
): UnitWithVisibleStats | null {
  // Get unit type
  const unitType = awbwUnitNameToWWType[awbwUnit.units_name];

  if (!unitType) {
    console.warn(`Unknown unit type: ${awbwUnit.units_name}`);
    return null;
  }

  // Get player slot
  const playerSlot = playerMapping.get(awbwUnit.units_players_id);

  if (playerSlot === undefined) {
    // Skip units without valid player IDs (might be neutral or invalid)
    if (awbwUnit.units_players_id !== undefined && awbwUnit.units_players_id !== "") {
      console.warn(`No player mapping for ID: ${awbwUnit.units_players_id}`);
    }

    return null;
  }

  // Get unit properties to determine if it has ammo
  const unitProps = unitPropertiesMap[unitType as keyof typeof unitPropertiesMap];

  if (!unitProps) {
    console.warn(`No unit properties for type: ${unitType}`);
    return null;
  }

  // Base unit properties
  const baseUnit: any = {
    type: unitType,
    playerSlot,
    position: [awbwUnit.units_x, awbwUnit.units_y],
    isReady: false, // Predeployed units start not ready
    stats: {
      hp: awbwUnit.units_hit_points * 10, // AWBW uses 1-10, WW uses 1-100
      fuel: awbwUnit.units_fuel,
    },
  };

  // Add ammo if applicable
  if ("initialAmmo" in unitProps && awbwUnit.units_ammo !== undefined) {
    baseUnit.stats.ammo = awbwUnit.units_ammo;
  }

  // Handle capturing state for infantry/mech
  if ((unitType === "infantry" || unitType === "mech") && awbwUnit.units_capture === 1) {
    // Calculate capture points based on HP
    // AWBW capture is binary, but we can estimate progress
    baseUnit.currentCapturePoints = 20 - awbwUnit.units_hit_points;
  }

  // Handle stealth/sub hidden state
  if (unitType === "stealth" || unitType === "sub") {
    baseUnit.hidden = false; // Default to visible for predeployed
  }

  // Handle transport units (simplified - cargo tracking would need more data)
  if (unitType === "apc" || unitType === "transportCopter" || unitType === "blackBoat") {
    baseUnit.loadedUnit = null;

    if (unitType === "blackBoat") {
      baseUnit.loadedUnit2 = null;
    }
  }

  if (unitType === "lander") {
    baseUnit.loadedUnit = null;
    baseUnit.loadedUnit2 = null;
  }

  if (unitType === "carrier") {
    baseUnit.loadedUnit = null;
    baseUnit.loadedUnit2 = null;
  }

  if (unitType === "cruiser") {
    baseUnit.loadedUnit = null;
    baseUnit.loadedUnit2 = null;
  }

  return baseUnit as UnitWithVisibleStats;
}

/**
 * Extracts tiles from buildings state (optional - can verify against existing conversion)
 */
export function extractTilesFromBuildings(
  buildingsState: AWBWBuildingsState,
  playerMapping: Map<string | number, PlayerSlot>,
): Tile[][] {
  // Find dimensions
  let maxX = 0;
  let maxY = 0;

  for (const xStr in buildingsState) {
    const x = parseInt(xStr);
    maxX = Math.max(maxX, x);

    for (const yStr in buildingsState[xStr]) {
      const y = parseInt(yStr);
      maxY = Math.max(maxY, y);
    }
  }

  // Initialize tile array with plains
  const tiles: Tile[][] = [];

  for (let y = 0; y <= maxY; y++) {
    tiles[y] = [];

    for (let x = 0; x <= maxX; x++) {
      tiles[y][x] = { type: "plain", variant: "normal" };
    }
  }

  // Fill in buildings
  for (const xStr in buildingsState) {
    const x = parseInt(xStr);

    for (const yStr in buildingsState[xStr]) {
      const y = parseInt(yStr);
      const buildingData = buildingsState[xStr][yStr];
      const building = Array.isArray(buildingData) ? buildingData[0] : buildingData;

      // Use existing awbwTileMapping from map-importer-utilities
      const tile = awbwTileMapping[building.terrain_id.toString()];

      if (tile) {
        // Check if building has player ownership
        if ("buildings_players_id" in building && building.buildings_players_id !== undefined) {
          const playerSlot = playerMapping.get(building.buildings_players_id);

          if (
            playerSlot !== undefined &&
            "type" in tile &&
            ["base", "airport", "port", "hq", "lab", "commtower", "city"].includes(tile.type)
          ) {
            // Add playerSlot to owned properties
            tiles[y][x] = { ...tile, playerSlot };
          } else {
            tiles[y][x] = tile;
          }
        } else {
          // Neutral property or non-property tile
          if (
            "type" in tile &&
            ["base", "airport", "port", "hq", "lab", "commtower", "city"].includes(tile.type)
          ) {
            tiles[y][x] = { ...tile, playerSlot: -1 }; // -1 for neutral
          } else {
            tiles[y][x] = tile;
          }
        }
      }
    }
  }

  return tiles;
}

/**
 * Main function to import AWBW move planner data
 */
export async function importAWBWMovePlanner(
  movePlannerData: AWBWMovePlannerExport,
  options?: {
    useBuildingsForTiles?: boolean;
    mapName?: string;
  },
): Promise<{
  tiles: WWMap["tiles"] | null;
  predeployedUnits: UnitWithVisibleStats[];
  numberOfPlayers: number;
}> {
  // Create player mapping from both units and buildings
  const playerMapping = createPlayerMapping(
    movePlannerData.unitsState,
    movePlannerData.buildingsState,
  );

  // Convert units
  const predeployedUnits: UnitWithVisibleStats[] = [];

  for (const awbwUnit of Object.values(movePlannerData.unitsState)) {
    const wwUnit = convertAWBWUnitToWW(awbwUnit, playerMapping);

    if (wwUnit) {
      predeployedUnits.push(wwUnit);
    }
  }

  // Extract tiles with player ownership
  let tiles: Tile[][] | null = null;

  if (options?.useBuildingsForTiles && movePlannerData.buildingsState) {
    tiles = extractTilesFromBuildings(movePlannerData.buildingsState, playerMapping);
  }

  // If tiles are requested but not available, throw error
  if (options?.useBuildingsForTiles && !tiles) {
    throw new Error("Tiles requested but buildings state not available");
  }

  return {
    tiles: tiles as WWMap["tiles"] | null,
    predeployedUnits,
    numberOfPlayers: playerMapping.size,
  };
}
