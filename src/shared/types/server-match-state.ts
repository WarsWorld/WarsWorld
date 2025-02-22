import type { Player } from "@prisma/client";
import type { COPowerState } from "shared/match-logic/co";
import type { Army } from "shared/schemas/army";
import type { COID } from "shared/schemas/co";
import type { PlayerSlot } from "shared/schemas/player-slot";
import type { Position } from "shared/schemas/position";
import type { PropertyTileType, UnusedSiloTileType } from "shared/schemas/tile";
import type { PipeSeamTileType } from "../schemas/variable-tiles";

export type CapturableTile = {
  type: PropertyTileType;
  playerSlot: PlayerSlot;
  position: Position;
  // capture points are stored in unit
};

type LaunchableSiloTile = {
  type: UnusedSiloTileType;
  fired: boolean;
  position: Position;
};

type PipeSeamTile = {
  type: PipeSeamTileType;
  hp: number;
  position: Position;
};

export type ChangeableTile = CapturableTile | LaunchableSiloTile | PipeSeamTile;

export type PlayerInMatch = {
  slot: PlayerSlot;
  hasCurrentTurn?: boolean;
  id: Player["id"];
  name: Player["name"];
  ready?: boolean;
  coId: COID;
  status: "alive" | "routed" | "captured";
  funds: number;
  powerMeter: number;
  timesPowerUsed: number;
  army: Army;
  COPowerState: COPowerState;
};
