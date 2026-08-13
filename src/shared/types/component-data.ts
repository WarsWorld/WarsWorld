import type { MatchStatus, WWMap } from "shared/types/domain-entities";
import type { PlayerInMatch } from "./server-match-state";

export type FrontendMatch = {
  id: string;
  map: MapBasic;
  players: PlayerInMatch[];
  state: MatchStatus;
  turn: number;
  /** Derived match end (status isn't persisted as "finished" yet) — lets the list mark Completed. */
  finished?: boolean;
};

export type MapBasic = Pick<WWMap, "id" | "name" | "numberOfPlayers">;
