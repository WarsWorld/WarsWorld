import { PlayerInMatch } from "shared/types/server-match-state";

export const playerInMatch1: PlayerInMatch = {
  playerSlot: 0,
  hasCurrentTurn: true,
  playerId: "111",
  ready: true,
  co: "adder",
  eliminated: false,
  funds: 1000,
  powerMeter: 3000,
  army: "black-hole",
};

export const playerInMatch2: PlayerInMatch = {
  playerSlot: 1,
  hasCurrentTurn: false,
  playerId: "222",
  ready: false,
  co: "sami",
  eliminated: false,
  funds: 2000,
  powerMeter: 5000,
  army: "orange-star",
};
