import type { Player } from "@prisma/client";
import type { Army } from "server/schemas/army";
import type { CO } from "server/schemas/co";
import type { PlayerSlot } from "server/schemas/player-slot";
import type { Position } from "server/schemas/position";
import type { PropertyTileType, UnusedSiloTileType } from "server/schemas/tile";
import type { COPowerState } from "shared/match-logic/co-power-state";

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
