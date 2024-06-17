import type { Player } from "@prisma/client";
import type { COPowerState } from "shared/match-logic/co";
import type { Army } from "shared/schemas/army";
import type { COID } from "shared/schemas/co";
import type { PlayerSlot } from "shared/schemas/player-slot";
import type { Position } from "shared/schemas/position";
import type { PropertyTileType, UnusedSiloTileType } from "shared/schemas/tile";
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
  secondsRemaining: number;
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

export type ExternalMatchData = {
  /**
   * If the match can be seen by non invited players (true by default).
   */
  isPublic: boolean;
  /**
   * Only used if the match is not public. The players that are able to load the page.
   */
  authorizedViewers?: Player["id"][];
  /**
   * Only used in fog matches. First position is what POV it's refering to (position 0 is
   * the first player slot, so authorisedPovViewers[0] will give which players are able
   * to see Player 1's POV).
   */
  authorizedPovViewers?: Player["id"][][];
  followers: Player["id"][];
  currentViewers: Player["id"][];
  /**
   * Placeholder, will need to add a pause/unpause protocol later.
   */
  isPaused: boolean;
};
