import type { Player } from "@prisma/client";
import type { Army } from "shared/schemas/army";
import type { COID } from "shared/schemas/co";
import type { PlayerSlot } from "shared/schemas/player-slot";
import type { Position } from "shared/schemas/position";
import type { PropertyTileType, UnusedSiloTileType } from "shared/schemas/tile";
import type { COPowerState } from "shared/match-logic/co";
import type { PipeSeamTileType } from "../schemas/variable-tiles";

type WithPosition = {
  position: Position;
};

export type CapturableTile = WithPosition & {
  type: PropertyTileType;
  playerSlot: PlayerSlot;
  // capture points are stored in unit
};

type LaunchableSiloTile = WithPosition & {
  type: UnusedSiloTileType;
  fired: boolean;
};

type PipeSeamTile = WithPosition & {
  type: PipeSeamTileType;
  hp: number;
};

export type ChangeableTile = CapturableTile | LaunchableSiloTile | PipeSeamTile;

export type PlayerInMatch = {
  slot: PlayerSlot;
  hasCurrentTurn?: boolean;
  id: Player["id"];
  name: Player["name"];
  ready?: boolean;
  coId: COID;
  eliminated?: boolean;
  funds: number;
  powerMeter: number;
  timesPowerUsed: number;
  army: Army;
  COPowerState: COPowerState;
};
