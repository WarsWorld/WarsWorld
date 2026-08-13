import { describe, expect, it } from "vitest";
import type { MatchPlayer, MatchUnit, MatchView } from "frontend/components/match/match-view";
import { applyBufferedActions } from "frontend/components/match/optimistic-view";
import type { TurnSnapshot } from "frontend/components/match/turn-snapshot-view";
import type { ActionKind, QueuedAction } from "frontend/utils/action-queue";
import type { MainAction } from "shared/schemas/action";

// Minimal plain fixtures — the derivation only reads position/type/isReady/funds/slot, so we cast
// past the large inferred wire types (same approach as match-view.test.ts).
const unit = (position: [number, number], over: Partial<MatchUnit> = {}): MatchUnit =>
  ({
    type: "infantry",
    playerSlot: 0,
    position,
    isReady: true,
    stats: { hp: 100 },
    ...over,
  }) as unknown as MatchUnit;

const player = (over: Partial<MatchPlayer>): MatchPlayer =>
  ({ id: "me", slot: 0, funds: 10000, ...over }) as unknown as MatchPlayer;

const view = (over: Partial<MatchView> = {}): MatchView =>
  ({ units: [], players: [player({})], ...over }) as unknown as MatchView;

const snapshot = (over: Partial<TurnSnapshot> = {}): TurnSnapshot =>
  ({
    funds: 10000,
    units: [],
    production: {
      priceTable: [{ type: "infantry", cost: 1000, facility: "base" }],
      buildableTiles: [],
    },
    ...over,
  }) as unknown as TurnSnapshot;

let seq = 0;
const queued = (kind: ActionKind, action: MainAction): QueuedAction => ({
  clientId: `c${seq}`,
  seq: seq++,
  kind,
  action,
  status: "pending",
});

const move = (from: [number, number], to: [number, number]): MainAction => ({
  type: "move",
  path: [from, to],
  subAction: { type: "wait" },
});

