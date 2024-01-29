import { getVisualHPfromHP } from "shared/match-logic/calculate-damage";
import type { UnitWrapper } from "shared/wrappers/unit";

export function propertyRepairAndResupply(unit: UnitWrapper) {
  const { player } = unit;

  unit.resupply();

  // rachel d2d repairs +1
  const maxHeal = player.data.coId.name === "rachel" ? 3 : 2;
  const oneHpRepairCost = unit.getBuildCost() / 10;

  // if unit visual hp is 10, it will heal to full for free (see unit.heal impl)
  const hpHealed = Math.min(
    maxHeal,
    Math.floor(player.data.funds / oneHpRepairCost),
    10 - unit.getVisualHP(),
  );

  player.data.funds -= hpHealed * oneHpRepairCost;
  unit.heal(hpHealed);
}
