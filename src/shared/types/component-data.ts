import type { MatchStatus, WWMap } from "shared/types/domain-entities";
import type { PlayerInMatch } from "./server-match-state";

export type FrontendMatch = {
  id: string;
  map: MapBasic;
  players: PlayerInMatch[];
  state: MatchStatus;
  turn: number;
};

export type MapBasic = Pick<WWMap, "id" | "name" | "numberOfPlayers">;