describe("optimistic view derivation", () => {
  it("returns the match untouched when there are no buffered actions", () => {
    const m = view({ units: [unit([0, 0])] });
    expect(applyBufferedActions(m, "me", snapshot(), [])).toBe(m);
  });

  it("slides a moved unit to the path's end and marks it not ready", () => {
    const m = view({ units: [unit([0, 0])] });

    const next = applyBufferedActions(m, "me", snapshot(), [queued("move", move([0, 0], [2, 0]))]);

    const moved = next.units[0];
    expect(moved.position).toEqual([2, 0]);
    expect(moved.isReady).toBe(false);
    expect(m.units[0].position).toEqual([0, 0]); // original view is not mutated
  });

  it("ticks capture points on a capture so the badge shows", () => {
    const m = view({ units: [unit([0, 0])] });
    const snap = snapshot({
      units: [
        { position: [0, 0], currentCapturePoints: 20, captureRate: 8 },
      ] as TurnSnapshot["units"],
    });

    const next = applyBufferedActions(m, "me", snap, [queued("capture", move([0, 0], [0, 0]))]);

    expect((next.units[0] as { currentCapturePoints?: number }).currentCapturePoints).toBe(12);
  });

  it("places a ghost unit and subtracts its cost on production", () => {
    const m = view({ units: [] });
    const build: MainAction = { type: "build", unitType: "infantry", position: [1, 1] };

    const next = applyBufferedActions(m, "me", snapshot(), [queued("production", build)]);

    expect(next.units).toHaveLength(1);
    expect(next.units[0].position).toEqual([1, 1]);
    expect(next.units[0].type).toBe("infantry");
    expect(next.players[0].funds).toBe(9000); // 10000 - 1000
  });

  it("slides the attacker to its firing tile without resolving combat", () => {
    const m = view({ units: [unit([0, 0]), unit([3, 0], { type: "tank", playerSlot: 1 })] });
    const attack: MainAction = {
      type: "move",
      path: [
        [0, 0],
        [2, 0],
      ],
      subAction: { type: "attack", defenderPosition: [3, 0] },
    };

    const next = applyBufferedActions(m, "me", snapshot(), [queued("attack", attack)]);

    expect(next.units[0].position).toEqual([2, 0]); // attacker moved up to fire
    expect(next.units[1].position).toEqual([3, 0]); // defender untouched (BE resolves the fight)
  });

  it("previews a load by absorbing the unit into the transport's cargo (not stacking sprites)", () => {
    // Infantry at [0,0] moves onto the empty transport at [1,0] — a load. It's removed from the
    // board and shown as the transport's cargo, matching what authoritative state will show.
    const m = view({
      units: [
        unit([0, 0]),
        unit([1, 0], { type: "apc", playerSlot: 0, loadedUnit: null } as Partial<MatchUnit>),
      ],
    });

    const next = applyBufferedActions(m, "me", snapshot(), [queued("move", move([0, 0], [1, 0]))]);

    expect(next.units).toHaveLength(1); // infantry absorbed into the transport
    const apc = next.units[0] as { type: string; loadedUnit?: { type: string } | null };
    expect(apc.type).toBe("apc");
    expect(apc.loadedUnit?.type).toBe("infantry"); // now carried, so the cargo indicator shows
  });

  it("previews an unload by moving the transport and dropping a ghost of the cargo", () => {
    // APC carrying an infantry moves to [2,0] and unloads it to the right (onto [3,0]).
    const m = view({
      units: [
        unit([1, 0], {
          type: "apc",
          playerSlot: 0,
          loadedUnit: { type: "infantry" },
        } as Partial<MatchUnit>),
      ],
    });
    const unload: MainAction = {
      type: "move",
      path: [
        [1, 0],
        [2, 0],
      ],
      subAction: { type: "unloadWait", unloads: [{ isSecondUnit: false, direction: "right" }] },
    };

    const next = applyBufferedActions(m, "me", snapshot(), [queued("move", unload)]);

    const apc = next.units.find((u) => u.type === "apc");
    const dropped = next.units.find((u) => u.type === "infantry");
    expect(apc?.position).toEqual([2, 0]); // transport moved
    expect(dropped?.position).toEqual([3, 0]); // cargo ghost dropped to the right of [2,0]
  });

  it("removes a unit from the board on delete (self-destruct)", () => {
    const m = view({ units: [unit([0, 0]), unit([2, 0], { type: "tank" })] });
    const del: MainAction = { type: "delete", position: [0, 0] };

    const next = applyBufferedActions(m, "me", snapshot(), [queued("delete", del)]);

    expect(next.units).toHaveLength(1);
    expect(next.units[0].type).toBe("tank"); // the other unit is untouched
  });

  it("toggles a sub's hidden flag on dive/surface while sliding it", () => {
    const m = view({
      units: [unit([0, 0], { type: "sub", hidden: false } as Partial<MatchUnit>)],
    });
    const dive: MainAction = {
      type: "move",
      path: [
        [0, 0],
        [1, 0],
      ],
      subAction: { type: "ability" },
    };

    const next = applyBufferedActions(m, "me", snapshot(), [queued("ability", dive)]);

    const sub = next.units[0] as { position: [number, number]; hidden?: boolean };
    expect(sub.position).toEqual([1, 0]); // moved
    expect(sub.hidden).toBe(true); // now dived
  });

  it("composes buffered actions in order", () => {
    const m = view({ units: [unit([0, 0])] });

    const next = applyBufferedActions(m, "me", snapshot(), [
      queued("move", move([0, 0], [1, 0])),
      queued("production", { type: "build", unitType: "infantry", position: [5, 5] }),
    ]);

    expect(next.units[0].position).toEqual([1, 0]);
    expect(next.units).toHaveLength(2);
    expect(next.players[0].funds).toBe(9000);
  });
});
