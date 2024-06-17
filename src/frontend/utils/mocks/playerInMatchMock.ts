import type { PlayerInMatch } from "shared/types/server-match-state";

export const playerInMatch1: PlayerInMatch = {
  slot: 0,
  hasCurrentTurn: true,
  secondsRemaining: 600,
  id: "111",
  name: "Hello",
  ready: true,
  coId: {
    name: "adder",
    version: "AW2",
  },
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
  secondsRemaining: 600,
  id: "222",
  name: "World",
  ready: false,
  coId: {
    name: "sami",
    version: "AW2",
  },
  eliminated: false,
  funds: 2000,
  powerMeter: 5000,
  army: "orange-star",
  COPowerState: "no-power",
  timesPowerUsed: 0,
};
