import type { UnitProperties } from "shared/match-logic/buildable-unit";
import { unitPropertiesMap } from "shared/match-logic/buildable-unit";
import { getVisualHPfromHP } from "shared/match-logic/calculate-damage/calculate-damage";
import { getNeighbourPositions, isSamePosition } from "shared/schemas/position";
import type {
  UnitWithHiddenStats,
  UnitWithVisibleStats
} from "shared/schemas/unit";
import { clamp } from "shared/utils/clamp";
import type { MatchWrapper } from "./match";
import type { PlayerInMatchWrapper } from "./player-in-match";

export class UnitWrapper {
  public player: PlayerInMatchWrapper;

  // TODO will replace this.properties() with next update for access
  // outside of this file as well because it's apparent that the tradeoff
  // between memory and lookup time is worth storing the reference in memory.
  public properties2: UnitProperties;

  constructor(
    public data: UnitWithHiddenStats | UnitWithVisibleStats,
    public match: MatchWrapper
  ) {
    this.player = match.players.getBySlotOrThrow(data.playerSlot);
    this.properties2 = unitPropertiesMap[data.type];
  }

  // add getCurrentUnitValue, for later (match stats?)

  getFuel() {
    if (this.data.stats === "hidden") {
      return this.properties2.initialFuel;
    }

    return this.data.stats.fuel;
  }

  // TODO inside the method, remove any clamping from outside
  setFuel(newFuel: number) {
    if (this.data.stats === "hidden") {
      return;
    }

    this.data.stats.fuel = newFuel;
  }

  getHP() {
    if (this.data.stats === "hidden") {
      return 100;
    }

    return this.data.stats.hp;
  }

  getVisualHP() {
    return Math.ceil(this.getHP() / 10);
  }

  damageUntil1HP(damageAmount: number) {
    if (this.data.stats === "hidden") {
      return;
    }

    this.data.stats.hp = Math.max(1, this.data.stats.hp - damageAmount);
  }

  //heal 1 visual hp = heal(10)
  heal(preciseHealAmount: number) {
    if (this.data.stats === "hidden") {
      return;
    }

    this.data.stats.hp = Math.min(this.data.stats.hp + preciseHealAmount, 99);
  }

  setHp(newPreciseHp: number) {
    if (this.data.stats === "hidden") {
      return;
    }

    this.data.stats.hp = clamp(newPreciseHp, 0, 99);
  }

  drainFuel(fuelAmount: number) {
    if (this.data.stats === "hidden") {
      return;
    }

    this.data.stats.fuel = Math.max(fuelAmount, 0);
  }

  getNeighbouringUnits() {
    const neighbourPositions = getNeighbourPositions(this.data.position);

    return this.match.units.data.filter((u) =>
      neighbourPositions.some((p) => isSamePosition(u.data.position, p))
    );
  }

  // TODO rename to `getTile`, the `OrThrow` suffix is from old code
  // that had versions with and without throwing. `tile` is now never undefined.
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
    const { moveRange, initialFuel } = this.properties2;

    const movementRangeHook = this.player.getHook("movementRange");
    const modifiedMovement = movementRangeHook?.(moveRange, this) ?? moveRange;

    const fuel =
      this.data.stats === "hidden" ? initialFuel : this.data.stats.fuel;

    return Math.min(modifiedMovement, fuel);
  }

  getCost(): number {
    const { cost: baseCost } = this.properties2;
    const hook = this.player.getHook("buildCost");
    return hook?.(baseCost, this.match) ?? baseCost;
  }

  getPowerMeterGainsWhenAttacking(
    defender: UnitWrapper,
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
      isSamePosition(u.data.position, this.data.position)
    );

    const tile = this.getTileOrThrow();

    // TODO remove this and if applicable modify current CapturableTile HP
    if ("captureHP" in tile) {
      tile.captureHP = 20;
    }

    /* TODO check if player is eliminated, then create and send appropriate event */
  }

  // TODO remove this method from the CO files. not doing it right now to reduce changes at once.
  properties() {
    return this.properties2;
  }

  isIndirect() {
    if (!("attackRange" in this.properties2)) {
      return false;
    }

    return this.properties2.attackRange[1] > 1;
  }

  /**
   * returning `null` means this unit doesn't use ammo
   */
  getAmmo() {
    if (this.data.stats === "hidden") {
      return "initialAmmo" in this.properties2
        ? this.properties2.initialAmmo
        : null;
    }

    if (!("ammo" in this.data.stats)) {
      return null;
    }

    return this.data.stats.ammo;
  }

  // TODO inside the method, remove any clamping from outside
  setAmmo(newAmmo: number) {
    if (this.data.stats === "hidden" || !("ammo" in this.data.stats)) {
      return;
    }

    this.data.stats.ammo = newAmmo;
  }

  resupply() {
    const properties = this.properties();

    this.setFuel(properties.initialFuel);

    if ("initialAmmo" in properties) {
      this.setAmmo(properties.initialAmmo);
    }
  }

  /**
   * this method doesn't narrow the type of `unit`,
   * which is why sometimes `unit.data.type` must be used.
   * this could be fixed at some point by making `UnitWrapper` generic.
   */
  isInfantryOrMech() {
    return this.data.type === "infantry" || this.data.type === "mech";
  }
}
