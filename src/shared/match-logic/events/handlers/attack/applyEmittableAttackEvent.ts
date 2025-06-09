import type { Position } from "shared/schemas/position";
import type { EmittableAttackEvent } from "shared/types/events";
import type { MatchWrapper } from "shared/wrappers/match";
import { applyPlayerUpdate } from "../apply-player-update";

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

  if (event.attacker) {
    if (event.attacker.position !== undefined) {
      const attacker = match.getUnitOrThrow(event.attacker.position);

      //update ammo
      if (event.attacker.usedAmmo === true) {
        attacker.useOneAmmo();
      }

      //update hp + destroy if dead
      updateHPorDestroy(match, event.attacker.HP, event.attacker.position);
    }

    const attackerPlayer = match.getPlayerBySlot(event.attacker.playerSlot);

    if (attackerPlayer === undefined) {
      throw new Error("invalid attacker player slot received");
    }

    //update power charge
    if (event.attacker.powerChargeGained !== undefined) {
      attackerPlayer.gainPowerCharge(event.attacker.powerChargeGained);
    }

    //update funds if using sasha scop
    if (
      attackerPlayer.isUsingPower("super-co-power", "sasha") &&
      event.defender?.damageDealtInFunds !== undefined
    ) {
      attackerPlayer.data.funds += event.defender.damageDealtInFunds * 0.5;
    }
  }

  if (event.defender) {
    if (event.defender.position !== undefined) {
      const defender = match.getUnit(event.defender.position);

      //update ammo (check defender is a unit and not pipe seam as well)
      if (defender !== undefined && event.defender.usedAmmo === true) {
        defender.useOneAmmo();
      }

      //update hp + destroy if dead
      updateHPorDestroy(match, event.defender.HP, event.defender.position);
    }

    const defenderPlayer = match.getPlayerBySlot(event.defender.playerSlot);

    if (defenderPlayer === undefined) {
      throw new Error("invalid defender player slot received");
    }

    //update power charge
    if (event.defender.powerChargeGained !== undefined) {
      defenderPlayer.gainPowerCharge(event.defender.powerChargeGained);
    }

    //update funds if using sasha scop
    if (
      defenderPlayer.isUsingPower("super-co-power", "sasha") &&
      event.attacker?.damageDealtInFunds !== undefined
    ) {
      defenderPlayer.data.funds += event.attacker.damageDealtInFunds * 0.5;
    }
  }
};
