import type { COPowerState } from "server/engine/rules/co";
import type { Army } from "server/core/schemas/army";
import type { COID } from "server/core/schemas/co";
import type { PlayerSlot } from "server/core/schemas/player-slot";

export type PlayerInMatch = {
  slot: PlayerSlot;
  hasCurrentTurn?: boolean;
  id: string;
  name: string;
  ready?: boolean;
  coId: COID;
  status: "alive" | "routed" | "captured";
  /** Persisted match result for this player, set once when the match is finalized. */
  result?: "won" | "lost" | "drawn";
  funds: number;
  powerMeter: number;
  timesPowerUsed: number;
  army: Army;
  COPowerState: COPowerState;
  /**
   * Whether this player has PRODUCED (built) a unit since the game started — predeployed/starting
   * units don't count. Gates the "no units left = defeat" rule: a player only loses from having zero
   * units once they've built at least one (so an empty round-one board isn't an instant loss). Set in
   * the build apply step so it survives event-log replay.
   */
  hasBuiltUnit?: boolean;
};

export const createNeutralPlayerInMatch: () => PlayerInMatch = () => {
  return {
    slot: -1,
    hasCurrentTurn: false,
    id: "Neutral",
    name: "Neutral",
    ready: true,
    coId: { name: "adder", version: "AW2" },
    status: "alive",
    funds: 0,
    powerMeter: 0,
    timesPowerUsed: 0,
    army: "black-hole",
    COPowerState: "no-power",
  };
};
