import { BackendMatchState } from "shared/types/server-match-state";

export const getCommtowerAttackBoost = (
  matchState: BackendMatchState,
  playerSlot: number
) =>
  matchState.changeableTiles.reduce(
    (prev, cur) =>
      cur.type === "commtower" && cur.ownerSlot === playerSlot
        ? prev + 1
        : prev,
    0
  );

export type COPowerState = "no-power" | "co-power" | "super-co-power";
