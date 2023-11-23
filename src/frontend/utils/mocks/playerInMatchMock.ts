import type { PlayerInMatch } from "shared/types/server-match-state";

export const playerInMatch1: PlayerInMatch = {
  slot: 0,
  hasCurrentTurn: true,
  id: "111",
  name: "Hello",
  ready: true,
  co: "adder",
  eliminated: false,
  funds: 1000,
  powerMeter: 3000,
  army: "black-hole",
  COPowerState: "no-power",
  timesPowerUsed: 0,
};

export const playerInMatch2: PlayerInMatch = {
  slot: 1,
  hasCurrentTurn: false,
  id: "222",
  name: "World",
  ready: false,
  co: "sami",
  eliminated: false,
  funds: 2000,
  powerMeter: 5000,
  army: "orange-star",
  COPowerState: "no-power",
  timesPowerUsed: 0,
};
