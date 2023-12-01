import type { Player } from "@prisma/client";
import type { Army } from "shared/schemas/army";
import type { COID } from "shared/schemas/co";
import type { PlayerSlot } from "shared/schemas/player-slot";
import type { Position } from "shared/schemas/position";
import type { PropertyTileType, UnusedSiloTileType } from "shared/schemas/tile";
import type { COPowerState } from "shared/match-logic/co-power-state";

type WithPosition = {
  position: Position;
};

export type CapturableTile = WithPosition & {
  type: PropertyTileType;
  ownerSlot: PlayerSlot;
  // capture points are stored in unit
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
  id: Player["id"];
  ready?: boolean;
  coId: COID;
  eliminated?: boolean;
  funds: number;
  powerMeter: number;
  timesPowerUsed: number;
  army: Army;
  COPowerState: COPowerState;
};
