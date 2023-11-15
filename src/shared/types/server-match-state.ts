import { Player } from "@prisma/client";
import { Army } from "server/schemas/army";
import { CO } from "server/schemas/co";
import { PlayerSlot } from "server/schemas/player-slot";
import { Position } from "server/schemas/position";
import { PropertyTileType, UnusedSiloTileType } from "server/schemas/tile";
import { COPowerState } from "shared/match-logic/co-power-state";

type WithPosition = {
  position: Position;
};

type CapturableTile = WithPosition & {
  type: PropertyTileType;
  hp: number;
  ownerSlot: PlayerSlot;
};

type LaunchableSiloTile = WithPosition & {
  type: UnusedSiloTileType;
  fired: boolean;
};

export type ChangeableTile = CapturableTile | LaunchableSiloTile;

//TODO: Add player name to this, it would make things easier rather than
// having to always look up players id to get their username
export type PlayerInMatch = {
  slot: PlayerSlot;
  hasCurrentTurn?: boolean;
  playerId: Player["id"];
  ready?: boolean;
  co: CO;
  eliminated?: boolean;
  funds: number;
  powerMeter: number;
  army: Army;
  COPowerState: COPowerState;
};
