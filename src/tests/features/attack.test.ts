import { describe, expect, it } from "vitest";
import type { MainAction } from "shared/schemas/action";
import { createTestMatch, dispatchMainAction, tiles } from "../helpers/scenario";

describe("attack feature", () => {
  it("resolves a direct engagement through move+attack, applying damage to both units", () => {
    const match = createTestMatch({
      tiles: [[tiles.road(), tiles.road()]],
      players: [{ slot: 0, hasCurrentTurn: true }, { slot: 1 }],
    });
    const attacker = match.getPlayerBySlot(0)!.addUnwrappedUnit({
      type: "infantry",
      isReady: true,
      position: [0, 0],
      stats: { fuel: 99, hp: 100 },
    });
    const defender = match.getPlayerBySlot(1)!.addUnwrappedUnit({
      type: "infantry",
      isReady: true,
      position: [1, 0],
      stats: { fuel: 99, hp: 100 },
    });

    // Stand still (path = start tile only) and attack the adjacent enemy. luck pinned to 0.
    const action: MainAction = {
      type: "move",
      path: [[0, 0]],
      subAction: { type: "attack", defenderPosition: [1, 0] },
    };
    dispatchMainAction(match, action, { luck: 0 });

    // Defender takes damage; attacker takes counter-damage. Exact values pinned as a
    // characterization snapshot so the engine refactor can't silently change combat.
    expect({ attackerHP: attacker.getHP(), defenderHP: defender.getHP() }).toMatchInlineSnapshot(`
      {
        "attackerHP": 73,
        "defenderHP": 45,
      }
    `);
  });
});

describe("indirect attack feature", () => {
  it("attacks from range without taking a counterattack", () => {
    const match = createTestMatch({
      tiles: [[tiles.road(), tiles.road(), tiles.road()]],
      players: [{ slot: 0, hasCurrentTurn: true }, { slot: 1 }],
    });
    const artillery = match.getPlayerBySlot(0)!.addUnwrappedUnit({
      type: "artillery",
      isReady: true,
      position: [0, 0],
      stats: { fuel: 50, hp: 100, ammo: 9 },
    });
    const defender = match.getPlayerBySlot(1)!.addUnwrappedUnit({
      type: "infantry",
      isReady: true,
      position: [2, 0],
      stats: { fuel: 99, hp: 100 },
    });

    // Stand still and fire at range 2.
    const action: MainAction = {
      type: "move",
      path: [[0, 0]],
      subAction: { type: "attack", defenderPosition: [2, 0] },
    };
    dispatchMainAction(match, action, { luck: 0 });

    // Indirect units take no counter — the attacker keeps full HP; the defender is damaged.
    expect(artillery.getHP()).toBe(100);
    expect(defender.getHP()).toMatchInlineSnapshot(`10`);
  });

  it("cannot move and attack in the same turn", () => {
    const match = createTestMatch({
      tiles: [[tiles.road(), tiles.road(), tiles.road(), tiles.road()]],
      players: [{ slot: 0, hasCurrentTurn: true }, { slot: 1 }],
    });
    match.getPlayerBySlot(0)!.addUnwrappedUnit({
      type: "artillery",
      isReady: true,
      position: [0, 0],
      stats: { fuel: 50, hp: 100, ammo: 9 },
    });
    match.getPlayerBySlot(1)!.addUnwrappedUnit({
      type: "infantry",
      isReady: true,
      position: [3, 0],
      stats: { fuel: 99, hp: 100 },
    });

    // Move one tile, then try to fire at range 2 — illegal for an indirect unit.
    const action: MainAction = {
      type: "move",
      path: [
        [0, 0],
        [1, 0],
      ],
      subAction: { type: "attack", defenderPosition: [3, 0] },
    };
    expect(() => dispatchMainAction(match, action, { luck: 0 })).toThrow();
  });
});
