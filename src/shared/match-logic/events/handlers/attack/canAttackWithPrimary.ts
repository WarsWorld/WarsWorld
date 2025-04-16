import type { UnitType } from "shared/schemas/unit";
import type { UnitWrapper } from "shared/wrappers/unit";

/**
 * Returns if unit is going to attack enemy unit with primary weapon or not
 */
export const canAttackWithPrimary = (
  attacker: UnitWrapper,
  defender: UnitType | UnitWrapper,
): boolean => {
  if (attacker.getAmmo() === 0 || attacker.getAmmo() === null) {
    return false;
  }

  const defenderType = typeof defender === "string" ? defender : defender.data.type;

  return (
    attacker.player.getVersionProperties().damageChart[attacker.data.type]?.primary?.[
      defenderType
    ] !== undefined
  );
};
