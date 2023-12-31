import { unitPropertiesMap } from "shared/match-logic/game-constants/unit-properties";
import type { Position } from "shared/schemas/position";
import { getNeighbourPositions, isSamePosition } from "shared/schemas/position";
import type { UnitType, WWUnit } from "shared/schemas/unit";
import type { MatchWrapper } from "./match";
import type { PlayerInMatchWrapper } from "./player-in-match";
import { getBaseMovementCost } from "../match-logic/movement-cost";
import { getWeatherSpecialMovement } from "../match-logic/weather";

type ExtractUnit<T extends UnitType> = Extract<WWUnit, { type: T }>

export class UnitWrapper<
  Type extends UnitType = UnitType,
  /**
   * we need this second generic to contract `Type` to `Unit` which is the type for `this.data`.
   * without this, issues arise when trying to assign `this` to `UnitWrapper` (without generic!)
   * like a lot of utility functions do.
   */
  Unit extends ExtractUnit<Type> = ExtractUnit<Type>
> {
  public player: PlayerInMatchWrapper;

  public properties: typeof unitPropertiesMap[Type];

  constructor(
    public data: Unit,
    public match: MatchWrapper
  ) {
    const player = match.getPlayerBySlot(data.playerSlot);

    if (player === undefined) {
      throw new Error(`Could not find player by slot ${data.playerSlot}`);
    }

    this.player = player;
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

  /**
   * IMPORTANT!
   * Param is VISUAL hp, since all sources of damaging without killing
   * are "multiples of 10" (nothing does 25 damage, for example)
   */
  damageUntil1HP(visualHpAmount: number) {
    if (this.data.stats === "hidden") {
      return;
    }

    this.data.stats.hp = Math.max(1, this.data.stats.hp - visualHpAmount * 10);
  }

  /**
   * IMPORTANT!
   * Param is VISUAL hp, since all sources of healing round the up to
   * the highest "real" hp that corresponds to the resulting visual hp.
   */
  heal(visualHpAmount: number) {
    if (this.data.stats === "hidden") {
      return;
    }

    const newVisualHP = this.getVisualHP() + visualHpAmount;
    this.data.stats.hp = Math.min(10, newVisualHP) * 10;
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
      getWeatherSpecialMovement(this.player),
      this.match.getTile(position).type,
      this.match.rules.gameVersion ?? this.player.data.coId.version
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
    this.player.team.vision?.removeUnitVision(this);

    this.match.units = this.match.units.filter((u) =>
      isSamePosition(u.data.position, this.data.position)
    );
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

  isTransport(): this is UnitWrapper<"apc" | "transportCopter" | "blackBoat" | "lander"> {
    return "loadedUnit" in this.data;
  }
}
