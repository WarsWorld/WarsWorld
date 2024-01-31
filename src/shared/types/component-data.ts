import type { Match, MatchStatus, WWMap } from "@prisma/client";
import type { PlayerInMatch } from "./server-match-state";

export type FrontendMatch = {
  id: Match["id"];
  map: MapBasic;
  players: PlayerInMatch[];
  state: MatchStatus;
  turn: number;
};

export type FrontendChatMessage = {
  createdAt: Date;
  name: string;
  content: string;
};

export type MapBasic = Pick<WWMap, "id" | "name" | "numberOfPlayers">;
