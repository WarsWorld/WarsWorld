import type { WWMap } from "@prisma/client";
import { vi } from "vitest";
import {
  validateMainActionAndToEvent,
  validateSubActionAndToEvent,
} from "shared/match-logic/events/action-to-event";
import {
  applyMainEventToMatch,
  applySubEventToMatch,
} from "shared/match-logic/events/apply-event-to-match";
import { updateMoveVision } from "shared/match-logic/events/handlers/move";
import type { MainAction } from "shared/schemas/action";
import type { MatchRules } from "shared/schemas/match-rules";
import { getFinalPositionSafe } from "shared/schemas/position";
import type { Position } from "shared/schemas/position";
import type { PlayerSlot } from "shared/schemas/player-slot";
import type { PropertyTileType, Tile } from "shared/schemas/tile";
import type {
  MainEventsWithoutSubEvents,
  MainEventWithSubEvents,
  SubEvent,
} from "shared/types/events";
import type { ChangeableTile, PlayerInMatch } from "shared/types/server-match-state";
import type { UnitType, UnitWithVisibleStats } from "shared/schemas/unit";
import { MatchWrapper } from "shared/wrappers/match";
import type { PlayerInMatchWrapper } from "shared/wrappers/player-in-match";
import { UnitWrapper } from "shared/wrappers/unit";

/**
 * Test harness for game-feature tests. Builds a small MatchWrapper and dispatches actions
 * through the REAL engine pipeline (`action → event → apply`), so the tests pin actual
 * gameplay behavior rather than internal helpers. Keep these tests pure: no DB, no network.
 */

const DEFAULT_ARMIES = ["orange-star", "blue-moon", "green-earth", "yellow-comet"] as const;

const DEFAULT_RULES: MatchRules = {
  unitCapPerPlayer: 50,
  fogOfWar: false,
  fundsPerProperty: 1000,
  labUnitTypes: [],
  bannedUnitTypes: [],
  captureLimit: 1000, // high so captures don't trip the property-goal win by default
  dayLimit: 0,
  weatherSetting: "clear",
  teamMapping: [],
};

/** Concise tile fixtures (row-major: `tiles[y][x]`, positions are `[x, y]`). */
export const tiles = {
  road: (): Tile => ({ type: "road", variant: "right-left" }),
  base: (playerSlot: PlayerSlot): Tile => ({ type: "base", playerSlot }),
  city: (playerSlot: PlayerSlot): Tile => ({ type: "city", playerSlot }),
  hq: (playerSlot: PlayerSlot): Tile => ({ type: "hq", playerSlot }),
};

/**
 * An owned, positioned property (a `ChangeableTile`). Income (`getFundsPerTurn`) and capture
 * only consider changeable tiles, so use this — not the static `tiles.*` fixtures — when a test
 * needs a property to produce funds or be captured/repaired on.
 */
export const property = (
  type: PropertyTileType,
  playerSlot: PlayerSlot,
  position: Position,
): ChangeableTile => ({ type, playerSlot, position });

const AMMO_UNITS = new Set<UnitType>([
  "mech",
  "artillery",
  "tank",
  "antiAir",
  "missile",
  "rocket",
  "mediumTank",
  "neoTank",
  "megaTank",
  "battleCopter",
  "bomber",
  "fighter",
  "battleship",
  "sub",
  "stealth",
  "cruiser",
  "carrier",
  "pipeRunner",
]);
const HIDDEN_UNITS = new Set<UnitType>(["stealth", "sub"]);
const ONE_SLOT_TRANSPORTS = new Set<UnitType>(["apc", "transportCopter"]);
const TWO_SLOT_TRANSPORTS = new Set<UnitType>(["blackBoat", "lander", "cruiser", "carrier"]);

/** Build a minimal valid unit of any type (full HP, some fuel/ammo, empty transport slots). */
export function makeUnit(
  type: UnitType,
  position: Position,
  overrides: Partial<UnitWithVisibleStats> = {},
): Omit<UnitWithVisibleStats, "playerSlot"> {
  const stats = AMMO_UNITS.has(type) ? { fuel: 50, hp: 100, ammo: 5 } : { fuel: 50, hp: 100 };
  const unit: Record<string, unknown> = { type, position, isReady: true, stats };

  if (HIDDEN_UNITS.has(type)) {
    unit.hidden = false;
  }

  if (ONE_SLOT_TRANSPORTS.has(type) || TWO_SLOT_TRANSPORTS.has(type)) {
    unit.loadedUnit = null;
  }

  if (TWO_SLOT_TRANSPORTS.has(type)) {
    unit.loadedUnit2 = null;
  }

  return { ...unit, ...overrides } as Omit<UnitWithVisibleStats, "playerSlot">;
}

