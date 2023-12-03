import { getVisualHPfromHP } from "shared/match-logic/calculate-damage";
import type { UnitWrapper } from "shared/wrappers/unit";

export function propertyRepairAndResupply(unit: UnitWrapper) {
  const tile = unit.getTile();
  const { player } = unit

  if (!player.owns(tile)) {
    return;
  }

  const isInRepairFacility =
    unit.properties.facility === tile.type ||
    (unit.properties.facility === "base" &&
      (tile.type === "city" || tile.type === "hq"));

  if (!isInRepairFacility) {
    return;
  }

  unit.resupply();

  // rachel d2d repairs +1
  const maximumRepairAmount = player.data.coId.name === "rachel" ? 3 : 2;

  //heal for free if visual hp is 10
  if (getVisualHPfromHP(unit.getVisualHP()) === 10) {
    unit.heal(10 * maximumRepairAmount);
    return;
  }

  const oneHpRepairCost = unit.getBuildCost() / 10;

  const visualHpRepairPossible = Math.max(
    maximumRepairAmount,
    Math.floor(player.data.funds / oneHpRepairCost)
  );

  unit.heal(10 * visualHpRepairPossible);
  player.data.funds -= oneHpRepairCost * visualHpRepairPossible;
}
