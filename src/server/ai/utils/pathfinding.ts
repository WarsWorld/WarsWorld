import type { AIGameState, AIPosition, AIUnit, AIWeather } from "../types";
import { UnitPropertiesAdapter, TerrainPropertiesAdapter } from "./game-constants-adapter";
import { isSamePosition, isPositionInBounds } from "../types";

export type AIPathNode = {
  position: AIPosition;
  distance: number;
  parent: AIPosition | null;
};

/**
 * Calculates all reachable positions for a unit
 * @param state - The current AI game state
 * @param unitId - The unit ID (format: "x,y")
 * @returns Map of reachable positions to path nodes with distance and parent info
 */
export function getAccessiblePositions(
  state: AIGameState,
  unitId: string,
): Map<string, AIPathNode> {
  const unit = getUnitById(state, unitId);

  if (!unit) {
    return new Map();
  }

  const accessiblePositions = new Map<string, AIPathNode>();
  const movementPoints = Math.min(UnitPropertiesAdapter.getMovementPoints(unit.type), unit.fuel);
  const movementType = UnitPropertiesAdapter.getMovementType(unit.type);

  if (!movementType || movementPoints <= 0) {
    // Unit can't move, only return its current position
    const posKey = positionToKey(unit.position);
    accessiblePositions.set(posKey, {
      position: unit.position,
      distance: 0,
      parent: null,
    });
    return accessiblePositions;
  }

  // Priority queue for BFS, indexed by distance
  const queues: AIPathNode[][] = Array.from({ length: movementPoints + 1 }, () => []);
  queues[0].push({ position: unit.position, distance: 0, parent: null });

  // Track visited positions
  const visited = new Set<string>();

  // Mark enemy unit positions as impassable (except the starting position)
  const enemyPositions = new Set<string>();

  for (const enemyUnit of state.units) {
    if (enemyUnit.playerIndex !== unit.playerIndex) {
      enemyPositions.add(positionToKey(enemyUnit.position));
    }
  }

  let currentDist = 0;

  while (currentDist < queues.length) {
    if (queues[currentDist].length === 0) {
      currentDist++;
      continue;
    }

    const currentNode = queues[currentDist].pop();

    if (!currentNode) {
      continue;
    }

    const posKey = positionToKey(currentNode.position);

    if (visited.has(posKey)) {
      continue;
    }

    visited.add(posKey);
    accessiblePositions.set(posKey, currentNode);

    // Check all neighbors
    for (const neighborPos of getNeighborPositions(currentNode.position, state.mapSize)) {
      const neighborKey = positionToKey(neighborPos);

      // Skip if already visited
      if (visited.has(neighborKey)) {
        continue;
      }

      // Skip if occupied by enemy (but allow own units for now)
      if (enemyPositions.has(neighborKey) && !isSamePosition(neighborPos, unit.position)) {
        continue;
      }

      // Get tile at this position to calculate movement cost
      const tile = getTileAt(state, neighborPos);
      const tileType = tile?.type ?? "plain"; // Default to plain if tile not found

      const movementCost = TerrainPropertiesAdapter.getMovementCost(
        movementType,
        tileType,
        state.weather,
      );

      if (movementCost === null) {
        // Impassable terrain
        continue;
      }

      const newDistance = currentNode.distance + movementCost;

      if (newDistance <= movementPoints) {
        queues[newDistance].push({
          position: neighborPos,
          distance: newDistance,
          parent: currentNode.position,
        });
      }
    }
  }

  return accessiblePositions;
}

/**
 * Reconstructs the path from origin to destination
 * @param accessiblePositions - Map returned from getAccessiblePositions
 * @param targetPosition - The destination position [x, y]
 * @returns Array of positions forming the path, or null if unreachable
 */
export function reconstructPath(
  accessiblePositions: Map<string, AIPathNode>,
  targetPosition: AIPosition,
): AIPosition[] | null {
  const targetKey = positionToKey(targetPosition);
  const targetNode = accessiblePositions.get(targetKey);

  if (!targetNode) {
    return null;
  }

  const path: AIPosition[] = [];
  let currentNode: AIPathNode | undefined = targetNode;

  while (currentNode) {
    path.unshift(currentNode.position);

    if (currentNode.parent === null) {
      break;
    }

    const parentKey = positionToKey(currentNode.parent);
    currentNode = accessiblePositions.get(parentKey);
  }

  return path;
}

/**
 * Calculates the movement cost for a unit to a specific position
 * @param state - The current AI game state
 * @param unitType - The type of unit (e.g., "infantry", "tank")
 * @param fromPos - Starting position
 * @param toPos - Target position
 * @param weather - Current weather conditions (optional, uses state weather if not provided)
 * @returns Movement cost or null if impassable
 */
export function getMovementCost(
  state: AIGameState,
  unitType: string,
  fromPos: AIPosition,
  toPos: AIPosition,
  weather?: AIWeather,
): number | null {
  // Check if positions are adjacent
  const dx = Math.abs(toPos[0] - fromPos[0]);
  const dy = Math.abs(toPos[1] - fromPos[1]);

  if (dx + dy !== 1) {
    // Positions must be adjacent
    return null;
  }

  const movementType = UnitPropertiesAdapter.getMovementType(unitType);

  if (!movementType) {
    return null;
  }

  const tile = getTileAt(state, toPos);
  const tileType = tile?.type ?? "plain";

  return TerrainPropertiesAdapter.getMovementCost(movementType, tileType, weather ?? state.weather);
}

/**
 * Checks if a position is within movement range
 * @param state - The current AI game state
 * @param unitId - The unit ID
 * @param targetPosition - Position to check
 * @returns True if reachable within unit's movement points
 */
export function canReachPosition(
  state: AIGameState,
  unitId: string,
  targetPosition: AIPosition,
): boolean {
  const accessiblePositions = getAccessiblePositions(state, unitId);
  const targetKey = positionToKey(targetPosition);
  return accessiblePositions.has(targetKey);
}

/**
 * Gets all neighbor positions (up, down, left, right)
 * @param position - Current position
 * @param mapSize - Map dimensions
 * @returns Array of valid neighbor positions
 */
export function getNeighborPositions(
  position: AIPosition,
  mapSize: { width: number; height: number },
): AIPosition[] {
  const neighbors: AIPosition[] = [];
  const directions: AIPosition[] = [
    [0, -1], // up
    [0, 1], // down
    [-1, 0], // left
    [1, 0], // right
  ];

  for (const [dx, dy] of directions) {
    const newPos: AIPosition = [position[0] + dx, position[1] + dy];

    if (isPositionInBounds(newPos, mapSize)) {
      neighbors.push(newPos);
    }
  }

  return neighbors;
}

// Helper functions

/**
 * Convert a position to a string key for Map storage
 */
function positionToKey(pos: AIPosition): string {
  return `${pos[0]},${pos[1]}`;
}

/**
 * Gets a unit by its ID
 * Helper function - will be moved to unit-utils.ts
 */
function getUnitById(state: AIGameState, unitId: string): AIUnit | undefined {
  return state.units.find((unit) => {
    const unitKey = `${unit.position[0]},${unit.position[1]}`;
    return unitKey === unitId;
  });
}

/**
 * Gets the tile at a specific position
 * Helper function - will be moved to tile-utils.ts
 */
function getTileAt(
  state: AIGameState,
  position: AIPosition,
): import("../types").AITile | undefined {
  return state.tiles.find((tile) => isSamePosition(tile.position, position));
}
