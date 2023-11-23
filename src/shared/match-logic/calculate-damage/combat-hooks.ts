import type { PlayerInMatchWrapper } from "shared/wrappers/player-in-match";
import type { UnitWrapper } from "shared/wrappers/unit";
import { COPropertiesMap } from "../co";
import type { CombatHook } from "../co-hooks";

function getMergedHooks(player: PlayerInMatchWrapper) {
  const COProperties = COPropertiesMap[player.data.co];

  const d2dHooks = COProperties.dayToDay?.hooks ?? {};
  const COPHooks = COProperties.powers.COPower?.hooks ?? {};
  const SCOPHooks = COProperties.powers.superCOPower?.hooks ?? {};

  switch (player.data.COPowerState) {
    case "no-power":
      return d2dHooks;
    case "co-power":
      return { ...d2dHooks, ...COPHooks };
    case "super-co-power":
      return { ...d2dHooks, ...SCOPHooks };
  }
}

export function getCombatHooks(attacker: UnitWrapper, defender: UnitWrapper) {
  const COHooks = getMergedHooks(attacker.player);

  const props: Parameters<CombatHook>[1] = {
    attacker,
    defender
  };

  const withDefaults = (hook?: CombatHook) => {
    return (val: number) => hook?.(val, props) ?? val;
  };

  return {
    onAttackModifier: withDefaults(COHooks.attack),
    onDefenseModifier: withDefaults(COHooks.defense),
    onGoodLuck: withDefaults(COHooks.goodLuck),
    onBadLuck: withDefaults(COHooks.badLuck),
    onTerrainStars: withDefaults(COHooks.terrainStars),
    onAttackRange: withDefaults(COHooks.attackRange)
  };
}
