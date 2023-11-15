import { MatchStatus } from "@prisma/client";
import { PlayerInMatch } from "./server-match-state";

export type FrontendMatch = {
  id: string;
  map: MapBasic;
  players: PlayerInMatch[];
  state: MatchStatus;
  turn: number;
};

export type MapBasic = {
  id: string;
  name: string;
  numberOfPlayers: number;
};
