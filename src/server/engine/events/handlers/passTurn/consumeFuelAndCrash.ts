import { snowDoublesFuel } from "server/engine/rules/weather";
import type { UnitWrapper } from "server/engine/entities/unit";

export function getTurnFuelConsumption(unit: UnitWrapper): number {
  let fuelConsumed = 0;

  if (unit.properties.facility === "airport") {
    fuelConsumed = 5;

    if (unit.data.type === "transportCopter" || unit.data.type === "battleCopter") {
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

  // AWDS snow doubles daily fuel upkeep too (0 stays 0 for land units).
  return snowDoublesFuel(unit.player) ? fuelConsumed * 2 : fuelConsumed;
}
