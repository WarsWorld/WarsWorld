import type { UnitWrapper } from "shared/wrappers/unit";

/**
 * @param simulate if true, doesn't change unit properties (used for player elimination check)
 * @returns true if crashed
 */
export function consumeFuelAndCrash(unit: UnitWrapper, simulate: boolean): boolean {
  let fuelConsumed = 0;

  if (unit.properties.facility === "airport") {
    fuelConsumed = 5;

    if (
      unit.data.type === "transportCopter" ||
      unit.data.type === "battleCopter"
    ) {
      fuelConsumed = 2;
    } else if ("hidden" in unit.data && unit.data.hidden) {
      // hidden stealth
      fuelConsumed = 8;
    }

    if (unit.player.data.coId.name === "eagle") {
      fuelConsumed -= 2;
    }
  } else if (unit.properties.facility === "port") {
    fuelConsumed = 1;

    if ("hidden" in unit.data && unit.data.hidden) {
      // hidden sub
      fuelConsumed = 5;
    }
  }

  if (simulate) {
    const simulatedFuel = unit.getFuel() - fuelConsumed
    return unit.properties.facility !== "base" && simulatedFuel <= 0;
  }

  if (fuelConsumed !== 0) {
    unit.drainFuel(fuelConsumed);
  }

  if (unit.properties.facility !== "base" && unit.getFuel() <= 0) {
    // unit crashes
    // (has to be done here cause eagle copters consume 0 fuel per turn, but still crash if they start turn at 0 fuel)
    unit.remove();
    return true;
  }

  return false;
}
