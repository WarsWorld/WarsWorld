import type { UnitType } from "shared/schemas/unit";
import type { UnitWrapper } from "shared/wrappers/unit";

/**
 * Returns if unit is going to attack enemy unit with primary weapon or not
 */
export const canAttackWithPrimary = (
  attacker: UnitWrapper,
  defender: UnitType | "pipe-seam",
): boolean => {
  if (attacker.getAmmo() === 0 || attacker.getAmmo() === null) {
    return false;
  }

  const defenderType: UnitType = defender === "pipe-seam" ? "mediumTank" : defender;

  return (
    attacker.player.getVersionProperties().damageChart[attacker.data.type]?.primary?.[
      defenderType
    ] !== undefined
  );
};
