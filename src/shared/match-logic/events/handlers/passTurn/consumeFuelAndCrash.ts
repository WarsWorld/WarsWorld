import type { UnitWrapper } from "shared/wrappers/unit";

export function consumeFuelAndCrash(unit: UnitWrapper) {
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

  if (fuelConsumed !== 0) {
    unit.drainFuel(fuelConsumed);
  }

  if (unit.properties.facility !== "base" && unit.getFuel() <= 0) {
    // unit crashes
    // (has to be done here cause eagle copters consume 0 fuel per turn, but still crash if they start turn at 0 fuel)
    unit.remove();
  }
}
