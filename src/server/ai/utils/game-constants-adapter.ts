import { unitPropertiesMap } from "shared/match-logic/game-constants/unit-properties";
import { getTerrainDefenseStars } from "shared/match-logic/game-constants/terrain-properties";
import { getBaseMovementCost } from "shared/match-logic/movement-cost";
import type { MovementType } from "shared/match-logic/game-constants/unit-properties";
import type { TileType } from "shared/schemas/tile";
import type { Weather } from "shared/schemas/weather";
import type { GameVersion } from "shared/schemas/game-version";
import type { AIWeather } from "../types";

/**
 * Adapter for unit properties - provides type-safe access to unit constants
 */
export class UnitPropertiesAdapter {
  static getCost(unitType: string): number {
    const props = unitPropertiesMap[unitType as keyof typeof unitPropertiesMap];
    return props?.cost ?? 0;
  }

  static getMovementPoints(unitType: string): number {
    const props = unitPropertiesMap[unitType as keyof typeof unitPropertiesMap];
    return props?.movementPoints ?? 0;
  }

  static getMovementType(unitType: string): string | null {
    const props = unitPropertiesMap[unitType as keyof typeof unitPropertiesMap];
    return props?.movementType ?? null;
  }

  static getVision(unitType: string): number {
    const props = unitPropertiesMap[unitType as keyof typeof unitPropertiesMap];
    return props?.vision ?? 0;
  }

  static getAttackRange(unitType: string): [number, number] | null {
    const props = unitPropertiesMap[unitType as keyof typeof unitPropertiesMap];

    if (props && "attackRange" in props) {
      return props.attackRange;
    }

    return null;
  }

  static getFacility(unitType: string): string | null {
    const props = unitPropertiesMap[unitType as keyof typeof unitPropertiesMap];
    return props?.facility ?? null;
  }

  static hasWeapon(unitType: string): boolean {
    const props = unitPropertiesMap[unitType as keyof typeof unitPropertiesMap];
    return props !== undefined && "attackRange" in props;
  }

  static canCapture(unitType: string): boolean {
    // Only infantry and mech can capture
    return unitType === "infantry" || unitType === "mech";
  }

  static isIndirect(unitType: string): boolean {
    const range = this.getAttackRange(unitType);
    return range !== null && range[0] > 1;
  }

  static getInitialFuel(unitType: string): number {
    const props = unitPropertiesMap[unitType as keyof typeof unitPropertiesMap];
    return props?.initialFuel ?? 0;
  }

  static getInitialAmmo(unitType: string): number | null {
    const props = unitPropertiesMap[unitType as keyof typeof unitPropertiesMap];

    if (props && "initialAmmo" in props) {
      return props.initialAmmo;
    }

    return null;
  }
}

/**
 * Adapter for terrain properties
 */
export class TerrainPropertiesAdapter {
  static getDefenseStars(tileType: string): number {
    return getTerrainDefenseStars(tileType as TileType);
  }

  static getMovementCost(
    movementType: string,
    tileType: string,
    weather: AIWeather | undefined,
    gameVersion = "AW2",
  ): number | null {
    const weatherType: Weather = weather?.type ?? "clear";
    return getBaseMovementCost(
      movementType as MovementType,
      weatherType,
      tileType as TileType,
      gameVersion as GameVersion,
    );
  }

  static isImpassable(movementType: string, tileType: string, weather?: AIWeather): boolean {
    return this.getMovementCost(movementType, tileType, weather) === null;
  }
}

/**
 * Helper to get all unit types
 */
export function getAllUnitTypes(): string[] {
  return Object.keys(unitPropertiesMap);
}

/**
 * Helper to check if a tile type can produce units
 */
export function isProductionFacility(tileType: string): boolean {
  return tileType === "base" || tileType === "airport" || tileType === "port";
}

/**
 * Helper to get the facility type that produces a unit
 */
export function getUnitProductionFacility(unitType: string): string | null {
  return UnitPropertiesAdapter.getFacility(unitType);
}
