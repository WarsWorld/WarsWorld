import type { PlayerInMatch } from "shared/types/server-match-state";

export const playerInMatch1: PlayerInMatch = {
  slot: 0,
  hasCurrentTurn: true,
  playerId: "111",
  ready: true,
  co: "adder",
  eliminated: false,
  funds: 1000,
  powerMeter: 3000,
  army: "black-hole",
  COPowerState: "no-power",
};

export const playerInMatch2: PlayerInMatch = {
  slot: 1,
  hasCurrentTurn: false,
  playerId: "222",
  ready: false,
  co: "sami",
  eliminated: false,
  funds: 2000,
  powerMeter: 5000,
  army: "orange-star",
  COPowerState: "no-power",
};
