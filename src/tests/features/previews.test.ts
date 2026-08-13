import { describe, expect, it } from "vitest";
import { buildTurnSnapshot } from "server/routers/match/turn-snapshot";
import { getBattleForecast } from "shared/match-logic/combat-forecast";
import {
  getAccessibleNodes,
  getAttackableTiles,
  getAttackTargetTiles,
} from "shared/match-logic/pathfinding";
import type { Position } from "shared/schemas/position";
import { isSamePosition } from "shared/schemas/position";
import {
  addUnit,
  createTestMatch,
  dispatchMainAction,
  makeUnit,
  property,
  recomputeVision,
  tiles,
} from "../helpers/scenario";

const has = (positions: Position[], target: Position) =>
  positions.some((p) => isSamePosition(p, target));

const roadRow = (length: number) => [Array.from({ length }, () => tiles.road())];

/**
 * These pin the pure engine queries the backend preview endpoints wrap (reachable tiles, attack
 * targets, battle forecast). Same computation the FE used to run client-side — now server-owned.
 */
describe("previews", () => {
  it("reports the tiles a unit can reach within its movement range", () => {
    const match = createTestMatch({
      tiles: roadRow(6),
      players: [{ slot: 0, hasCurrentTurn: true }, { slot: 1 }],
    });
    const infantry = addUnit(match.getPlayerBySlot(0)!, "infantry", [0, 0]);

    const reached = Array.from(getAccessibleNodes(match, infantry).values()).map((n) => n.pos);

    // Infantry moves 3 over road (cost 1/tile): x = 0..3 reachable, x = 4+ not.
    expect(has(reached, [0, 0])).toBe(true);
    expect(has(reached, [3, 0])).toBe(true);
    expect(has(reached, [4, 0])).toBe(false);
  });

  it("treats an enemy unit as an impassable blocker", () => {
    const match = createTestMatch({
      tiles: roadRow(6),
      players: [{ slot: 0, hasCurrentTurn: true }, { slot: 1 }],
    });
    const infantry = addUnit(match.getPlayerBySlot(0)!, "infantry", [0, 0]);
    addUnit(match.getPlayerBySlot(1)!, "infantry", [2, 0]); // enemy wall

    const reached = Array.from(getAccessibleNodes(match, infantry).values()).map((n) => n.pos);

    // Can't move onto or past the enemy on this 1-wide corridor.
    expect(has(reached, [1, 0])).toBe(true);
    expect(has(reached, [2, 0])).toBe(false);
    expect(has(reached, [3, 0])).toBe(false);
  });

  it("lists an adjacent enemy as an attack target for a direct unit", () => {
    const match = createTestMatch({
      tiles: roadRow(3),
      players: [{ slot: 0, hasCurrentTurn: true }, { slot: 1 }],
    });
    const tank = addUnit(match.getPlayerBySlot(0)!, "tank", [0, 0]);
    addUnit(match.getPlayerBySlot(1)!, "infantry", [2, 0]);

    // Tank can move next to [2,0] and attack it.
    expect(has(getAttackTargetTiles(match, tank), [2, 0])).toBe(true);
  });

  it("lists an adjacent enemy for a direct unit attacking in place (explicit fromPosition)", () => {
    const match = createTestMatch({
      tiles: roadRow(2),
      players: [{ slot: 0, hasCurrentTurn: true }, { slot: 1 }],
    });
    const tank = addUnit(match.getPlayerBySlot(0)!, "tank", [0, 0]);
    addUnit(match.getPlayerBySlot(1)!, "infantry", [1, 0]);

    // fromPosition = the tank's own tile, passed as a fresh tuple: it must still see its neighbours
    // (a value comparison, not reference) so an in-place attack finds the adjacent enemy.
    expect(has(getAttackTargetTiles(match, tank, [0, 0]), [1, 0])).toBe(true);
  });

  it("forecasts a direct engagement's damage for both sides", () => {
    const match = createTestMatch({
      tiles: roadRow(2),
      players: [{ slot: 0, hasCurrentTurn: true }, { slot: 1 }],
    });
    const tank = addUnit(match.getPlayerBySlot(0)!, "tank", [0, 0]);
    addUnit(match.getPlayerBySlot(1)!, "infantry", [1, 0]);

    const forecast = getBattleForecast(match, tank, [0, 0], [1, 0]);

    // Tank hits the infantry for real damage; ranges are ordered min <= max.
    expect(forecast.attackerDamage.max).toBeGreaterThan(0);
    expect(forecast.attackerDamage.min).toBeLessThanOrEqual(forecast.attackerDamage.max);
    expect(forecast.defenderDamage.min).toBeLessThanOrEqual(forecast.defenderDamage.max);
  });

  it("precomputes attack targets per firing tile so the client can plan an attack offline", () => {
    const match = createTestMatch({
      tiles: roadRow(3),
      players: [{ slot: 0, hasCurrentTurn: true }, { slot: 1 }],
    });
    const p0 = match.getPlayerBySlot(0)!;
    addUnit(p0, "tank", [0, 0]);
    addUnit(match.getPlayerBySlot(1)!, "infantry", [2, 0]);

    const snapshot = buildTurnSnapshot(match, p0);
    const tank = snapshot.units.find((unit) => unit.type === "tank");

    // The tank can move next to the enemy at [2,0] and fire — from [1,0] the target is reachable.
    const fromAdjacent = tank?.attacksByTile.find((entry) => isSamePosition(entry.from, [1, 0]));
    expect(fromAdjacent).toBeDefined();
    expect(has(fromAdjacent!.targets, [2, 0])).toBe(true);
  });

  it("only lets an indirect unit attack from where it stands (no move-and-fire)", () => {
    const match = createTestMatch({
      tiles: roadRow(4),
      players: [{ slot: 0, hasCurrentTurn: true }, { slot: 1 }],
    });
    const p0 = match.getPlayerBySlot(0)!;
    addUnit(p0, "artillery", [0, 0]);
    addUnit(match.getPlayerBySlot(1)!, "infantry", [3, 0]); // in artillery range (2-3) from [0,0]

    const snapshot = buildTurnSnapshot(match, p0);
    const artillery = snapshot.units.find((unit) => unit.type === "artillery");

    // Can fire on the enemy from its current tile...
    const fromOrigin = artillery!.attacksByTile.find((entry) => isSamePosition(entry.from, [0, 0]));
    expect(fromOrigin).toBeDefined();
    expect(has(fromOrigin!.targets, [3, 0])).toBe(true);

    // ...but has NO attack entry from a tile it would have to move to first.
    expect(artillery!.attacksByTile.some((entry) => isSamePosition(entry.from, [1, 0]))).toBe(
      false,
    );
  });

  it("marks a valid load target but not an invalid one (load-validity)", () => {
    const match = createTestMatch({
      tiles: roadRow(3),
      players: [{ slot: 0, hasCurrentTurn: true }, { slot: 1 }],
    });
    const p0 = match.getPlayerBySlot(0)!;
    const infantry = addUnit(p0, "infantry", [0, 0]);
    addUnit(p0, "apc", [1, 0]); // empty transport — loadable
    addUnit(p0, "tank", [2, 0]); // different-type non-transport — NOT loadable

    const snapshot = buildTurnSnapshot(match, p0);
    const inf = snapshot.units.find((unit) => unit.position === infantry.data.position);

    expect(has(inf!.loadableTiles, [1, 0])).toBe(true); // into the APC
    expect(has(inf!.loadableTiles, [2, 0])).toBe(false); // can't load into a tank
  });

  it("lists valid unload drops for a loaded transport", () => {
    const match = createTestMatch({
      tiles: roadRow(3),
      players: [{ slot: 0, hasCurrentTurn: true }, { slot: 1 }],
    });
    const p0 = match.getPlayerBySlot(0)!;
    const apc = addUnit(p0, "apc", [1, 0]);
    // Load an infantry into the APC (only its type is read for drop computation).
    (apc.data as { loadedUnit: unknown }).loadedUnit = makeUnit("infantry", [1, 0]);

    const snapshot = buildTurnSnapshot(match, p0);
    const transport = snapshot.units.find((unit) => unit.type === "apc");

    // Standing at [1,0], the infantry can be dropped onto the adjacent road tiles.
    const here = transport!.unloadsByTile.find((entry) => isSamePosition(entry.from, [1, 0]));
    expect(here).toBeDefined();
    expect(here!.drops.some((drop) => isSamePosition(drop.position, [0, 0]))).toBe(true);
    expect(here!.drops.every((drop) => drop.isSecondUnit === false)).toBe(true);
  });

  it("reports a unit's in-place ability: apc supply, sub/stealth hide/reveal by hidden state", () => {
    const match = createTestMatch({
      tiles: roadRow(4),
      players: [{ slot: 0, hasCurrentTurn: true }, { slot: 1 }],
    });
    const p0 = match.getPlayerBySlot(0)!;
    addUnit(p0, "apc", [0, 0]);
    addUnit(p0, "sub", [1, 0], { hidden: false });
    addUnit(p0, "stealth", [2, 0], { hidden: true });

    const snapshot = buildTurnSnapshot(match, p0);

    // Neutral toggle direction — the client renders DIVE/SURFACE (sub) or HIDE/APPEAR (stealth).
    expect(snapshot.units.find((u) => u.type === "apc")?.ability).toEqual({ kind: "supply" });
    expect(snapshot.units.find((u) => u.type === "sub")?.ability).toEqual({ kind: "hide" });
    expect(snapshot.units.find((u) => u.type === "stealth")?.ability).toEqual({ kind: "reveal" });
    // A plain tank has no in-place ability.
    addUnit(p0, "tank", [3, 0]);
    const withTank = buildTurnSnapshot(match, p0);
    expect(withTank.units.find((u) => u.type === "tank")?.ability).toBeNull();
  });

  it("under fog of war, a player sees only tiles and enemy units within their vision", () => {
    const match = createTestMatch({
      tiles: roadRow(10),
      players: [{ slot: 0, hasCurrentTurn: true }, { slot: 1 }],
      rules: { fogOfWar: true },
    });
    const p0 = match.getPlayerBySlot(0)!;
    const p1 = match.getPlayerBySlot(1)!;
    addUnit(p0, "infantry", [0, 0]); // vision 2 around [0,0]
    addUnit(p1, "infantry", [9, 0]); // far away, out of p0's vision
    recomputeVision(match); // Vision is built before test units exist, so recompute it

    // p0 sees around its own unit but not the distant tile...
    expect(p0.team.isPositionVisible([0, 0])).toBe(true);
    expect(p0.team.isPositionVisible([9, 0])).toBe(false);
    // ...so it can't see p1's far infantry, while p1 sees its own.
    expect(p0.team.canSeeUnitAtPosition([9, 0])).toBe(false);
    expect(p1.team.canSeeUnitAtPosition([9, 0])).toBe(true);
  });

  it("under fog, an owned property grants vision on its own tile even with no unit on it", () => {
    const match = createTestMatch({
      tiles: roadRow(10),
      players: [{ slot: 0, hasCurrentTurn: true }, { slot: 1 }],
      rules: { fogOfWar: true },
      changeableTiles: [property("city", 0, [7, 0])], // p0 owns a city far from any unit
    });
    const p0 = match.getPlayerBySlot(0)!;
    addUnit(p0, "infantry", [0, 0]); // vision 2 around [0,0], nowhere near the city

    // No recomputeVision: the owned property must be visible from construction alone. This pins the
    // bug where Vision was built before the team was registered, so ownership never resolved.
    expect(p0.team.isPositionVisible([7, 0])).toBe(true); // owned property self-vision
    expect(p0.team.isPositionVisible([4, 0])).toBe(false); // gap: no unit, no property
  });

  it("under fog, an unseen enemy doesn't shrink the reachable preview (no position leak)", () => {
    const match = createTestMatch({
      tiles: roadRow(6),
      players: [{ slot: 0, hasCurrentTurn: true }, { slot: 1 }],
      rules: { fogOfWar: true },
    });
    const p0 = match.getPlayerBySlot(0)!;
    const infantry = addUnit(p0, "infantry", [0, 0]); // vision 2, moves 3
    addUnit(match.getPlayerBySlot(1)!, "infantry", [3, 0]); // in move range, outside vision (dist 3)
    recomputeVision(match);

    expect(p0.team.isPositionVisible([3, 0])).toBe(false); // genuinely unseen

    // The unseen enemy must not truncate the range — [3,0] stays reachable; the move traps there at
    // execution rather than the preview revealing the enemy by stopping short.
    const reached = Array.from(getAccessibleNodes(match, infantry).values()).map((n) => n.pos);
    expect(has(reached, [3, 0])).toBe(true);
  });

  it("under fog, an unseen enemy in range is not offered as an attack target", () => {
    const match = createTestMatch({
      tiles: roadRow(6),
      players: [{ slot: 0, hasCurrentTurn: true }, { slot: 1 }],
      rules: { fogOfWar: true },
    });
    const p0 = match.getPlayerBySlot(0)!;
    const artillery = addUnit(p0, "artillery", [0, 0]); // vision 1, range [2,3]
    addUnit(match.getPlayerBySlot(1)!, "infantry", [3, 0]); // in range, but outside vision
    recomputeVision(match);

    expect(p0.team.isPositionVisible([3, 0])).toBe(false);
    // The tile is genuinely in firing range...
    expect(has(getAttackableTiles(match, artillery, [0, 0]), [3, 0])).toBe(true);
    // ...but the unseen enemy on it isn't a target (targeting it would leak its position).
    expect(has(getAttackTargetTiles(match, artillery, [0, 0]), [3, 0])).toBe(false);
  });

  it("hides a concealed sub from the enemy unless they have an adjacent unit", () => {
    const match = createTestMatch({
      tiles: roadRow(4),
      players: [{ slot: 0, hasCurrentTurn: true }, { slot: 1 }],
    });
    const p0 = match.getPlayerBySlot(0)!;
    const p1 = match.getPlayerBySlot(1)!;
    addUnit(p0, "sub", [1, 0], { hidden: true });

    // The owner always sees its own dived sub; the enemy can't (no adjacent unit).
    expect(p0.team.canSeeUnitAtPosition([1, 0])).toBe(true);
    expect(p1.team.canSeeUnitAtPosition([1, 0])).toBe(false);

    // An adjacent enemy unit detects (reveals) it.
    addUnit(p1, "cruiser", [2, 0]);
    expect(p1.team.canSeeUnitAtPosition([1, 0])).toBe(true);
  });

  it("lists the unfired silo tiles an infantry can launch a missile from", () => {
    const match = createTestMatch({
      tiles: roadRow(3),
      players: [{ slot: 0, hasCurrentTurn: true }, { slot: 1 }],
      changeableTiles: [{ type: "unusedSilo", fired: false, position: [1, 0] }],
    });
    const p0 = match.getPlayerBySlot(0)!;
    addUnit(p0, "infantry", [0, 0]);

    const snapshot = buildTurnSnapshot(match, p0);
    const infantry = snapshot.units.find((unit) => unit.type === "infantry");

    // The infantry can walk onto the adjacent silo and fire from there.
    expect(has(infantry!.launchTiles, [1, 0])).toBe(true);
    expect(has(infantry!.launchTiles, [0, 0])).toBe(false); // its own (non-silo) tile
  });

  it("lists a black boat's adjacent friendly repair targets per reachable tile", () => {
    const seaRow = [[{ type: "sea" }, { type: "sea" }, { type: "sea" }]] as Parameters<
      typeof createTestMatch
    >[0]["tiles"];
    const match = createTestMatch({
      tiles: seaRow,
      players: [{ slot: 0, hasCurrentTurn: true }, { slot: 1 }],
    });
    const p0 = match.getPlayerBySlot(0)!;
    addUnit(p0, "blackBoat", [1, 0]);
    addUnit(p0, "cruiser", [0, 0]); // friendly to the boat's left — repairable

    const snapshot = buildTurnSnapshot(match, p0);
    const boat = snapshot.units.find((unit) => unit.type === "blackBoat");

    const here = boat!.repairsByTile.find((entry) => isSamePosition(entry.from, [1, 0]));
    expect(here).toBeDefined();
    expect(
      here!.targets.some((t) => t.direction === "left" && isSamePosition(t.position, [0, 0])),
    ).toBe(true);
  });

  it("activates the CO power state on coPower so hook/state effects take hold", () => {
    const match = createTestMatch({
      tiles: roadRow(2),
      players: [
        { slot: 0, hasCurrentTurn: true, coId: { name: "sami", version: "AW2" }, powerMeter: 1e9 },
        { slot: 1 },
      ],
    });
    const p0 = match.getPlayerBySlot(0)!;
    addUnit(p0, "infantry", [0, 0]);

    expect(p0.data.COPowerState).toBe("no-power");

    dispatchMainAction(match, { type: "coPower", isSuper: true });

    // Without this the power's hooks (Sami's +2 move / insta-capture, firepower boosts, …) stay inert.
    expect(p0.data.COPowerState).toBe("super-co-power");
    // And the snapshot immediately reflects the boosted movement (infantry now reaches further).
    expect(buildTurnSnapshot(match, p0).power.state).toBe("super-co-power");
  });

  it("recomputes reachable tiles under an active power (Sami super gives foot units +2 move)", () => {
    const makeMatch = () =>
      createTestMatch({
        tiles: roadRow(8),
        players: [
          { slot: 0, hasCurrentTurn: true, coId: { name: "sami", version: "AW2" } },
          { slot: 1 },
        ],
      });

    // Day-to-day: infantry moves 3 (reaches x=0..3).
    const base = makeMatch();
    addUnit(base.getPlayerBySlot(0)!, "infantry", [0, 0]);
    const baseSnap = buildTurnSnapshot(base, base.getPlayerBySlot(0)!);
    const baseReach = baseSnap.units[0].reachableTiles.map((t) => t.position);
    expect(has(baseReach, [3, 0])).toBe(true);
    expect(has(baseReach, [5, 0])).toBe(false);

    // Victory March active: +2 movement → now reaches x=0..5.
    const powered = makeMatch();
    const p0 = powered.getPlayerBySlot(0)!;
    p0.data.COPowerState = "super-co-power";
    addUnit(p0, "infantry", [0, 0]);
    const poweredSnap = buildTurnSnapshot(powered, p0);
    const poweredReach = poweredSnap.units[0].reachableTiles.map((t) => t.position);
    expect(has(poweredReach, [5, 0])).toBe(true);
  });

  it("reports the acting player's CO power: name, stars, cost and availability by meter", () => {
    const charged = createTestMatch({
      tiles: roadRow(2),
      players: [{ slot: 0, hasCurrentTurn: true, powerMeter: 1_000_000 }, { slot: 1 }],
    });
    const p0 = charged.getPlayerBySlot(0)!;

    const snapshot = buildTurnSnapshot(charged, p0);

    expect(snapshot.power.state).toBe("no-power");
    expect(snapshot.power.coName).toBe("Andy");
    expect(snapshot.power.copower).not.toBeNull();
    expect(snapshot.power.copower!.name).toBe("Hyper Repair");
    expect(snapshot.power.copower!.stars).toBe(3);
    // Andy's only power is the max meter, so its cost equals maxMeter (== totalStars * starCost).
    expect(snapshot.power.copower!.cost).toBe(snapshot.power.maxMeter);
    expect(snapshot.power.totalStars).toBe(3);
    expect(snapshot.power.copower!.available).toBe(true); // meter far exceeds the cost
    expect(snapshot.power.superCopower).toBeNull(); // Andy (AW1) has no super power

    // With an empty meter the same power isn't activatable, and no stars are lit.
    const empty = createTestMatch({
      tiles: roadRow(2),
      players: [{ slot: 0, hasCurrentTurn: true, powerMeter: 0 }, { slot: 1 }],
    });
    const drained = buildTurnSnapshot(empty, empty.getPlayerBySlot(0)!);
    expect(drained.power.copower!.available).toBe(false);
    expect(drained.power.currentStars).toBe(0);
  });

  it("builds a turn snapshot: funds, capture eligibility, price table, buildable base", () => {
    const match = createTestMatch({
      tiles: roadRow(2),
      players: [{ slot: 0, hasCurrentTurn: true, funds: 5000 }, { slot: 1 }],
      // Enemy city under our infantry (capturable); our own empty base to build on.
      changeableTiles: [property("city", 1, [0, 0]), property("base", 0, [1, 0])],
    });
    const p0 = match.getPlayerBySlot(0)!;
    addUnit(p0, "infantry", [0, 0]);

    const snapshot = buildTurnSnapshot(match, p0);

    expect(snapshot.funds).toBe(5000);

    const infantry = snapshot.units.find((unit) => unit.type === "infantry");
    expect(infantry?.canCapture).toBe(true); // inf on an enemy property
    expect(infantry?.reachableTiles.length).toBeGreaterThan(0);

    expect(snapshot.production.priceTable).toContainEqual({
      type: "infantry",
      cost: 1000,
      facility: "base",
    });
    // The owned, empty base is buildable; the enemy city is not a production facility.
    expect(snapshot.production.buildableTiles).toContainEqual({
      position: [1, 0],
      facility: "base",
    });
  });
});
