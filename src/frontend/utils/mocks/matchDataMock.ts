import { MatchStatus } from "@prisma/client";
import { FrontendMatch } from "shared/types/component-data";
import { mapBasicMock } from "./mapDataMock";
import { playerInMatch1, playerInMatch2 } from "./playerInMatchMock";

export const matchMock: FrontendMatch[] = [
  {
    id: "111",
    map: mapBasicMock[0],
    players: [playerInMatch1, playerInMatch2],
    state: MatchStatus.setup,
    turn: 2,
  },
  {
    id: "222",
    map: mapBasicMock[1],
    players: [playerInMatch1, playerInMatch2],
    state: MatchStatus.playing,
    turn: 5,
  },
  {
    id: "333",
    map: mapBasicMock[2],
    players: [playerInMatch1, playerInMatch2],
    state: MatchStatus.finished,
    turn: 7,
  },
  {
    id: "444",
    map: mapBasicMock[3],
    players: [playerInMatch1, playerInMatch2],
    state: MatchStatus.finished,
    turn: 1,
  },
  {
    id: "555",
    map: mapBasicMock[4],
    players: [playerInMatch1, playerInMatch2],
    state: MatchStatus.finished,
    turn: 13,
  },
  {
    id: "666",
    map: mapBasicMock[5],
    players: [playerInMatch1, playerInMatch2],
    state: MatchStatus.finished,
    turn: 4,
  },
  {
    id: "777",
    map: mapBasicMock[6],
    players: [playerInMatch1, playerInMatch2],
    state: MatchStatus.finished,
    turn: 24,
  },
  {
    id: "888",
    map: mapBasicMock[7],
    players: [playerInMatch1, playerInMatch2],
    state: MatchStatus.finished,
    turn: 8,
  },
  {
    id: "999",
    map: mapBasicMock[8],
    players: [playerInMatch1, playerInMatch2],
    state: MatchStatus.finished,
    turn: 3,
  },
];
