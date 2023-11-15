import { PlayerSlot } from "server/schemas/player-slot";
import { Position, isSamePosition } from "server/schemas/position";
import { WWUnit } from "server/schemas/unit";

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

  damageAllUntil1HP(damageAmount: number) {
    this.data.forEach((unit) => {
      unit.stats.hp = Math.max(1, unit.stats.hp - damageAmount);
    });
  }

  addUnit(unit: WWUnit) {
    this.data.push(unit);
  }
}
