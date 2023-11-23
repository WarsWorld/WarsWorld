import { unitPropertiesMap } from "shared/match-logic/buildable-unit";
import { getVisualHPfromHP } from "shared/match-logic/calculate-damage/calculate-damage";
import { getDistance } from "shared/match-logic/positions";
import { isHiddenTile } from "shared/match-logic/terrain";
import { getNeighbourPositions, isSamePosition, type Position } from "shared/schemas/position";
import type { WWUnit } from "shared/schemas/unit";
import type { MatchWrapper } from "./match";
import type { PlayerInMatchWrapper } from "./player-in-match";

export class UnitWrapper {
  public player: PlayerInMatchWrapper;

  constructor(public data: WWUnit, public match: MatchWrapper) {
    this.player = match.players.getBySlotOrThrow(data.playerSlot);
  }

  damageUntil1HP(damageAmount: number) {
    this.data.stats.hp = Math.max(1, this.data.stats.hp - damageAmount);
  }

  getDistance(position: Position) {
    return getDistance(this.data.position, position);
  }

  isAtPosition(position: Position) {
    return isSamePosition(this.data.position, position);
  }

  getNeighbouringUnits() {
    const neighbourPositions = getNeighbourPositions(this.data.position);

    return this.match.units.data.filter((u) => neighbourPositions.some((p) => u.isAtPosition(p)));
  }

  /** sub, stealth */
  isHiddenThroughHiddenProperty() {
    return "hidden" in this.data && this.data.hidden;
  }

  isOnHiddenTile() {
    return isHiddenTile(this.getTileOrThrow());
  }

  getTileOrThrow() {
    const tile = this.match.getTile(this.data.position);

    if (tile === undefined) {
      throw new Error(`Could not get tile at ${JSON.stringify(this.data.position)}`);
    }

    return tile;
  }

  /** TODO checking fuel twice? */
  getMovementPoints() {
    const unitProperties = unitPropertiesMap[this.data.type];
    const baseMovement = unitProperties.moveRange;

    const modifiedMovement = this.player.getHook("movementRange")?.(baseMovement, this);

    return Math.min(modifiedMovement ?? baseMovement, this.data.stats.fuel);
  }

  getCost(): number {
    const { cost: baseCost } = unitPropertiesMap[this.data.type];
    const modifiedCost = this.player.getHook("buildCost")?.(baseCost, this.match);

    return modifiedCost ?? baseCost;
  }

  getPowerMeterChangesWhenAttacking(defender: this, attackerHPAfterAttack: number | undefined, defenderHPAfterAttack: number) {
    const previousAttackerHP = this.data.stats.hp;
    const previousDefenderHP = defender.data.stats.hp;

    const attackerUnitCost = this.getCost();
    const defenderUnitCost = defender.getCost();

    const lostAttackerVisualHP = getVisualHPfromHP(previousAttackerHP) - getVisualHPfromHP(attackerHPAfterAttack ?? previousAttackerHP);

    const lostDefenderVisualHP = getVisualHPfromHP(previousDefenderHP) - getVisualHPfromHP(defenderHPAfterAttack);

    return {
      attackingPlayerGain: lostAttackerVisualHP * attackerUnitCost + lostDefenderVisualHP * defenderUnitCost * 0.5,
      defendingPlayerGain: lostDefenderVisualHP * defenderUnitCost + lostAttackerVisualHP * attackerUnitCost * 0.5
    };
  }

  remove() {
    this.match.units.data = this.match.units.data.filter((u) => u.isAtPosition(this.data.position));

    /* TODO check if player is eliminated, then create and send appropriate event */
  }

  properties() {
    return unitPropertiesMap[this.data.type];
  }

  isIndirect() {
    const unitProperties = this.properties();

    if (!("attackRange" in unitProperties)) {
      return false;
    }

    return unitProperties.attackRange[1] > 1;
  }
}
