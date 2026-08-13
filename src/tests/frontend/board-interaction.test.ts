import { describe, expect, it } from "vitest";
import type { BoardPosition, MatchView } from "frontend/components/match/match-view";
import type { SnapshotUnit, TurnSnapshot } from "frontend/components/match/turn-snapshot-view";
import {
  buildableUnits,
  classifyTileClick,
  commitPath,
  movableTiles,
  stageActions,
  type InteractionState,
} from "frontend/components/match/board-interaction";
import { initialActionQueueState, type ActionQueueState } from "frontend/utils/action-queue";

// Minimal fixtures cast past the large inferred wire types (same approach as the other FE tests).
const grid = (w: number, h: number) =>
  Array.from({ length: h }, () => Array.from({ length: w }, () => ({ type: "road" })));

const view = (over: Partial<MatchView> = {}): MatchView =>
  ({
    units: [],
    players: [{ id: "me", slot: 0, funds: 10000 }],
    changeableTiles: [],
    map: { tiles: grid(5, 5) },
    ...over,
  }) as unknown as MatchView;

const sUnit = (over: Partial<SnapshotUnit> = {}): SnapshotUnit =>
  ({
    type: "infantry",
    position: [0, 0],
    reachableTiles: [{ position: [0, 0], parent: null, cost: 0 }],
    ability: null,
    attacksByTile: [],
    loadableTiles: [],
    launchTiles: [],
    unloadsByTile: [],
    repairsByTile: [],
    movementPoints: 3,
    ...over,
  }) as unknown as SnapshotUnit;

const EMPTY_QUEUE = initialActionQueueState;
const attackBusyQueue = (): ActionQueueState => ({
  actions: [
    { clientId: "a", seq: 0, kind: "attack", action: {}, status: "pending" },
  ] as ActionQueueState["actions"],
  nextSeq: 1,
});

describe("movableTiles", () => {
  it("keeps own tile, empty tiles, and loadable tiles; drops occupied non-loadable ones", () => {
    const v = view({
      units: [{ type: "tank", playerSlot: 1, position: [2, 0] }] as MatchView["units"],
    });
    const u = sUnit({
      position: [0, 0],
      reachableTiles: [
        { position: [0, 0], parent: null, cost: 0 },
        { position: [1, 0], parent: [0, 0], cost: 1 }, // empty -> kept
        { position: [2, 0], parent: [1, 0], cost: 1 }, // enemy-occupied, not loadable -> dropped
      ],
      loadableTiles: [],
    });

    expect(movableTiles(v, u)).toEqual([
      [0, 0],
      [1, 0],
    ]);
  });
});

describe("commitPath", () => {
  const u = sUnit({
    reachableTiles: [
      { position: [0, 0], parent: null, cost: 0 },
      { position: [1, 0], parent: [0, 0], cost: 1 },
      { position: [2, 0], parent: [1, 0], cost: 1 },
    ],
  });

  it("returns the traced route when it already ends at the destination", () => {
    const traced: BoardPosition[] = [
      [0, 0],
      [1, 0],
    ];
    expect(commitPath(u, [1, 0], traced)).toEqual(traced);
  });

  it("falls back to the snapshot's shortest path otherwise", () => {
    expect(commitPath(u, [2, 0], [[0, 0]])).toEqual([
      [0, 0],
      [1, 0],
      [2, 0],
    ]);
  });

  it("returns null for an unreachable destination", () => {
    expect(commitPath(u, [4, 4], [])).toBeNull();
  });
});

describe("buildableUnits", () => {
  const priceTable = [
    { type: "tank", cost: 7000, facility: "base" },
    { type: "infantry", cost: 1000, facility: "base" },
    { type: "fighter", cost: 20000, facility: "airport" },
  ] as TurnSnapshot["production"]["priceTable"];

  it("filters by facility, sorts by cost, and flags affordability", () => {
    expect(buildableUnits(priceTable, "base", 3000)).toEqual([
      { type: "infantry", cost: 1000, selectable: true },
      { type: "tank", cost: 7000, selectable: false },
    ]);
  });
});

