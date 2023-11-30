import type { WWMap } from "@prisma/client";
import { attackActionToEvent } from "shared/match-logic/events/handlers/attack";
import type { PlayerInMatch } from "shared/types/server-match-state";
import { MatchWrapper } from "shared/wrappers/match";

/**
 * TODO add memory usage readouts by reading memory used by process
 * before creating the match, before generating the event, and after
 * generating the event, and then printing the total mem used as well as
 * the differences between these points.
 *
 * also add processing time readouts by taking the time at the same 3 stages
 * and just printing the differences.
 */

/**
 * this is a test scenario to fully simulate an attack event
 * and output the previous and resulting HP values to the console.
 * it's a standalone script that can be run with `npx tsx file.ts`.
 * this scenario is a full HP andy infantry attacking
 * another infantry on roads with worst luck.
 *
 * when we add things like game versions for COs, match rules (?)
 * and units, these files will raise type errors and need to
 * be updated, so we should probably do that soon so we can start
 * testing our damage calculations that are going to become
 * more complex with the different game versions and skills later on.
 *
 * depending on how we go about this,
 * we might want to put these tests / scenarios into
 * a separate repository in order to keep the git history sane.
 * - Function
 */

const map: WWMap = {
  id: "0",
  createdAt: new Date(),
  name: "",
  numberOfPlayers: 0,
  predeployedUnits: [],
  tiles: [
    [
      {
        type: "road",
        variant: "right-left"
      },
      {
        type: "road",
        variant: "right-left"
      }
    ]
  ]
};

const players: PlayerInMatch[] = [
  {
    army: "orange-star",
    coId: {
      name: "andy",
      version: "AW1"
    },
    COPowerState: "no-power",
    funds: 0,
    id: "0",
    powerMeter: 0,
    slot: 0,
    timesPowerUsed: 0,
    hasCurrentTurn: true
  },
  {
    army: "blue-moon",
    coId: {
      name: "andy",
      version: "AW1"
    },
    COPowerState: "no-power",
    funds: 0,
    id: "0",
    powerMeter: 0,
    slot: 1,
    timesPowerUsed: 0
  }
];

const match = new MatchWrapper(
  "",
  "standard",
  [],
  {
    bannedUnitTypes: [],
    captureLimit: 0,
    dayLimit: 0,
    fogOfWar: false,
    fundsPerProperty: 1000,
    unitCapPerPlayer: 0,
    weatherSetting: "clear"
  },
  "playing",
  map,
  players,
  [],
  0
);

const p1 = match.players.getBySlotOrThrow(0);
const p2 = match.players.getBySlotOrThrow(1);

const u1 = p1.addUnwrappedUnit({
  type: "infantry",
  isReady: true,
  position: [0, 0],
  stats: {
    fuel: 99,
    hp: 100
  }
});

const u2 = p2.addUnwrappedUnit({
  type: "infantry",
  isReady: true,
  position: [1, 0],
  stats: {
    fuel: 99,
    hp: 100
  }
});

const { attackerHP, defenderHP } = attackActionToEvent(
  match,
  {
    type: "attack",
    defenderPosition: u2.data.position
  },
  u1.data.position,
  0,
  0
);

console.log(
  "attacker HP:",
  u1.getHP(),
  "=>",
  attackerHP === null ? "(no counter)" : attackerHP
);
console.log("defender HP:", u2.getHP(), "=>", defenderHP);
