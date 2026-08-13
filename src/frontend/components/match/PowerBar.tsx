"use client";
import type { PowerInfo } from "./turn-snapshot-view";

/**
 * The acting player's CO-power bar: a star meter plus a button per activatable power (CO / Super).
 * Purely presentational — everything (meter, star counts, cost, availability) is BE-computed in the
 * turn snapshot. Activating a power buffers a `{ type: "coPower", isSuper }` action like any other;
 * its board effects are BE-resolved (never previewed here). Only rendered on the player's own turn.
 */

type Props = {
  power: PowerInfo;
  /** Buffer a CO power (false) or super CO power (true). */
  onActivate: (isSuper: boolean) => void;
  /** True while a power activation is already buffered (awaiting the BE) — blocks a double-tap. */
  pending: boolean;
};

const StarMeter = ({ current, total }: { current: number; total: number }) => {
  // The meter can be momentarily out of range (e.g. drained below zero right after a power is used),
  // so clamp before repeat() — a negative count throws a RangeError and takes the whole bar down.
  const safeTotal = Math.max(0, total);
  const lit = Math.max(0, Math.min(current, safeTotal));

  return (
    <span className="@font-mono @tracking-tight" aria-label={`${lit} of ${safeTotal} stars`}>
      {"★".repeat(lit)}
      {"☆".repeat(safeTotal - lit)}
    </span>
  );
};

export function PowerBar({ power, onActivate, pending }: Props) {
  // A CO with no powers at all — nothing to show.
  if (power.copower === null && power.superCopower === null) {
    return null;
  }

  const active = power.state !== "no-power";
  const statusLabel = active
    ? power.state === "super-co-power"
      ? "SUPER CO POWER ACTIVE"
      : "CO POWER ACTIVE"
    : null;

  return (
    <div className="@flex @items-center @gap-2 @text-xs">
      <span className="@opacity-80">{power.coName}</span>

      {power.totalStars > 0 && <StarMeter current={power.currentStars} total={power.totalStars} />}

      {statusLabel !== null ? (
        <span className="@font-semibold @text-yellow-400">{statusLabel}</span>
      ) : (
        <>
          {power.copower !== null && (
            <button
              className="btn @select-none @px-2 @py-0.5"
              disabled={!power.copower.available || pending}
              title={`${power.copower.name} — ${power.copower.stars}★ (${power.copower.cost} meter)`}
              onClick={() => onActivate(false)}
            >
              CO Power
            </button>
          )}
          {power.superCopower !== null && (
            <button
              className="btn @select-none @px-2 @py-0.5"
              disabled={!power.superCopower.available || pending}
              title={`${power.superCopower.name} — ${power.superCopower.stars}★ (${power.superCopower.cost} meter)`}
              onClick={() => onActivate(true)}
            >
              Super
            </button>
          )}
        </>
      )}
    </div>
  );
}
