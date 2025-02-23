import type { UnitWrapper } from "shared/wrappers/unit";

export const getPowerChargeGain = (
  attacker: UnitWrapper,
  attackerHpDiff: number,
  defender: UnitWrapper,
  defenderHpDiff: number,
) => {
  //power meter charge
  const attackerVP = attacker.player.getVersionProperties();
  const defenderVP = defender.player.getVersionProperties();

  return {
    attackerPowerCharge:
      attackerVP.powerMeterIncreasePerHP(attacker) * attackerHpDiff +
      attackerVP.powerMeterIncreasePerHP(defender) *
        defenderHpDiff *
        attackerVP.offensivePowerGenMult,
    defenderPowerCharge:
      defenderVP.powerMeterIncreasePerHP(defender) * defenderHpDiff +
      defenderVP.powerMeterIncreasePerHP(attacker) *
        attackerHpDiff *
        defenderVP.offensivePowerGenMult,
  };
};