/** Add a unit of the given type to a player and return its wrapper. */
export function addUnit(
  player: PlayerInMatchWrapper,
  type: UnitType,
  position: Position,
  overrides?: Partial<UnitWithVisibleStats>,
): UnitWrapper {
  return player.addUnwrappedUnit(makeUnit(type, position, overrides));
}

/**
 * Recompute fog-of-war vision for every team. Needed after manually placing units, because a
 * team's Vision is built at match construction (before test units exist).
 */
export function recomputeVision(match: MatchWrapper): void {
  for (const team of match.teams) {
    team.vision?.recalculateVision(team.getUnits());
  }
}

type PlayerSpec = Partial<PlayerInMatch> & { slot: PlayerSlot };

type ScenarioOptions = {
  tiles: Tile[][];
  players: PlayerSpec[];
  changeableTiles?: ChangeableTile[];
  rules?: Partial<MatchRules>;
  turn?: number;
};

function buildPlayer(spec: PlayerSpec): PlayerInMatch {
  const { slot } = spec;

  return {
    id: spec.id ?? String(slot),
    name: spec.name ?? `Player ${slot}`,
    slot,
    army: spec.army ?? DEFAULT_ARMIES[slot] ?? "orange-star",
    coId: spec.coId ?? { name: "andy", version: "AW1" },
    COPowerState: spec.COPowerState ?? "no-power",
    funds: spec.funds ?? 0,
    powerMeter: spec.powerMeter ?? 0,
    timesPowerUsed: spec.timesPowerUsed ?? 0,
    status: spec.status ?? "alive",
    ...(spec.hasCurrentTurn === true ? { hasCurrentTurn: true } : {}),
  } as PlayerInMatch;
}

export function createTestMatch(options: ScenarioOptions): MatchWrapper {
  const players = options.players.map(buildPlayer);
  const teamMapping = options.rules?.teamMapping ?? players.map((p) => p.slot);
  const rules: MatchRules = { ...DEFAULT_RULES, ...options.rules, teamMapping };

  const map: WWMap = {
    id: "test-map",
    createdAt: new Date(),
    name: "test",
    numberOfPlayers: players.length,
    predeployedUnits: [],
    tiles: options.tiles,
  };

  return new MatchWrapper(
    "test-match",
    "standard",
    options.changeableTiles ?? [],
    rules,
    "playing",
    map,
    players,
    [],
    UnitWrapper,
    options.turn ?? 0,
  );
}

/**
 * Dispatch a main action through the real engine pipeline (minus persistence/emit), mirroring
 * the action router. Attack luck reads `Math.random()`, so it is pinned deterministically via
 * `luck` (default 0 = worst luck) to keep engagements reproducible.
 */
export function dispatchMainAction(
  match: MatchWrapper,
  action: MainAction,
  opts: { luck?: number } = {},
): MainEventsWithoutSubEvents | MainEventWithSubEvents {
  const luck = opts.luck ?? 0;

  const mainEvent = validateMainActionAndToEvent(match, action);

  // Join/load must be detected from the PRE-move state (as the router does), i.e. a unit already
  // sits at the destination — otherwise the just-moved unit is mistaken for a join/load target.
  const isJoinOrLoad =
    mainEvent.type === "move" &&
    match.getUnit(getFinalPositionSafe(mainEvent.path)) !== undefined &&
    getFinalPositionSafe(mainEvent.path) !== mainEvent.path[0];

  applyMainEventToMatch(match, mainEvent);

  if (action.type !== "move" || mainEvent.type !== "move") {
    return mainEvent;
  }

  const withSubEvent = { ...mainEvent, subEvent: { type: "wait" } as SubEvent };

  if (!mainEvent.trap && !isJoinOrLoad) {
    const randomSpy = vi.spyOn(Math, "random").mockReturnValue(luck);

    try {
      withSubEvent.subEvent = validateSubActionAndToEvent(match, action);
    } finally {
      randomSpy.mockRestore();
    }
  }

  updateMoveVision(match, withSubEvent);
  applySubEventToMatch(match, withSubEvent);

  return withSubEvent as MainEventWithSubEvents;
}
