"use client";
import type { ActionQueueState } from "frontend/utils/action-queue";
import { bufferSummary } from "frontend/utils/action-queue";

/**
 * Tiny visibility into the optimistic action buffer: how many actions are queued (waiting to send),
 * in flight (sent, awaiting the BE), and failed (rejected — kept visible until the turn resets).
 * Purely presentational — reads the queue state, drives nothing. Hidden when the buffer is empty.
 */
export function BufferIndicator({ queue }: { queue: ActionQueueState }) {
  const { pending, sent, rejected } = bufferSummary(queue);

  if (pending === 0 && sent === 0 && rejected === 0) {
    return null;
  }

  return (
    <div
      className="@flex @items-center @gap-2 @text-xs @opacity-80"
      title="Optimistic action buffer: queued / sending / failed"
    >
      {/* Animated while anything is queued or in flight, so buffering reads as active, not stuck. */}
      {pending > 0 && (
        <span className="@animate-pulse" title="Queued, not yet sent">
          ⏳ {pending}
        </span>
      )}
      {sent > 0 && (
        <span className="@animate-pulse" title="Sent — awaiting the server">
          ↑ {sent}
        </span>
      )}
      {rejected > 0 && (
        <span className="@text-red-400" title="Rejected by the server">
          ⚠ {rejected}
        </span>
      )}
    </div>
  );
}
