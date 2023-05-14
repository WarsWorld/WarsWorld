import { LeagueType, MatchStatus, Player, WWMap } from "@prisma/client";
import { CO } from "server/schemas/co";
import { PlayerSlot } from "server/schemas/player-slot";
import { Position } from "server/schemas/position";
import { CreatableUnit } from "server/schemas/unit";
import {
  PropertyTileType,
  TileType,
  UnusedSiloTileType,
} from "server/schemas/tile";

interface WithPosition {
  position: Position;
}

interface CapturableTile extends WithPosition {
  type: PropertyTileType;
  hp: number;
  ownerSlot: PlayerSlot;
}

interface LaunchableSiloTile extends WithPosition {
  type: UnusedSiloTileType;
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
  powerMeter: number;
}

export interface BackendMatchState {
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
