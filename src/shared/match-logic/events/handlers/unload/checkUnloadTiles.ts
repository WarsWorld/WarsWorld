import { DispatchableError } from "shared/DispatchedError";
import { unitPropertiesMap } from "shared/match-logic/game-constants/unit-properties";
import { getBaseMovementCost } from "shared/match-logic/movement-cost";
import { getWeatherSpecialMovement } from "shared/match-logic/weather";
import type { Position } from "shared/schemas/position";
import { getNeighbourPositions } from "shared/schemas/position";
import type { Tile } from "shared/schemas/tile";
import type { UnitType } from "shared/schemas/unit";
import type { ChangeableTile } from "shared/types/server-match-state";
import type { PlayerInMatchWrapper } from "shared/wrappers/player-in-match";
import type { UnitWrapper } from "shared/wrappers/unit";

const canUnitMoveToTile = (
  unitToUnload: { type: UnitType },
  tile: Tile | ChangeableTile,
  player: PlayerInMatchWrapper,
) => {
  const baseMovementCost = getBaseMovementCost(
    unitPropertiesMap[unitToUnload.type].movementType,
    getWeatherSpecialMovement(player),
    tile.type,
    player.match.rules.gameVersion ?? player.data.coId.version,
  );
  return baseMovementCost !== null;
};

export const throwIfUnitCantBeUnloadedToTile = (
  unitToUnload: { type: UnitType },
  tile: Tile | ChangeableTile,
  player: PlayerInMatchWrapper,
) => {
  if (!canUnitMoveToTile(unitToUnload, tile, player)) {
    throw new DispatchableError("Cannot unload unit in desired position");
  }
};

export const getUnloadablePositions = (
  transportUnit: UnitWrapper,
  unitToUnload: { type: UnitType },
) => {
  const unloadablePositions: Position[] = [];

  for (const adjPos of getNeighbourPositions(transportUnit.data.position)) {
    if (
      canUnitMoveToTile(
        unitToUnload,
        transportUnit.match.getTile(transportUnit.data.position),
        transportUnit.player,
      )
    ) {
      unloadablePositions.push(adjPos);
    }
  }

  return unloadablePositions;
};
