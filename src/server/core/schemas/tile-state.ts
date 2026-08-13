import type { PlayerSlot } from "./player-slot";
import type { Position } from "./position";
import type { PropertyTileType, UnusedSiloTileType } from "./tile";
import type { PipeSeamTileType } from "./variable-tiles";

// Mutable per-tile state (kernel vocabulary — no engine dependency). The engine reads/writes these;
// the tile *schema* (tile.ts) references ChangeableTile in its type guards.

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
