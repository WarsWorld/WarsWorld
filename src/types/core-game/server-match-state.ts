import { LeagueType, MatchStatus, Player, WWMap } from "@prisma/client";
import { CO } from "components/schemas/co";
import { PlayerSlot } from "components/schemas/player-slot";
import { Position } from "components/schemas/position";
import { CreatableUnit } from "components/schemas/unit";

interface WithPosition {
  position: Position;
}

interface CapturableTile extends WithPosition {
  type: "city" | "base" | "airport" | "port" | "lab" | "comtower" | "hq";
  hp: number;
  ownerSlot: PlayerSlot;
}

interface LaunchableSiloTile extends WithPosition {
  type: "unusedSilo";
  fired: boolean;
}

export type ChangeableTile = CapturableTile | LaunchableSiloTile;

export interface PlayerInMatch {
  playerSlot: PlayerSlot;
  hasCurrentTurn?: boolean;
  playerId: Player["id"];
  ready?: boolean;
  co: CO;
  eliminated?: true;
  funds: number;
}

export interface ServerMatchState {
  id: string;
  rules: {
    fogOfWar?: true;
    fundsMultiplier?: number;
    leagueType: LeagueType;
  };
  status: MatchStatus;
  map: WWMap;
  changeableTiles: ChangeableTile[];
  units: CreatableUnit[];
  turn: number;
  players: PlayerInMatch[];
}
