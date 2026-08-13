import { getCurrentTurnPlayer } from "frontend/components/match/match-view";
import { applyBufferedActions } from "frontend/components/match/optimistic-view";
import type { TurnSnapshot } from "frontend/components/match/turn-snapshot-view";
import {
  actionQueueReducer,
  initialActionQueueState,
  nextPendingAction,
  optimisticActions,
} from "frontend/utils/action-queue";
import { createLogger } from "frontend/utils/logger";
import { trpc } from "frontend/utils/trpc-client";
import { useEffect, useMemo, useReducer, useRef } from "react";

type Params = {
  matchId: string;
  playerId: string;
};

/** Board-scoped logger — uses the logger migration's `createLogger(scope)` convention for the tag. */
const boardLog = createLogger("v2");

/**
 * Data layer for the v2 snapshot board: the match + turn-snapshot queries, the optimistic view
 * (authoritative state + buffered intent), and the action buffer with its drain/reconcile/turn-reset
 * effects. NO client engine, NO `MatchWrapper` — the backend stays authoritative (any event ->
 * refetch), so the client can't desync. See `MatchBoardV2` for the interaction/rendering half.
 */
export function useMatchBoard({ matchId, playerId }: Params) {
  // The unit price table is static within a turn (production doesn't change prices), so latch the
  // last one the BE sent and keep building from it — no round-trip on each producer, and it survives
  // the per-action snapshot refetch. Only the very first turn of the match waits for it once.
  const priceTableRef = useRef<TurnSnapshot["production"]["priceTable"]>([]);

  // Optimistic action buffer (locked design in src/frontend/CLAUDE.md). The board renders
  // `authoritative match + pending intent`; the queue drains one action at a time and reconciles
  // against the BE's authoritative refetch, so it can't desync.
  const [queue, dispatchQueue] = useReducer(actionQueueReducer, initialActionQueueState);
  const queueRef = useRef(queue);
  queueRef.current = queue;
  // clientIds whose submit the BE accepted — dropped from the buffer once the authoritative state
  // that includes them lands (avoids a flicker/double-apply between success and refetch).
  const acknowledgedRef = useRef<Set<string>>(new Set());
  // clientIds currently in flight, so a re-run of the drain effect can't submit the same one twice.
  const inFlightRef = useRef<Set<string>>(new Set());

  const matchQuery = trpc.match.full.useQuery({ matchId, playerId });
  const match = matchQuery.data;

  const isMyTurn = match !== undefined && getCurrentTurnPlayer(match)?.id === playerId;

  const snapshotQuery = trpc.matchPreview.turnSnapshot.useQuery(
    { matchId, playerId },
    { enabled: isMyTurn },
  );

  const utils = trpc.useUtils();
  const actionMutation = trpc.action.send.useMutation();

  const snapshot = isMyTurn ? (snapshotQuery.data ?? null) : null;

  if (snapshot !== null && snapshot.production.priceTable.length > 0) {
    priceTableRef.current = snapshot.production.priceTable;
  }

  // The board's rendered truth: authoritative state with the buffered intent applied on top.
  const optimisticView = useMemo(
    () =>
      match === undefined
        ? undefined
        : applyBufferedActions(match, playerId, snapshot, optimisticActions(queue)),
    [match, snapshot, queue, playerId],
  );

  trpc.action.onEvent.useSubscription(
    { playerId, matchId },
    {
      onData() {
        void utils.match.full.invalidate({ matchId, playerId });
        void utils.matchPreview.turnSnapshot.invalidate({ matchId, playerId });
      },
    },
  );

  const onActionError = (label: string) => (error: { message: string }) =>
    boardLog.warn(`${label} rejected by BE:`, error.message);

  // Drain the buffer: submit the earliest pending action, one in flight at a time.
  useEffect(() => {
    const pending = nextPendingAction(queue);

    if (pending === undefined || inFlightRef.current.has(pending.clientId)) {
      return;
    }

    inFlightRef.current.add(pending.clientId);
    dispatchQueue({ type: "sent", clientId: pending.clientId });

    // The buffer stores the pure action; the transport adds the match/player envelope on submit.
    actionMutation.mutate(
      { ...pending.action, playerId, matchId },
      {
        onSuccess() {
          // Keep the optimistic delta until the authoritative refetch lands, then drop it (below).
          acknowledgedRef.current.add(pending.clientId);
          // Force a refetch AFTER acknowledging, so the [match] reconcile effect is guaranteed to run
          // with this id present. Without it, a subscription-driven refetch that landed BEFORE this
          // callback would leave the action stuck at "sent" (no further match change to confirm it).
          void utils.match.full.invalidate({ matchId, playerId });
          void utils.matchPreview.turnSnapshot.invalidate({ matchId, playerId });
        },
        onError(error) {
          onActionError(pending.kind)(error);
          // Locked reconciliation rule (src/frontend/CLAUDE.md): apply up to and INCLUDING the first
          // failure, then cancel every action buffered after it — the later ones were built on intent
          // the BE never accepted (e.g. a move blocked by a fog-hidden unit invalidates whatever was
          // queued to follow it). Reject this one, then cancel its followers.
          dispatchQueue({ type: "rejected", clientId: pending.clientId });
          dispatchQueue({ type: "cancelFollowing", clientId: pending.clientId });
        },
        onSettled() {
          inFlightRef.current.delete(pending.clientId);
        },
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queue]);

  // Reconcile: when fresh authoritative state arrives it already includes every accepted action, so
  // drop those from the buffer (seamless hand-off from optimistic delta to BE truth).
  useEffect(() => {
    if (match === undefined || acknowledgedRef.current.size === 0) {
      return;
    }

    for (const clientId of acknowledgedRef.current) {
      dispatchQueue({ type: "confirmed", clientId });
    }

    acknowledgedRef.current.clear();
  }, [match]);

  // Turn boundary (ours ends / opponent's begins) -> discard the buffer, the BE wins. Structured so
  // a per-turn timer could later drive this same cutover (not implemented yet).
  useEffect(() => {
    dispatchQueue({ type: "reset" });
    acknowledgedRef.current.clear();
    inFlightRef.current.clear();
  }, [match?.turn]);

  return {
    matchQuery,
    optimisticView,
    snapshot,
    isMyTurn,
    queue,
    dispatchQueue,
    queueRef,
    priceTableRef,
    actionMutation,
    onActionError,
  };
}
