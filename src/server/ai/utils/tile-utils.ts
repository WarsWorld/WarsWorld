import type { AIGameState, AIPosition, AITile } from "../types";
import { isSamePosition } from "../types";
import { TerrainPropertiesAdapter, isProductionFacility } from "./game-constants-adapter";

/**
 * Gets the tile at a specific position
 * @param state - The current AI game state
 * @param position - The position to check
 * @returns The tile at that position or undefined
 */
export function getTileAt(state: AIGameState, position: AIPosition): AITile | undefined {
  return state.tiles.find((tile) => isSamePosition(tile.position, position));
}

/**
 * Checks if a tile can produce units
 * @param tile - The tile to check
 * @returns True if it's a base, airport, or port
 */
export function isUnitProducingProperty(tile: AITile): boolean {
  return isProductionFacility(tile.type);
}

/**
 * Gets all unit-producing properties owned by a player
 * @param state - The current AI game state
 * @param playerIndex - The player index
 * @returns Array of tiles that can produce units
 */
export function getPlayerFactories(state: AIGameState, playerIndex: number): AITile[] {
  return state.tiles.filter(
    (tile) => tile.ownerIndex === playerIndex && isUnitProducingProperty(tile),
  );
}

/**
 * Checks if a position is occupied by a unit
 * @param state - The current AI game state
 * @param position - The position to check
 * @returns True if occupied
 */
export function isPositionOccupied(state: AIGameState, position: AIPosition): boolean {
  return state.units.some((unit) => isSamePosition(unit.position, position));
}

/**
 * Gets all capturable properties (cities, bases, etc.)
 * @param state - The current AI game state
 * @returns Array of capturable tiles
 */
export function getCapturableProperties(state: AIGameState): AITile[] {
  // Properties are capturable if they are in the tiles array
  // (changeable tiles include all capturable properties)
  return state.tiles.filter((tile) => isProperty(tile));
}

/**
 * Gets all enemy properties
 * @param state - The current AI game state
 * @param playerIndex - The current player index
 * @returns Array of enemy-owned tiles
 */
export function getEnemyProperties(state: AIGameState, playerIndex: number): AITile[] {
  return state.tiles.filter(
    (tile) => tile.ownerIndex !== undefined && tile.ownerIndex !== playerIndex && isProperty(tile),
  );
}

/**
 * Gets all neutral properties (not owned by any player)
 * @param state - The current AI game state
 * @returns Array of neutral tiles
 */
export function getNeutralProperties(state: AIGameState): AITile[] {
  return state.tiles.filter((tile) => tile.ownerIndex === undefined && isProperty(tile));
}

/**
 * Checks if a tile is a property (capturable)
 * @param tile - The tile to check
 * @returns True if it's a capturable property
 */
export function isProperty(tile: AITile): boolean {
  const propertyTypes = ["city", "base", "airport", "port", "lab", "commtower", "hq"];
  return propertyTypes.includes(tile.type);
}

/**
 * Gets the defense bonus for a tile
 * @param tileType - The type of tile
 * @returns Defense stars (0-4)
 */
export function getDefenseStars(tileType: string): number {
  return TerrainPropertiesAdapter.getDefenseStars(tileType);
}

/**
 * Gets all tiles of a specific type
 * @param state - The current AI game state
 * @param tileType - The type of tile to find
 * @returns Array of tiles of the specified type
 */
export function getTilesByType(state: AIGameState, tileType: string): AITile[] {
  return state.tiles.filter((tile) => tile.type === tileType);
}

/**
 * Checks if a position has a specific tile type
 * @param state - The current AI game state
 * @param position - The position to check
 * @param tileType - The expected tile type
 * @returns True if the position has the specified tile type
 */
export function isPositionOfType(
  state: AIGameState,
  position: AIPosition,
  tileType: string,
): boolean {
  const tile = getTileAt(state, position);
  return tile?.type === tileType;
}

/**
 * Gets the owner index of a tile at a position
 * @param state - The current AI game state
 * @param position - The position to check
 * @returns The owner index or undefined if not owned
 */
export function getTileOwner(state: AIGameState, position: AIPosition): number | undefined {
  const tile = getTileAt(state, position);
  return tile?.ownerIndex;
}

/**
 * Counts the number of properties owned by a player
 * @param state - The current AI game state
 * @param playerIndex - The player index
 * @returns The count of owned properties
 */
export function countPlayerProperties(state: AIGameState, playerIndex: number): number {
  return state.tiles.filter((tile) => tile.ownerIndex === playerIndex && isProperty(tile)).length;
}

/**
 * Gets factories that don't have units on them
 * @param state - The current AI game state
 * @param playerIndex - The player index
 * @returns Array of unoccupied factory tiles
 */
export function getUnoccupiedFactories(state: AIGameState, playerIndex: number): AITile[] {
  const factories = getPlayerFactories(state, playerIndex);
  return factories.filter((factory) => !isPositionOccupied(state, factory.position));
}
