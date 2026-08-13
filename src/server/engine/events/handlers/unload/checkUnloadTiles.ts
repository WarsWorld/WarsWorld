import { DispatchableError } from "server/engine/DispatchedError";
import { unitPropertiesMap } from "server/engine/constants/unit-properties";
import { getBaseMovementCost } from "server/engine/rules/movement-cost";
import { getWeatherSpecialMovement } from "server/engine/rules/weather";
import type { Position } from "server/core/schemas/position";
import { getNeighbourPositions } from "server/core/schemas/position";
import type { Tile } from "server/core/schemas/tile";
import type { UnitType } from "server/core/schemas/unit";
import type { ChangeableTile } from "server/core/schemas/tile-state";
import type { PlayerInMatchWrapper } from "server/engine/entities/player-in-match";
import type { UnitWrapper } from "server/engine/entities/unit";

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
  newTransportUnitLocation?: Position,
) => {
  const transportPos = newTransportUnitLocation ?? transportUnit.data.position;

  //unit also has to be able to stand on the tile the transport is standing
  if (
    !canUnitMoveToTile(
      unitToUnload,
      transportUnit.match.getTile(transportPos),
      transportUnit.player,
    )
  ) {
    return [];
  }

  const unloadablePositions: Position[] = [];

  for (const adjPos of getNeighbourPositions(transportPos)) {
    if (transportUnit.match.map.isOutOfBounds(adjPos)) {
      continue;
    }

    if (
      canUnitMoveToTile(unitToUnload, transportUnit.match.getTile(adjPos), transportUnit.player)
    ) {
      unloadablePositions.push(adjPos);
    }
  }

  return unloadablePositions;
};
