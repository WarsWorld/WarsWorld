import type { MainAction } from "shared/schemas/action";

/**
 * Client action buffer + reconciliation (see the locked design in `src/frontend/CLAUDE.md`).
 *
 * The backend is authoritative and validates every action, so the client can't know an action
 * "succeeded" until the BE confirms it. This buffer lets the player keep acting (buffering intent)
 * across round-trips and dropped connections while the FE shows the actions optimistically, then
 * reconciles against the BE's authoritative result.
 *
 * PURE reducer over plain data — no engine, no network, no React. The transport layer drains it
 * (submits `pending` actions) and feeds outcomes back via `confirmed`/`rejected`. Turn-scoped:
 * `reset` clears it on a turn change or a full resync (the "BE wins" cutover).
 *
 * `MainAction` is a tRPC-inferred input type (the API contract), not engine logic — importing it
 * here does not couple the client to the engine.
 */

/**
 * The four buffered action kinds. Simple ones (move/capture/production) apply optimistically; an
 * `attack` is BE-resolved and, crucially, blocks buffering the *next* attack until it resolves
 * (its outcome — a unit dying, a tile freeing — is unknowable to the client).
 */
export type ActionKind = "move" | "capture" | "production" | "attack";

export type QueuedActionStatus =
  /** Buffered locally, not yet sent to the BE. */
  | "pending"
  /** Sent to the BE, awaiting its authoritative outcome. */
  | "sent"
  /** The BE accepted it; it is now reflected in authoritative state. */
  | "confirmed"
  /** The BE rejected it (illegal/stale), or it was cancelled after an earlier failure. */
  | "rejected";

export type QueuedAction = {
  /** Idempotency key — lets the BE (and resync) dedupe a re-sent action. */
  clientId: string;
  /** Monotonic order within the current turn's buffer. */
  seq: number;
  kind: ActionKind;
  action: MainAction;
  status: QueuedActionStatus;
};

export type ActionQueueState = {
  actions: QueuedAction[];
  nextSeq: number;
};

/** How the player-facing reconciliation banner should read after applying an event. */
export type ReconcileSignal =
  | { type: "none" }
  /** We are refetching authoritative state after (re)connecting. */
  | { type: "resyncing" }
  /** A submitted action was corrected/undone by the BE; the board jumped to the BE's truth. */
  | { type: "action-corrected"; clientId: string };

export type ActionQueueEvent =
  | { type: "enqueue"; clientId: string; kind: ActionKind; action: MainAction }
  | { type: "sent"; clientId: string }
  | { type: "confirmed"; clientId: string }
  | { type: "rejected"; clientId: string }
  /**
   * A buffered action failed against authoritative state (e.g. a move blocked by a fog-hidden unit).
   * The failing action itself is resolved separately (the BE applies its real, possibly partial
   * outcome); this cancels every action buffered AFTER it — they were built on intent the BE never
   * accepted. Fog-failure rule: "apply up to and including the first failure, cancel the rest".
   */
  | { type: "cancelFollowing"; clientId: string }
  /** Turn change / full resync: drop everything and start clean ("BE wins" cutover). */
  | { type: "reset" };

export const initialActionQueueState: ActionQueueState = { actions: [], nextSeq: 0 };

/**
 * The next action the transport should submit: the earliest still-`pending` one. Turn-based play
 * means we drain strictly in order — one in flight at a time — so a rejection can't leave later
 * optimistic actions built on an outcome the BE never accepted.
 */
export const nextPendingAction = (state: ActionQueueState): QueuedAction | undefined => {
  const hasInFlight = state.actions.some((a) => a.status === "sent");

  if (hasInFlight) {
    return undefined;
  }

  return [...state.actions].sort((a, b) => a.seq - b.seq).find((a) => a.status === "pending");
};

/** Actions to render as an optimistic preview: everything not yet rejected, in submit order. */
export const optimisticActions = (state: ActionQueueState): QueuedAction[] =>
  state.actions.filter((a) => a.status !== "rejected").sort((a, b) => a.seq - b.seq);

/** True while an attack is still buffered or in flight — its outcome isn't known yet. */
export const hasUnresolvedAttack = (state: ActionQueueState): boolean =>
  state.actions.some((a) => a.kind === "attack" && (a.status === "pending" || a.status === "sent"));

/**
 * Whether the player may start a NEW attack right now. Attacks serialize only against other
 * attacks — moves/captures/production stay bufferable regardless — so this gates just the attack UI.
 */
export const canBufferAttack = (state: ActionQueueState): boolean => !hasUnresolvedAttack(state);

const setStatus = (
  state: ActionQueueState,
  clientId: string,
  status: QueuedActionStatus,
): ActionQueueState => ({
  ...state,
  actions: state.actions.map((a) => (a.clientId === clientId ? { ...a, status } : a)),
});

export const actionQueueReducer = (
  state: ActionQueueState,
  event: ActionQueueEvent,
): ActionQueueState => {
  switch (event.type) {
    case "enqueue": {
      // Ignore a duplicate clientId so a retried enqueue can't double-buffer the same intent.
      if (state.actions.some((a) => a.clientId === event.clientId)) {
        return state;
      }

      return {
        actions: [
          ...state.actions,
          {
            clientId: event.clientId,
            seq: state.nextSeq,
            kind: event.kind,
            action: event.action,
            status: "pending",
          },
        ],
        nextSeq: state.nextSeq + 1,
      };
    }
    case "sent": {
      return setStatus(state, event.clientId, "sent");
    }
    case "confirmed": {
      // Drop confirmed actions: authoritative state now includes them, so there's nothing left to
      // preview or reconcile.
      return {
        ...state,
        actions: state.actions.filter((a) => a.clientId !== event.clientId),
      };
    }
    case "rejected": {
      return setStatus(state, event.clientId, "rejected");
    }
    case "cancelFollowing": {
      const pivot = state.actions.find((a) => a.clientId === event.clientId);

      if (pivot === undefined) {
        return state;
      }

      // Everything buffered after the failure rolls back; the pivot itself is resolved elsewhere.
      return {
        ...state,
        actions: state.actions.map((a) => (a.seq > pivot.seq ? { ...a, status: "rejected" } : a)),
      };
    }
    case "reset": {
      return initialActionQueueState;
    }
  }
};
