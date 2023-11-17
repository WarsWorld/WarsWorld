import { LeagueType, MatchStatus, Player, WWMap } from "@prisma/client";
import { Army } from "server/schemas/army";
import { CO } from "server/schemas/co";
import { PlayerSlot } from "server/schemas/player-slot";
import { Position } from "server/schemas/position";
import { WWUnit } from "server/schemas/unit";
import { PropertyTileType, UnusedSiloTileType } from "server/schemas/tile";
import { Weather } from "shared/match-logic/tiles";
import { COPowerState } from "shared/match-logic/co-utilities";

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
  slot: PlayerSlot;
  hasCurrentTurn?: boolean;
  playerId: Player["id"];
  name: Player["name"];
  ready?: boolean;
  co: CO;
  eliminated?: boolean;
  funds: number;
  powerMeter: number;
  army: Army;
  COPowerState: COPowerState;
}

//TODO: Add favorites, possibly spectators, also a timer
export interface BackendMatchState {
  id: string;
  rules: {
    fogOfWar?: boolean;
    fundsMultiplier?: number;
    leagueType: LeagueType;
  };
  status: MatchStatus;
  map: WWMap;
  changeableTiles: ChangeableTile[];
  units: WWUnit[];
  turn: number;
  players: PlayerInMatch[];
  currentWeather: Weather;
  weatherNextDay: Weather | null;
}

export const getCurrentTurnPlayer = (matchState: BackendMatchState) => {
  const player = matchState.players.find((p) => p.hasCurrentTurn);

  if (player === undefined) {
    throw new Error("No player with current turn was found");
  }

  return player;
};
