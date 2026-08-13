import { describe, expect, it } from "vitest";
import { throwIfCantMoveIntoUnit } from "server/engine/events/handlers/move";
import type { UnitType } from "shared/schemas/unit";
import { addUnit, createTestMatch, tiles } from "../helpers/scenario";

/**
 * Cargo compatibility is a per-transport allow-list (encoded in the unit schema AND duplicated in
 * the `throwIfCantMoveIntoUnit` / `loadUnitInto` switches) — there is no generic capacity model.
 * This data-driven matrix locks which cargo each transport accepts, covering every transport type
 * and both facility-gated rules (lander = land units, carrier = air units) without N×M hand-writing.
 */
const LOAD_MATRIX: [transport: UnitType, cargo: UnitType, canLoad: boolean][] = [
  ["apc", "infantry", true],
  ["apc", "mech", true],
  ["apc", "tank", false], // apc carries soldiers only
  ["transportCopter", "infantry", true],
  ["transportCopter", "recon", false],
  ["blackBoat", "mech", true],
  ["lander", "infantry", true],
  ["lander", "tank", true], // lander carries any land unit
  ["lander", "battleCopter", false], // ...but not air units
  ["cruiser", "battleCopter", true], // cruiser carries copters
  ["cruiser", "infantry", false],
  ["carrier", "fighter", true], // carrier carries air units
  ["carrier", "tank", false],
];

describe("transport cargo compatibility", () => {
  it.each(LOAD_MATRIX)("%s can load %s -> %s", (transport, cargo, canLoad) => {
    const match = createTestMatch({
      tiles: [[tiles.road(), tiles.road()]],
      players: [{ slot: 0, hasCurrentTurn: true }, { slot: 1 }],
    });
    const p0 = match.getPlayerBySlot(0)!;
    const transportUnit = addUnit(p0, transport, [1, 0]);
    const cargoUnit = addUnit(p0, cargo, [0, 0]);

    const attempt = () => throwIfCantMoveIntoUnit(cargoUnit, transportUnit);

    if (canLoad) {
      expect(attempt).not.toThrow();
    } else {
      expect(attempt).toThrow();
    }
  });
});
