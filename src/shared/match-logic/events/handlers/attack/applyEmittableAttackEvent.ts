import type { Position } from "shared/schemas/position";
import type { EmittableAttackEvent } from "shared/types/events";
import type { MatchWrapper } from "shared/wrappers/match";
import { applyPlayerUpdate } from "../apply-player-update";
import { canAttackWithPrimary } from "./canAttackWithPrimary";

const updateHPorDestroy = (match: MatchWrapper, hp: number | undefined, position?: Position) => {
  if (position !== undefined) {
    const defender = match.getUnitOrThrow(position);

    if (hp === 0) {
      defender.remove();
    } else if (hp !== undefined) {
      defender.setHp(hp);
    }
  }
};

export const applyEmittableAttackEvent = (match: MatchWrapper, event: EmittableAttackEvent) => {
  applyPlayerUpdate(match, event.playerUpdate);

  // i don't think there can be any situation where only attacker OR defender is visible
  // AND the units ammo is also visible. if there is, fml.
  if (event.attackerPosition !== undefined && event.defenderPosition !== undefined) {
    const attacker = match.getUnitOrThrow(event.attackerPosition);
    const defender = match.getUnitOrThrow(event.defenderPosition);

    if (canAttackWithPrimary(attacker, defender)) {
      attacker.useOneAmmo();
    }

    if (event.attackerHP !== undefined && canAttackWithPrimary(defender, attacker)) {
      defender.useOneAmmo();
    }
  }

  updateHPorDestroy(match, event.attackerHP, event.attackerPosition);
  updateHPorDestroy(match, event.defenderHP, event.defenderPosition);
};
