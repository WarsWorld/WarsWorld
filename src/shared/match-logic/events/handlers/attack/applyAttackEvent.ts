import { getVisualHPfromHP } from "shared/match-logic/calculate-damage";
import type { Position } from "shared/schemas/position";
import type { AttackEvent } from "shared/types/events";
import type { MatchWrapper } from "shared/wrappers/match";
import { canAttackWithPrimary } from "./canAttackWithPrimary";
import { getPowerChargeGain } from "./getPowerChargeGain";
import { handleSashaScopFunds } from "./handleSashaScopFunds";

export const applyAttackEvent = (match: MatchWrapper, event: AttackEvent, position: Position) => {
  const attacker = match.getUnitOrThrow(position);
  const defender = match.getUnit(event.defenderPosition);

  if (defender === undefined) {
    // pipe seam
    const pipeTile = match.getTile(event.defenderPosition);

    if (pipeTile.type !== "pipeSeam") {
      throw new Error("Received pipe seam attack event, but no pipe seam was found");
    }

    //ammo consumption
    if (canAttackWithPrimary(attacker, "pipe-seam")) {
      attacker.useOneAmmo();
    }

    // hp updates (0 means removed)
    pipeTile.hp = event.defenderHP;
    return;
  }

  //Calculate visible hp difference:
  const attackerHpDiff =
    attacker.getVisualHP() - getVisualHPfromHP(event.attackerHP ?? attacker.getVisualHP());
  const defenderHpDiff = defender.getVisualHP() - getVisualHPfromHP(event.defenderHP);

  handleSashaScopFunds(attacker, defender, attackerHpDiff, defenderHpDiff);

  //power charge
  const { attackerPowerCharge, defenderPowerCharge } = getPowerChargeGain(
    attacker,
    attackerHpDiff,
    defender,
    defenderHpDiff,
  );

  attacker.player.gainPowerCharge(attackerPowerCharge);
  defender.player.gainPowerCharge(defenderPowerCharge);

  //ammo consumption
  if (canAttackWithPrimary(attacker, defender.data.type)) {
    attacker.useOneAmmo();
  }

  if (event.attackerHP !== undefined && canAttackWithPrimary(defender, attacker.data.type)) {
    defender.useOneAmmo();
  }

  // hp updates (+ removal if unit dies)
  if (event.defenderHP === 0) {
    defender.remove();
  } else {
    defender.setHp(event.defenderHP);
  }

  if (event.attackerHP !== undefined) {
    if (event.attackerHP === 0) {
      attacker.remove();
    } else {
      attacker.setHp(event.attackerHP);
    }
  }
};
