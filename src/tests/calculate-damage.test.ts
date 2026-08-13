import type { WWMap } from "@prisma/client";
import { describe, expect, it } from "vitest";
import { attackActionToEvent } from "server/engine/events/handlers/attack/attackActionToEvent";
import type { PlayerInMatch } from "server/engine/entities/player-in-match-state";
import { MatchWrapper } from "server/engine/entities/match";
import { UnitWrapper } from "server/engine/entities/unit";

/**
 * Characterization test: pins the CURRENT behavior of an attack engagement so the upcoming
 * engine refactor (decouple from Prisma, move server-side) cannot change it silently.
 *
 * Scenario: a full-HP Andy (AW1) infantry attacks an enemy infantry, both on roads.
 * Converted from the former standalone `calculate-damage-test.ts` console script — the
 * console.log values are now assertions.
 */
function buildScenario() {
  const map: WWMap = {
    id: "0",
    createdAt: new Date(),
    name: "",
    numberOfPlayers: 0,
    predeployedUnits: [],
    tiles: [
      [
        { type: "road", variant: "right-left" },
        { type: "road", variant: "right-left" },
      ],
    ],
  };

  const players: PlayerInMatch[] = [
    {
      name: "Grimm Guy",
      status: "alive",
      army: "orange-star",
      coId: { name: "andy", version: "AW1" },
      COPowerState: "no-power",
      funds: 0,
      id: "0",
      powerMeter: 0,
      slot: 0,
      timesPowerUsed: 0,
      hasCurrentTurn: true,
    },
    {
      name: "Incuggarch",
      status: "alive",
      army: "blue-moon",
      coId: { name: "andy", version: "AW1" },
      COPowerState: "no-power",
      funds: 0,
      id: "0",
      powerMeter: 0,
      slot: 1,
      timesPowerUsed: 0,
    },
  ];

  const match = new MatchWrapper(
    "",
    "standard",
    [],
    {
      unitCapPerPlayer: 0,
      fogOfWar: false,
      fundsPerProperty: 1000,
      labUnitTypes: ["infantry"],
      bannedUnitTypes: ["apc"],
      captureLimit: 0,
      dayLimit: 0,
      weatherSetting: "clear",
      teamMapping: [0, 1],
    },
    "playing",
    map,
    players,
    [],
    UnitWrapper,
    0,
  );

  const p1 = match.getPlayerBySlot(0)!;
  const p2 = match.getPlayerBySlot(1)!;

  const attacker = p1.addUnwrappedUnit({
    type: "infantry",
    isReady: true,
    position: [0, 0],
    stats: { fuel: 99, hp: 100 },
  });

  const defender = p2.addUnwrappedUnit({
    type: "infantry",
    isReady: true,
    position: [1, 0],
    stats: { fuel: 99, hp: 100 },
  });

  return { match, attacker, defender };
}

describe("attackActionToEvent — Andy AW1 infantry vs infantry on road", () => {
  it("produces the expected attack event", () => {
    const { match, attacker, defender } = buildScenario();

    const event = attackActionToEvent(
      match,
      { type: "attack", defenderPosition: defender.data.position },
      attacker.data.position,
      true,
      { goodLuck: 50, badLuck: 50 },
      { goodLuck: 50, badLuck: 50 },
    );

    expect(event.type).toBe("attack");
    expect(event.defenderPosition).toEqual([1, 0]);
    // The defender is eliminated in this scenario...
    expect(event.defenderHP).toBe(0);
    // ...so the attacker takes no counter-damage.
    expect(event.attackerHP).toBeUndefined();
    // Pin everything else (incl. eliminationReason) so a refactor can't drift it.
    expect(event).toMatchInlineSnapshot(`
      {
        "attackerHP": undefined,
        "defenderHP": 0,
        "defenderPosition": [
          1,
          0,
        ],
        "eliminationReason": "all-defender-units-destroyed",
        "type": "attack",
      }
    `);
  });
});
