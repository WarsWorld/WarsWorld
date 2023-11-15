import { PlayerSlot } from "server/schemas/player-slot";
import { Position, isSamePosition } from "server/schemas/position";
import { WWUnit } from "server/schemas/unit";
import { getDistance } from "shared/match-logic/positions";

export class UnitsWrapper {
  constructor(public data: WWUnit[]) {}

  getUnit(position: Position) {
    return this.data.find((u) => isSamePosition(u.position, position));
  }

  getUnitOrThrow(position: Position) {
    const unit = this.getUnit(position);

    if (unit === undefined) {
      throw new Error(`No unit found at ${JSON.stringify(position)}`);
    }

    return unit;
  }

  hasUnit(position: Position) {
    return this.getUnit(position) !== undefined;
  }

  removeUnit(unit: WWUnit) {
    this.data = this.data.filter(
      (u) => !isSamePosition(u.position, unit.position)
    );
  }

  getPlayerUnits(playerSlot: PlayerSlot) {
    return new UnitsWrapper(
      this.data.filter((u) => u.playerSlot === playerSlot)
    );
  }

  /**
   * TODO will currently affect allies!
   */
  getEnemyUnits(playerSlot: PlayerSlot) {
    return new UnitsWrapper(
      this.data.filter((u) => u.playerSlot !== playerSlot)
    );
  }

  healAll(healingAmount: number) {
    this.data.forEach((unit) => {
      unit.stats.hp = Math.min(100, unit.stats.hp + healingAmount);
    });
  }

  private damageUntil1HP(unit: WWUnit, damageAmount: number) {
    unit.stats.hp = Math.max(1, unit.stats.hp - damageAmount);
  }

  damageAllUntil1HP(damageAmount: number) {
    this.data.forEach((unit) => {
      this.damageUntil1HP(unit, damageAmount);
    });
  }

  damageUntil1HPInRadius({
    radius,
    damageAmount,
    epicenter,
  }: {
    radius: number;
    damageAmount: number;
    epicenter: Position;
  }) {
    this.data
      .filter((unit) => getDistance(unit.position, epicenter) <= radius)
      .forEach((unit) => {
        this.damageUntil1HP(unit, damageAmount);
      });
  }

  addUnit(unit: WWUnit) {
    this.data.push(unit);
  }
}
