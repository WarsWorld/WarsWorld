import { describe, expect, it } from "vitest";
import { addUnit, createTestMatch, property, recomputeVision, tiles } from "../helpers/scenario";

const road = tiles.road;

/**
 * Fog of war — what each team can see. This is the highest-risk area for a server-authoritative
 * refactor (a leak reveals hidden units to the wrong player). Tests exercise `Vision` range plus
 * the team-visibility layers: unit sight, stealth (sub/stealth) adjacency reveal, and property reveal.
 */
describe("fog of war vision", () => {
  it("sees enemy units within a unit's vision range but not beyond", () => {
    const match = createTestMatch({
      tiles: [[road(), road(), road(), road(), road(), road()]],
      players: [{ slot: 0, hasCurrentTurn: true }, { slot: 1 }],
      rules: { fogOfWar: true },
    });
    const p0 = match.getPlayerBySlot(0)!;
    const p1 = match.getPlayerBySlot(1)!;
    addUnit(p0, "infantry", [0, 0]); // infantry vision = 2
    addUnit(p1, "infantry", [2, 0]); // within range
    addUnit(p1, "infantry", [5, 0]); // out of range
    recomputeVision(match);

    expect(p0.team.canSeeUnitAtPosition([2, 0])).toBe(true);
    expect(p0.team.canSeeUnitAtPosition([5, 0])).toBe(false);
  });

  it("keeps a hidden sub concealed until a friendly unit is adjacent", () => {
    const match = createTestMatch({
      tiles: [[road(), road(), road(), road()]],
      players: [{ slot: 0, hasCurrentTurn: true }, { slot: 1 }],
      rules: { fogOfWar: true },
    });
    const p0 = match.getPlayerBySlot(0)!;
    const p1 = match.getPlayerBySlot(1)!;
    addUnit(p0, "infantry", [0, 0]);
    addUnit(p1, "sub", [3, 0], { hidden: true });
    recomputeVision(match);

    // Hidden and no friendly unit adjacent → concealed.
    expect(p0.team.canSeeUnitAtPosition([3, 0])).toBe(false);

    // A friendly unit next to it reveals it (regardless of vision range).
    addUnit(p0, "infantry", [2, 0]);
    recomputeVision(match);
    expect(p0.team.canSeeUnitAtPosition([3, 0])).toBe(true);
  });

  it("reveals an enemy standing on one of your properties", () => {
    const match = createTestMatch({
      tiles: [[road(), road(), road(), road()]],
      players: [{ slot: 0, hasCurrentTurn: true }, { slot: 1 }],
      changeableTiles: [property("city", 0, [3, 0])], // owned by team 0
      rules: { fogOfWar: true },
    });
    const p0 = match.getPlayerBySlot(0)!;
    const p1 = match.getPlayerBySlot(1)!;
    addUnit(p0, "infantry", [0, 0]); // far from the property
    addUnit(p1, "infantry", [3, 0]); // enemy sitting on team 0's city
    recomputeVision(match);

    expect(p0.team.canSeeUnitAtPosition([3, 0])).toBe(true);
  });
});