describe("stageActions", () => {
  it("offers DELETE + WAIT on the unit's own empty tile", () => {
    const res = stageActions(view(), sUnit({ position: [0, 0] }), [0, 0], EMPTY_QUEUE, "me");
    expect(res?.actions.map((a) => a.kind)).toEqual(["delete", "wait"]);
  });

  it("offers CAPTURE on an enemy property for infantry", () => {
    const v = view({
      changeableTiles: [
        { type: "city", playerSlot: 1, position: [1, 0] },
      ] as MatchView["changeableTiles"],
    });
    const u = sUnit({
      reachableTiles: [
        { position: [0, 0], parent: null, cost: 0 },
        { position: [1, 0], parent: [0, 0], cost: 1 },
      ],
    });
    expect(stageActions(v, u, [1, 0], EMPTY_QUEUE, "me")?.actions.map((a) => a.kind)).toContain(
      "capture",
    );
  });

  it("offers ATTACK (with targets) only when no attack is already unresolved", () => {
    const u = sUnit({
      attacksByTile: [{ from: [0, 0], targets: [[1, 0]] }] as SnapshotUnit["attacksByTile"],
    });

    const free = stageActions(view(), u, [0, 0], EMPTY_QUEUE, "me");
    expect(free?.actions.some((a) => a.kind === "attack")).toBe(true);
    expect(free?.attackTargets).toEqual([[1, 0]]);

    const busy = stageActions(view(), u, [0, 0], attackBusyQueue(), "me");
    expect(busy?.actions.some((a) => a.kind === "attack")).toBe(false);
    expect(busy?.attackTargets).toEqual([]);
  });

  it("returns a single LOAD action onto a loadable friendly, and null onto a non-loadable one", () => {
    const v = view({
      units: [{ type: "apc", playerSlot: 0, position: [1, 0] }] as MatchView["units"],
    });
    const loadable = sUnit({ position: [0, 0], loadableTiles: [[1, 0]] });
    expect(stageActions(v, loadable, [1, 0], EMPTY_QUEUE, "me")?.actions).toEqual([
      { kind: "load-join", label: "LOAD" },
    ]);

    const notLoadable = sUnit({ position: [0, 0], loadableTiles: [] });
    expect(stageActions(v, notLoadable, [1, 0], EMPTY_QUEUE, "me")).toBeNull();
  });
});

describe("classifyTileClick", () => {
  const baseState: InteractionState = {
    selection: null,
    stagedDest: null,
    attackTargets: [],
    unloadDrops: [],
    missileArm: null,
  };

  it("fires a missile at the clicked tile while armed", () => {
    const state: InteractionState = { ...baseState, missileArm: { path: [[0, 0]] } };
    expect(classifyTileClick(view(), null, [3, 3], state, EMPTY_QUEUE, "me")).toEqual({
      type: "launch",
      path: [[0, 0]],
      target: [3, 3],
    });
  });

  it("stages a move when a reachable tile is clicked with a unit selected", () => {
    const unit = sUnit({
      position: [0, 0],
      reachableTiles: [
        { position: [0, 0], parent: null, cost: 0 },
        { position: [1, 0], parent: [0, 0], cost: 1 },
      ],
    });
    const snapshot = { units: [unit] } as unknown as TurnSnapshot;
    const state: InteractionState = { ...baseState, selection: [0, 0] };

    const result = classifyTileClick(view(), snapshot, [1, 0], state, EMPTY_QUEUE, "me");
    expect(result).toMatchObject({ type: "stage", dest: [1, 0] });
  });

  it("classifies a click on a red target as an attack", () => {
    const unit = sUnit({ position: [0, 0] });
    const snapshot = { units: [unit] } as unknown as TurnSnapshot;
    const state: InteractionState = { ...baseState, selection: [0, 0], attackTargets: [[1, 0]] };

    expect(classifyTileClick(view(), snapshot, [1, 0], state, EMPTY_QUEUE, "me")).toMatchObject({
      type: "attack",
      from: [0, 0],
      defender: [1, 0],
    });
  });

  it("opens the build menu on an owned, empty production facility", () => {
    const v = view({
      changeableTiles: [
        { type: "base", playerSlot: 0, position: [2, 2] },
      ] as MatchView["changeableTiles"],
    });
    const snapshot = { units: [] } as unknown as TurnSnapshot;

    expect(classifyTileClick(v, snapshot, [2, 2], baseState, EMPTY_QUEUE, "me")).toEqual({
      type: "build",
      position: [2, 2],
      facility: "base",
    });
  });

  it("selects an own ready unit that can move", () => {
    const unit = sUnit({
      position: [0, 0],
      reachableTiles: [
        { position: [0, 0], parent: null, cost: 0 },
        { position: [1, 0], parent: [0, 0], cost: 1 },
      ],
    });
    const v = view({
      units: [{ type: "infantry", playerSlot: 0, position: [0, 0] }] as MatchView["units"],
    });
    const snapshot = { units: [unit] } as unknown as TurnSnapshot;

    expect(classifyTileClick(v, snapshot, [0, 0], baseState, EMPTY_QUEUE, "me")).toMatchObject({
      type: "select",
      pos: [0, 0],
    });
  });

  it("resets on an empty tile with nothing selected", () => {
    const snapshot = { units: [] } as unknown as TurnSnapshot;
    expect(classifyTileClick(view(), snapshot, [4, 4], baseState, EMPTY_QUEUE, "me")).toEqual({
      type: "reset",
    });
  });
});
