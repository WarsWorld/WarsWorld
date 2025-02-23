import type { UnitWrapper } from "shared/wrappers/unit";

export const handleSashaScopFunds = (
  attacker: UnitWrapper,
  defender: UnitWrapper,
  attackerHpDiff: number,
  defenderHpDiff: number,
) => {
  if (
    attacker.player.data.coId.name === "sasha" &&
    attacker.player.data.COPowerState === "super-co-power"
  ) {
    attacker.player.data.funds += ((defenderHpDiff * defender.getBuildCost()) / 10) * 0.5;
  }

  if (
    defender.player.data.coId.name === "sasha" &&
    defender.player.data.COPowerState === "super-co-power"
  ) {
    defender.player.data.funds += ((attackerHpDiff * attacker.getBuildCost()) / 10) * 0.5;
  }
};
