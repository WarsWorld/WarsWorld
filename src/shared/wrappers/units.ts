import { isSamePosition, type Position } from "shared/schemas/position";
import type { UnitWrapper } from "./unit";
import { DispatchableError } from "shared/DispatchedError";

export class UnitsWrapper {
  constructor(public data: UnitWrapper[]) {}

  getUnit(position: Position) {
    return this.data.find((u) => isSamePosition(u.data.position, position));
  }

  getUnitOrThrow(position: Position) {
    const unit = this.getUnit(position);

    if (unit === undefined) {
      throw new DispatchableError(
        `No unit found at ${JSON.stringify(position)}`
      );
    }

    return unit;
  }

  hasUnit(position: Position) {
    return this.getUnit(position) !== undefined;
  }

  damageAllUntil1HP(damageAmount: number) {
    this.data.forEach((unit) => unit.damageUntil1HP(damageAmount));
  }

  damageUntil1HPInRadius({
    radius,
    damageAmount,
    epicenter
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
