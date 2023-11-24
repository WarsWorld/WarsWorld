import { unitPropertiesMap } from "shared/match-logic/buildable-unit";
import { getVisualHPfromHP } from "shared/match-logic/calculate-damage/calculate-damage";
import { getDistance } from "shared/match-logic/positions";
import { isHiddenTile } from "shared/match-logic/terrain";
import {
  getNeighbourPositions,
  isSamePosition,
  type Position
} from "shared/schemas/position";
import type {
  UnitWithHiddenStats,
  UnitWithVisibleStats
} from "shared/schemas/unit";
import type { StatsKey } from "shared/schemas/unit-traits";
import type { MatchWrapper } from "./match";
import type { PlayerInMatchWrapper } from "./player-in-match";

export class UnitWrapper {
  public player: PlayerInMatchWrapper;

  constructor(
    public data: UnitWithHiddenStats | UnitWithVisibleStats,
    public match: MatchWrapper
  ) {
    this.player = match.players.getBySlotOrThrow(data.playerSlot);
  }

  /**
   * for handling hidden units on the frontend like sonja.
   * i wrote `StatsKey` which includes `ammo`, hopefully not gonna hurt anywhere
   * but it will enable you to check ammo of transports for example.
   * theoretically this could be handled more elegantly by making UnitWrapper
   * into a generic class.
   */
  getStat(key: StatsKey): number {
    if (this.data.stats === "hidden") {
      const properties = this.properties();

      switch (key) {
        case "ammo":
          return "initialAmmo" in properties ? properties.initialAmmo : 0;
        case "fuel":
          return properties.initialFuel;
        case "hp":
          return 100;
      }
    }

    if (key in this.data.stats) {
      return this.data.stats[key as keyof typeof this.data.stats]; // TS / Zod weirdness
    }

    return 0;
  }

  fuel() {
    return this.getStat("fuel");
  }

  setFuel(newFuel: number) {
    if (this.data.stats === "hidden") {
      return;
    }

    this.data.stats.fuel = newFuel;
  }

  hp() {
    return this.getStat("hp");
  }

  visualHP() {
    return getVisualHPfromHP(this.hp());
  }

  setStat(key: StatsKey, value: number) {
    if (this.data.stats === "hidden" || !(key in this.data.stats)) {
      return;
    }

    this.data.stats[key as keyof typeof this.data.stats] = value;
  }

  damageUntil1HP(damageAmount: number) {
    if (this.data.stats === "hidden") {
      return;
    }

    this.data.stats.hp = Math.max(1, this.data.stats.hp - damageAmount);
  }

  heal(visualHealAmount: number) {
    if (this.data.stats === "hidden") {
      return;
    }

    this.data.stats.hp = Math.min(visualHealAmount * 10, 100); // TODO is max 99 or 100?
  }

  setHp(newPreciseHp: number) {
    if (this.data.stats === "hidden") {
      return;
    }

    this.data.stats.hp = newPreciseHp;
  }

  /**
   * TODO i think it's a rule that any precise damage is destructive and
   * any damage calculated "visually" like black bomb and powers etc. can never
   * destroy units. so maybe we can ditch "visual" mode here because of "damageUntil1HP".
   */
  damage(amountMode: "visual" | "precise", damageAmount: number) {
    if (this.data.stats === "hidden") {
      return;
    }

    const actualDamageAmount =
      amountMode === "visual" ? damageAmount * 10 : damageAmount;
    this.data.stats.hp = Math.max(this.data.stats.hp - actualDamageAmount, 0);
    // there is no automatic `this.remove()` here
    // because this code won't fully run on hidden-stats (sonja) units
    // so removal must be handled separately.
  }

  drainFuel(fuelAmount: number) {
    if (this.data.stats === "hidden") {
      return;
    }

    this.data.stats.fuel = Math.max(fuelAmount, 0);
  }

  refuel() {
    if (this.data.stats === "hidden") {
      return;
    }

    this.data.stats.fuel = this.properties().initialFuel;
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
    return isHiddenTile(this.getTileOrThrow());
  }

  getTileOrThrow() {
    const tile = this.match.getTile(this.data.position);

    if (tile === undefined) {
      throw new Error(
        `Could not get tile at ${JSON.stringify(this.data.position)}`
      );
    }

    return tile;
  }

  /** TODO checking fuel twice? */
  getMovementPoints() {
    const { moveRange, initialFuel } = this.properties();

    const movementRangeHook = this.player.getHook("movementRange");
    const modifiedMovement = movementRangeHook?.(moveRange, this) ?? moveRange;

    const fuel =
      this.data.stats === "hidden" ? initialFuel : this.data.stats.fuel;

    return Math.min(modifiedMovement, fuel);
  }

  getCost(): number {
    const { cost: baseCost } = this.properties();
    const hook = this.player.getHook("buildCost");
    return hook?.(baseCost, this.match) ?? baseCost;
  }

  getPowerMeterChangesWhenAttacking(
    defender: this,
    attackerHPAfterAttack: number | undefined,
    defenderHPAfterAttack: number
  ) {
    const previousAttackerHP =
      this.data.stats === "hidden" ? 100 : this.data.stats.hp;
    const previousDefenderHP =
      defender.data.stats === "hidden" ? 100 : defender.data.stats.hp;

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
        lostAttackerVisualHP * attackerUnitCost * 0.5
    };
  }

  remove() {
    this.match.units.data = this.match.units.data.filter((u) =>
      u.isAtPosition(this.data.position)
    );

    const tile = this.getTileOrThrow();

    if ("captureHP" in tile) {
      tile.captureHP = 20;
    }

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
