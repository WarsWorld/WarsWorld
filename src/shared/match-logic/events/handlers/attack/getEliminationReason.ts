import type { AttackEvent } from "shared/types/events";
import type { PlayerInMatchWrapper } from "shared/wrappers/player-in-match";

export function getEliminationReason({
  attacker,
  defender,
  attackerHP,
  defenderHP,
}: {
  attacker: PlayerInMatchWrapper;
  defender: PlayerInMatchWrapper;
  attackerHP: number | undefined;
  defenderHP: number | undefined;
}): AttackEvent["eliminationReason"] {
  if (defenderHP === 0 && defender.getUnits().length - 1 <= 0) {
    return "all-defender-units-destroyed";
  }

  if (attackerHP === 0 && attacker.getUnits().length - 1 <= 0) {
    return "all-attacker-units-destroyed";
  }

  return undefined;
}
