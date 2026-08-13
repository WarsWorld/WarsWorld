import { describe, expect, it } from "vitest";
import type { MainAction } from "shared/schemas/action";
import {
  actionQueueReducer,
  canBufferAttack,
  hasUnresolvedAttack,
  initialActionQueueState,
  nextPendingAction,
  optimisticActions,
  type ActionKind,
  type ActionQueueEvent,
  type ActionQueueState,
} from "frontend/utils/action-queue";

// The reducer treats the action payload as opaque — only `kind` drives its behavior — so a plain
// move payload is fine for every case; the `kind` label is what matters.
const MOVE: MainAction = { type: "move", path: [[0, 0]], subAction: { type: "wait" } };
const enq = (clientId: string, kind: ActionKind): ActionQueueEvent => ({
  type: "enqueue",
  clientId,
  kind,
  action: MOVE,
});

const run = (events: ActionQueueEvent[], start = initialActionQueueState): ActionQueueState =>
  events.reduce(actionQueueReducer, start);

describe("action queue reducer", () => {
  it("buffers actions in submit order with a monotonic seq", () => {
    const state = run([enq("a", "move"), enq("b", "production")]);

    expect(state.actions.map((a) => [a.clientId, a.seq, a.status])).toEqual([
      ["a", 0, "pending"],
      ["b", 1, "pending"],
    ]);
    expect(state.nextSeq).toBe(2);
  });

  it("ignores a duplicate clientId so a retry can't double-buffer", () => {
    const state = run([enq("a", "move"), enq("a", "move")]);

    expect(state.actions).toHaveLength(1);
  });

  it("drains strictly in order, one in flight at a time", () => {
    let state = run([enq("a", "move"), enq("b", "production")]);

    expect(nextPendingAction(state)?.clientId).toBe("a");

    // Once 'a' is sent, nothing else is drained until it resolves.
    state = actionQueueReducer(state, { type: "sent", clientId: "a" });
    expect(nextPendingAction(state)).toBeUndefined();

    // Confirming 'a' drops it and unblocks 'b'.
    state = actionQueueReducer(state, { type: "confirmed", clientId: "a" });
    expect(state.actions.map((a) => a.clientId)).toEqual(["b"]);
    expect(nextPendingAction(state)?.clientId).toBe("b");
  });

  it("keeps a rejected action out of the optimistic preview and out of the drain", () => {
    let state = run([enq("a", "move"), enq("b", "production"), { type: "sent", clientId: "a" }]);

    state = actionQueueReducer(state, { type: "rejected", clientId: "a" });

    expect(optimisticActions(state).map((a) => a.clientId)).toEqual(["b"]);
    expect(nextPendingAction(state)?.clientId).toBe("b");
  });

  it("blocks a new attack while one is unresolved, but not simple actions", () => {
    let state = run([enq("atk", "attack")]);
    expect(hasUnresolvedAttack(state)).toBe(true);
    expect(canBufferAttack(state)).toBe(false);

    // A move can still be buffered alongside the pending attack.
    state = actionQueueReducer(state, enq("mv", "move"));
    expect(state.actions).toHaveLength(2);
    expect(canBufferAttack(state)).toBe(false); // still gated on the attack

    // Sending the attack doesn't unblock (outcome still unknown); confirming it does.
    state = actionQueueReducer(state, { type: "sent", clientId: "atk" });
    expect(canBufferAttack(state)).toBe(false);
    state = actionQueueReducer(state, { type: "confirmed", clientId: "atk" });
    expect(canBufferAttack(state)).toBe(true);
  });

  it("cancels every action buffered after a failure (fog move failure)", () => {
    let state = run([enq("a", "move"), enq("b", "move"), enq("c", "production")]);

    // 'a' failed against authoritative state; the rest of the buffer rolls back, 'a' stays.
    state = actionQueueReducer(state, { type: "cancelFollowing", clientId: "a" });

    expect(state.actions.find((x) => x.clientId === "a")?.status).toBe("pending");
    expect(state.actions.find((x) => x.clientId === "b")?.status).toBe("rejected");
    expect(state.actions.find((x) => x.clientId === "c")?.status).toBe("rejected");
    expect(optimisticActions(state).map((x) => x.clientId)).toEqual(["a"]);
  });

  it("resets the buffer on a turn change / full resync", () => {
    const state = run([enq("a", "move"), { type: "sent", clientId: "a" }, { type: "reset" }]);

    expect(state).toEqual(initialActionQueueState);
  });
});
