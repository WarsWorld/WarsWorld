import { unitPropertiesMap } from "shared/match-logic/game-constants/unit-properties";
import type { Position } from "shared/schemas/position";
import { getNeighbourPositions, isSamePosition } from "shared/schemas/position";
import type { UnitType, WWUnit } from "shared/schemas/unit";
import type { MatchWrapper } from "./match";
import type { PlayerInMatchWrapper } from "./player-in-match";
import { getBaseMovementCost } from "../match-logic/movement-cost";

export class UnitWrapper<ThisUnitType extends UnitType = UnitType> {
  public player: PlayerInMatchWrapper;

  public properties: typeof unitPropertiesMap[ThisUnitType];

  constructor(
    public data: Extract<WWUnit, { type: ThisUnitType }>,
    public match: MatchWrapper
  ) {
    this.player = match.getBySlotOrThrow(data.playerSlot);
    this.properties = unitPropertiesMap[data.type];
  }

  // FUEL AND AMMO *************************************************************
  getFuel() {
    if (this.data.stats === "hidden") {
      return this.properties.initialFuel;
    }

    return this.data.stats.fuel;
  }

  setFuel(newFuel: number) {
    if (this.data.stats === "hidden") {
      return;
    }

    this.data.stats.fuel = Math.max(0, newFuel);
  }

  drainFuel(fuelAmount: number) {
    if (this.data.stats === "hidden") {
      return;
    }

    this.setFuel(Math.max(this.data.stats.fuel - fuelAmount, 0));
  }

  /**
   * returning `null` means this unit doesn't use ammo
   */
  getAmmo() {
    if (this.data.stats === "hidden") {
      return "initialAmmo" in this.properties
        ? this.properties.initialAmmo
        : null;
    }

    if (!("ammo" in this.data.stats)) {
      return null;
    }

    return this.data.stats.ammo;
  }

  setAmmo(newAmmo: number) {
    if (this.data.stats === "hidden" || !("ammo" in this.data.stats)) {
      return;
    }

    this.data.stats.ammo = Math.max(0, newAmmo);
  }

  resupply() {
    this.setFuel(this.properties.initialFuel);

    if ("initialAmmo" in this.properties) {
      this.setAmmo(this.properties.initialAmmo);
    }
  }

  // HP ************************************************************************
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

  /**
   * heal 1 visual hp = heal(10)
   */
  heal(preciseHealAmount: number) {
    if (this.data.stats === "hidden") {
      return;
    }

    this.data.stats.hp = Math.min(this.data.stats.hp + preciseHealAmount, 100);
  }

  /**
   * Unit WILL die if hp is set to 0
   */
  setHp(newPreciseHp: number) {
    if (this.data.stats === "hidden") {
      return;
    }

    this.data.stats.hp = Math.max(0, Math.min(100, newPreciseHp));
    
    if (this.data.stats.hp === 0) {
      this.remove();
    }
  }

  // TILE AND MOVEMENT *********************************************************
  getTile() {
    const tile = this.match.getTile(this.data.position);

    if (tile === undefined) {
      throw new Error(
        `Could not get tile at ${JSON.stringify(this.data.position)}`
      );
    }

    return tile;
  }
  getNeighbouringUnits() {
    const neighbourPositions = getNeighbourPositions(this.data.position);

    return this.match.units.filter((unit) =>
      neighbourPositions.some((p) => isSamePosition(unit.data.position, p))
    );
  }

  /** TODO checking fuel twice? */
  getMovementPoints() {
    const { movementPoints, initialFuel } = this.properties;

    const movementPointsHook = this.player.getHook("movementPoints");
    const modifiedMovement = movementPointsHook?.(movementPoints, this) ?? movementPoints;

    const fuel =
      this.data.stats === "hidden" ? initialFuel : this.data.stats.fuel;

    return Math.min(modifiedMovement, fuel);
  }

  /**
   * returns the amount of movement points which must be spent to *enter* the tile
   * `null` means impassible terrain.
   */
  getMovementCost(position: Position): number | null {
    const baseMovementCost = getBaseMovementCost(
      unitPropertiesMap[this.data.type].movementType,
      this.player.getWeatherSpecialMovement(),
      this.match.getTile(position).type,
      this.match.rules.gameVersion
    );

    if (baseMovementCost === null) {
      return null;
    }

    return (
      this.player.getHook("movementCost")?.(baseMovementCost, this) ?? baseMovementCost
    );
  }

  // OTHERS ********************************************************************
  getBuildCost(): number {
    const { cost: baseCost } = this.properties;
    const hook = this.player.getHook("buildCost");
    return hook?.(baseCost, this.match) ?? baseCost;
  }

  remove() {
    this.match.units = this.match.units.filter((u) =>
      isSamePosition(u.data.position, this.data.position)
    );

    /* TODO check if player is eliminated, then create and send appropriate event */
  }

  // UNIT TYPE CHECKS **********************************************************
  isIndirect(): this is UnitWrapper<
    "artillery" | "missile" | "battleship" | "carrier" | "pipeRunner" | "rocket"
  > {
    if (!("attackRange" in this.properties)) {
      return false;
    }

    return this.properties.attackRange[1] > 1;
  }

  isInfantryOrMech(): this is UnitWrapper<"infantry" | "mech"> {
    return this.data.type === "infantry" || this.data.type === "mech";
  }
}
