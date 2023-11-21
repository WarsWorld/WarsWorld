import { unitPropertiesMap } from "shared/match-logic/buildable-unit";
import { getDistance } from "shared/match-logic/positions";
import { isHiddenTile } from "shared/match-logic/tiles";
import {
  getNeighbourPositions,
  isSamePosition,
  type Position,
} from "shared/schemas/position";
import type { WWUnit } from "shared/schemas/unit";
import type { MatchWrapper } from "./match";
import type { PlayerInMatchWrapper } from "./player-in-match";
import { getVisualHPfromHP } from "shared/match-logic/calculate-damage";

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

    return this.match.units.data.filter((u) =>
      neighbourPositions.some((p) => u.isAtPosition(p))
    );
  }

  /** sub, stealth */
  isHiddenThroughHiddenProperty() {
    return "hidden" in this.data && this.data.hidden;
  }

  isOnHiddenTile() {
    return isHiddenTile(this.match.getTileOrThrow(this.data.position));
  }

  getTileOrThrow() {
    return this.match.getTileOrThrow(this.data.position);
  }

  getMovementPoints() {
    const unitProperties = unitPropertiesMap[this.data.type];
    const baseMovement = unitProperties.moveRange;

    const movement = this.player
      .getCOHooksWithUnit(this.data.position)
      .onMovementRange(baseMovement);

    return Math.min(
      movement,
      this.data.stats.fuel
    ); /** TODO checking fuel twice? */
  }

  getCost() {
    /** TODO we really need a get-co-hooks thing that doesn't need a position! */
    const COHooks = this.player.getCOHooksWithUnit([0, 0]);
    const { cost: baseCost } = unitPropertiesMap[this.data.type];
    return COHooks.onBuildCost(baseCost);
  }

  getPowerMeterChangesWhenAttacking(
    defender: this,
    attackerHPAfterAttack: number | undefined,
    defenderHPAfterAttack: number
  ) {
    const previousAttackerHP = this.data.stats.hp;
    const previousDefenderHP = defender.data.stats.hp;

    const attackerUnitCost = this.getCost();
    const defenderUnitCost = defender.getCost();

    const lostAttackerVisualHP =
      getVisualHPfromHP(previousAttackerHP) -
      getVisualHPfromHP(attackerHPAfterAttack ?? previousAttackerHP);

    const lostDefenderVisualHP =
      getVisualHPfromHP(previousDefenderHP) -
      getVisualHPfromHP(defenderHPAfterAttack);

    return {
      attackingPlayerGain:
        lostAttackerVisualHP * attackerUnitCost +
        lostDefenderVisualHP * defenderUnitCost * 0.5,
      defendingPlayerGain:
        lostDefenderVisualHP * defenderUnitCost +
        lostAttackerVisualHP * attackerUnitCost * 0.5,
    };
  }
}
