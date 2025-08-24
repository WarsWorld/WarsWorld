import type { AIGameState, AIPosition, AIUnit } from "../types";
import { isSamePosition } from "../types";
import { UnitPropertiesAdapter } from "./game-constants-adapter";

/**
 * Gets a unit by its ID
 * @param state - The current AI game state
 * @param unitId - The unit ID (format: "x,y")
 * @returns The unit or undefined
 */
export function getUnitById(state: AIGameState, unitId: string): AIUnit | undefined {
  return state.units.find((unit) => {
    const unitKey = `${unit.position[0]},${unit.position[1]}`;
    return unitKey === unitId;
  });
}

/**
 * Gets the unit at a specific position
 * @param state - The current AI game state
 * @param position - The position to check
 * @returns The unit at that position or undefined
 */
export function getUnitAt(state: AIGameState, position: AIPosition): AIUnit | undefined {
  return state.units.find((unit) => isSamePosition(unit.position, position));
}

/**
 * Gets all units owned by a player
 * @param state - The current AI game state
 * @param playerIndex - The player index
 * @returns Array of units owned by the player
 */
export function getPlayerUnits(state: AIGameState, playerIndex: number): AIUnit[] {
  return state.units.filter((unit) => unit.playerIndex === playerIndex);
}

/**
 * Gets all enemy units
 * @param state - The current AI game state
 * @param playerIndex - The current player index
 * @returns Array of enemy units
 */
export function getEnemyUnits(state: AIGameState, playerIndex: number): AIUnit[] {
  return state.units.filter((unit) => unit.playerIndex !== playerIndex);
}

/**
 * Checks if a unit can capture properties
 * @param unitType - The type of unit
 * @returns True if unit can capture (infantry, mech)
 */
export function canCapture(unitType: string): boolean {
  return UnitPropertiesAdapter.canCapture(unitType);
}

/**
 * Gets the cost of a unit type
 * @param unitType - The type of unit
 * @returns Cost in funds
 */
export function getUnitCost(unitType: string): number {
  return UnitPropertiesAdapter.getCost(unitType);
}

/**
 * Gets the movement range of a unit type
 * @param unitType - The type of unit
 * @returns Movement points
 */
export function getUnitMovementPoints(unitType: string): number {
  return UnitPropertiesAdapter.getMovementPoints(unitType);
}

/**
 * Gets the attack range of a unit type
 * @param unitType - The type of unit
 * @returns [min, max] range or null if no weapon
 */
export function getUnitAttackRange(unitType: string): [number, number] | null {
  return UnitPropertiesAdapter.getAttackRange(unitType);
}

/**
 * Checks if a unit is ready to act
 * @param unit - The unit to check
 * @returns True if the unit can act this turn
 */
export function isUnitReady(unit: AIUnit): boolean {
  return unit.isReady;
}

/**
 * Gets the vision range of a unit type
 * @param unitType - The type of unit
 * @returns Vision range in tiles
 */
export function getUnitVisionRange(unitType: string): number {
  return UnitPropertiesAdapter.getVision(unitType);
}

/**
 * Checks if a unit type is indirect (artillery, rockets, etc.)
 * @param unitType - The type of unit
 * @returns True if unit has indirect fire
 */
export function isIndirectUnit(unitType: string): boolean {
  return UnitPropertiesAdapter.isIndirect(unitType);
}

/**
 * Gets ready units of a specific type owned by a player
 * @param state - The current AI game state
 * @param playerIndex - The player index
 * @param unitType - The type of unit to filter by
 * @returns Array of ready units of the specified type
 */
export function getReadyUnitsOfType(
  state: AIGameState,
  playerIndex: number,
  unitType: string,
): AIUnit[] {
  return state.units.filter(
    (unit) => unit.playerIndex === playerIndex && unit.type === unitType && unit.isReady,
  );
}

/**
 * Gets all ready units owned by a player
 * @param state - The current AI game state
 * @param playerIndex - The player index
 * @returns Array of ready units
 */
export function getReadyUnits(state: AIGameState, playerIndex: number): AIUnit[] {
  return state.units.filter((unit) => unit.playerIndex === playerIndex && unit.isReady);
}

/**
 * Checks if a unit has enough fuel to move
 * @param unit - The unit to check
 * @returns True if the unit has fuel
 */
export function hasFuel(unit: AIUnit): boolean {
  return unit.fuel > 0;
}

/**
 * Checks if a unit has ammo (for units with weapons)
 * @param unit - The unit to check
 * @returns True if unit has ammo or doesn't need ammo
 */
export function hasAmmo(unit: AIUnit): boolean {
  if (unit.ammo === undefined) {
    // Unit doesn't use ammo (like infantry) or has no weapon
    return UnitPropertiesAdapter.hasWeapon(unit.type);
  }

  return unit.ammo > 0;
}

/**
 * Gets the effective movement points for a unit (considering fuel)
 * @param unit - The unit to check
 * @returns The actual movement points available
 */
export function getEffectiveMovementPoints(unit: AIUnit): number {
  const baseMovement = getUnitMovementPoints(unit.type);
  return Math.min(baseMovement, unit.fuel);
}

/**
 * Checks if a unit is a transport (can carry other units)
 * @param unitType - The type of unit
 * @returns True if unit can transport others
 */
export function isTransport(unitType: string): boolean {
  const transportTypes = ["apc", "lander", "tcopter", "blackboat", "cruiser"];
  return transportTypes.includes(unitType.toLowerCase());
}

/**
 * Gets units that are loaded in a transport
 * @param state - The current AI game state
 * @param transportUnit - The transport unit
 * @returns Array of unit IDs that are loaded
 */
export function getLoadedUnits(state: AIGameState, transportUnit: AIUnit): string[] {
  return transportUnit.loadedUnits ?? [];
}

/**
 * Counts the total unit value for a player
 * @param state - The current AI game state
 * @param playerIndex - The player index
 * @returns Total value of all units
 */
export function calculateTotalUnitValue(state: AIGameState, playerIndex: number): number {
  const playerUnits = getPlayerUnits(state, playerIndex);
  return playerUnits.reduce((total, unit) => {
    const unitCost = getUnitCost(unit.type);
    // Adjust value based on HP (assuming 100 HP is full health)
    const hpRatio = unit.hp / 100;
    return total + unitCost * hpRatio;
  }, 0);
}

/**
 * Gets the closest enemy unit to a position
 * @param state - The current AI game state
 * @param position - The reference position
 * @param playerIndex - The current player index
 * @returns The closest enemy unit or undefined
 */
export function getClosestEnemyUnit(
  state: AIGameState,
  position: AIPosition,
  playerIndex: number,
): AIUnit | undefined {
  const enemyUnits = getEnemyUnits(state, playerIndex);

  if (enemyUnits.length === 0) {
    return undefined;
  }

  let closestUnit: AIUnit | undefined;
  let minDistance = Infinity;

  for (const enemy of enemyUnits) {
    const distance =
      Math.abs(enemy.position[0] - position[0]) + Math.abs(enemy.position[1] - position[1]);

    if (distance < minDistance) {
      minDistance = distance;
      closestUnit = enemy;
    }
  }

  return closestUnit;
}
