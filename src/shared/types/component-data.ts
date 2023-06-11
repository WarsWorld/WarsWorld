import { MatchStatus } from "@prisma/client";
import { PlayerInMatch } from "./server-match-state";

export interface FrontendMatch {
  id: string;
  map: MapBasic;
  players: PlayerInMatch[];
  state: MatchStatus;
  turn: number;
}

export interface MapBasic {
  id: string;
  name: string;
  numberOfPlayers: number;
}
