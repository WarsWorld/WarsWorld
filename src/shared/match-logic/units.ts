import { WWUnit, UnitType } from "server/schemas/unit";
import { unitPropertiesMap } from "./buildable-unit";
import { BackendMatchState } from "shared/types/server-match-state";
import { PlayerSlot } from "server/schemas/player-slot";

export const isIndirectAttackUnit = (unitType: UnitType) => {
  const unitProperties = unitPropertiesMap[unitType];

  if (!("attackRange" in unitProperties)) {
    return false;
  }

  return unitProperties.attackRange[1] > 1;
};

export const isDirectAttackUnit = (unitType: UnitType) => {
  const unitProperties = unitPropertiesMap[unitType];

  if (!("attackRange" in unitProperties)) {
    return false;
  }

  return unitProperties.attackRange[1] === 1;
};

export const healUnit = (unit: WWUnit, healingAmount: number) => {
  unit.stats.hp = Math.min(100, unit.stats.hp + healingAmount);
};

export const damageUnitUntil1HP = (unit: WWUnit, damageAmount: number) => {
  unit.stats.hp = Math.max(1, unit.stats.hp - damageAmount);
};

export const getPlayerUnits = (
  matchState: BackendMatchState,
  playerSlot: PlayerSlot
) => matchState.units.filter((u) => u.playerSlot === playerSlot);

// TODO will currently affect allies!
export const getEnemyUnits = (
  matchState: BackendMatchState,
  playerSlot: PlayerSlot
) => matchState.units.filter((u) => u.playerSlot !== playerSlot);
