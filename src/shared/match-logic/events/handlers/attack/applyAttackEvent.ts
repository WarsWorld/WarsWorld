import { getVisualHPfromHP } from "shared/match-logic/calculate-damage";
import type { Position } from "shared/schemas/position";
import type { AttackEvent, EmittableAttackEvent } from "shared/types/events";
import type { MatchWrapper } from "shared/wrappers/match";
import { canAttackWithPrimary } from "./canAttackWithPrimary";
import { getPowerChargeGain } from "./getPowerChargeGain";
import { applySashaFundsDamage, handleSashaScopFunds } from "./handleSashaScopFunds";

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

export const applyEmittableAttackEvent = (match: MatchWrapper, event: EmittableAttackEvent) => {
  if (event.attacker) {
    //power charge
    if (event.attacker.powerChargeGained != null) {
      const player = match.getPlayerBySlot(event.attacker.playerSlot);
      player?.gainPowerCharge(event.attacker.powerChargeGained);
    }

    if (event.attacker.position) {
      const attackerUnit = match.getUnitOrThrow(event.attacker.position);

      //HP change
      if (event.attacker.HP != null) {
        if (event.attacker.HP === 0) {
          attackerUnit.remove();
        } else {
          attackerUnit.setHp(event.attacker.HP);
        }
      }

      //ammo consumption (if usedAmmo is true)
      if (event.attacker.usedAmmo ?? false) {
        attackerUnit.useOneAmmo();
      }
    }

    //special case for Sasha SCOP (damage taken in funds for money)
    if (event.attacker.damageTakenInFunds != null && event.defender) {
      const defendingPlayer = match.getPlayerBySlot(event.defender.playerSlot);

      if (defendingPlayer) {
        //^ should always be true
        applySashaFundsDamage(defendingPlayer, event.attacker.damageTakenInFunds);
      }
    }
  }

  if (event.defender) {
    //power charge
    if (event.defender.powerChargeGained != null) {
      const player = match.getPlayerBySlot(event.defender.playerSlot);
      player?.gainPowerCharge(event.defender.powerChargeGained);
    }

    if (event.defender.position) {
      const defenderUnit = match.getUnit(event.defender.position);

      if (defenderUnit === undefined) {
        //pipe seam
        const pipeTile = match.getTile(event.defender.position);

        if (pipeTile.type !== "pipeSeam") {
          throw new Error("Received pipe seam attack event, but no pipe seam was found");
        }

        if (event.defender.HP != null) {
          //^ should always be true
          pipeTile.hp = event.defender.HP;
        }
      } else {
        //HP change
        if (event.defender.HP != null) {
          if (event.defender.HP === 0) {
            defenderUnit.remove();
          } else {
            defenderUnit.setHp(event.defender.HP);
          }
        }

        //ammo consumption (if usedAmmo is true)
        if (event.defender.usedAmmo ?? false) {
          defenderUnit.useOneAmmo();
        }
      }
    }

    //special case for Sasha SCOP (damage taken in funds for money)
    if (event.defender.damageTakenInFunds != null && event.attacker) {
      const attackingPlayer = match.getPlayerBySlot(event.attacker.playerSlot);

      if (attackingPlayer) {
        //^ should always be true
        applySashaFundsDamage(attackingPlayer, event.defender.damageTakenInFunds);
      }
    }
  }
};
