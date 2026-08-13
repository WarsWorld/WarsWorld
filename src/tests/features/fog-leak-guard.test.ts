import { describe, expect, it } from "vitest";
import { mainEventToEmittables } from "server/engine/events/event-to-emittable";
import type { MainAction } from "shared/schemas/action";
import {
  addUnit,
  createTestMatch,
  dispatchMainAction,
  recomputeVision,
  tiles,
} from "../helpers/scenario";

const roadRow = (n: number) => [Array.from({ length: n }, () => tiles.road())];

/** The per-team emittable is a union; grab the (move) view for a team as a loose shape. */
function viewForTeam(
  emittables: ReturnType<typeof mainEventToEmittables>,
  teamIndex: number,
): { path: unknown[]; appearingUnit?: unknown } | undefined {
  return emittables.find((e) => e?.teamIndex === teamIndex) as
    | { path: unknown[]; appearingUnit?: unknown }
    | undefined;
}

const MOVE: MainAction = {
  type: "move",
  path: [
    [0, 0],
    [1, 0],
  ],
  subAction: { type: "wait" },
};

/**
 * The fog "leak guard": `mainEventToEmittables` produces the filtered view each team is actually
 * sent. This is the load-bearing invariant for a server-authoritative refactor — a bug here leaks
 * hidden unit positions to the wrong player.
 */
describe("fog leak guard (event -> emittable)", () => {
  it("hides an out-of-vision move from the enemy while showing it to the mover", () => {
    const match = createTestMatch({
      tiles: roadRow(8),
      players: [{ slot: 0, hasCurrentTurn: true }, { slot: 1 }],
      rules: { fogOfWar: true },
    });
    const p0 = match.getPlayerBySlot(0)!;
    const p1 = match.getPlayerBySlot(1)!;
    addUnit(p0, "infantry", [0, 0]);
    addUnit(p1, "infantry", [6, 0]); // far away — cannot see [0,0] or [1,0]
    recomputeVision(match);

    const emittables = mainEventToEmittables(match, dispatchMainAction(match, MOVE));

    // Mover's own team sees the path...
    expect(viewForTeam(emittables, 0)?.path.length).toBeGreaterThan(0);
    // ...the enemy gets an event with NO path and NO revealed unit.
    const enemy = viewForTeam(emittables, 1);
    expect(enemy?.path).toEqual([]);
    expect(enemy?.appearingUnit).toBeUndefined();
  });

  it("reveals the unit (appearingUnit) when it moves into the enemy's vision", () => {
    const match = createTestMatch({
      tiles: roadRow(6),
      players: [{ slot: 0, hasCurrentTurn: true }, { slot: 1 }],
      rules: { fogOfWar: true },
    });
    const p0 = match.getPlayerBySlot(0)!;
    const p1 = match.getPlayerBySlot(1)!;
    addUnit(p0, "infantry", [0, 0]);
    addUnit(p1, "infantry", [3, 0]); // vision 2 covers the destination [1,0]
    recomputeVision(match);

    const emittables = mainEventToEmittables(match, dispatchMainAction(match, MOVE));

    const enemy = viewForTeam(emittables, 1);
    expect(enemy?.path).not.toEqual([]);
    expect(enemy?.appearingUnit).toBeDefined();
  });
});
