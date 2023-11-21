import { isSamePosition, type Position } from "shared/schemas/position";
import type { UnitWrapper } from "./unit";

export class UnitsWrapper {
  constructor(public data: UnitWrapper[]) {}

  getUnit(position: Position) {
    return this.data.find((u) => isSamePosition(u.data.position, position));
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

  removeUnit(unit: UnitWrapper) {
    this.data = this.data.filter((u) => u.isAtPosition(unit.data.position));
    /* TODO check if player is eliminated, then create and send appropriate event */
  }

  healAll(healingAmount: number) {
    this.data.forEach((unit) => {
      unit.data.stats.hp = Math.min(100, unit.data.stats.hp + healingAmount);
    });
  }

  damageAllUntil1HP(damageAmount: number) {
    this.data.forEach((unit) => unit.damageUntil1HP(damageAmount));
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
      .filter((unit) => unit.getDistance(epicenter) <= radius)
      .forEach((unit) => unit.damageUntil1HP(damageAmount));
  }
}
