import type { UnitType } from "server/schemas/unit";
import { unitPropertiesMap } from "./buildable-unit";

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
