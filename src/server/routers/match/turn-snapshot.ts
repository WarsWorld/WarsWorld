import type { Facility } from "shared/match-logic/game-constants/unit-properties";
import { unitPropertiesMap } from "shared/match-logic/game-constants/unit-properties";
import { getAccessibleNodes } from "shared/match-logic/pathfinding";
import type { Position } from "shared/schemas/position";
import type { UnitType } from "shared/schemas/unit";
import type { MatchWrapper } from "shared/wrappers/match";
import type { PlayerInMatchWrapper } from "shared/wrappers/player-in-match";

/**
 * Build the turn snapshot for a player: everything the client needs to buffer this turn's simple
 * actions with no rules knowledge (see `src/frontend/CLAUDE.md`). Pure engine computation — no
 * transport, no Prisma — so it can be unit-tested directly and reused by the previews router.
 */
export const buildTurnSnapshot = (match: MatchWrapper, player: PlayerInMatchWrapper) => {
  const units = player.getUnits().map((unit) => {
    const tile = match.getTile(unit.data.position);

    return {
      position: unit.data.position,
      type: unit.data.type,
      isReady: unit.data.isReady,
      // Tiles this unit can move to (for buffering moves). Empty once it has acted this turn.
      // TODO(fog): computed against all enemies; when fog lands, compute over the player's VISIBLE
      // state so a hidden unit doesn't shrink the set and leak its position.
      reachableTiles: unit.data.isReady
        ? Array.from(getAccessibleNodes(match, unit).values()).map((node) => node.pos)
        : [],
      // Capture is inf/mech standing on a property they don't own (neutral counts).
      canCapture:
        unit.isInfantryOrMech() && "playerSlot" in tile && tile.playerSlot !== player.data.slot,
      currentCapturePoints:
        "currentCapturePoints" in unit.data ? (unit.data.currentCapturePoints ?? null) : null,
      // Capture points removed per turn == the unit's visual HP.
      captureRate: unit.getVisualHP(),
    };
  });

  const buildCostHook = player.getHook("buildCost");
  const priceTable = (Object.keys(unitPropertiesMap) as UnitType[])
    .filter((type) => !match.rules.bannedUnitTypes.includes(type))
    .map((type) => ({
      type,
      facility: unitPropertiesMap[type].facility,
      cost: buildCostHook?.(unitPropertiesMap[type].cost, match) ?? unitPropertiesMap[type].cost,
    }));

  // Player-owned, empty production facilities where a unit can be built this turn.
  const buildableTiles: { position: Position; facility: Facility }[] = [];

  for (let y = 0; y < match.map.height; y++) {
    for (let x = 0; x < match.map.width; x++) {
      const position: Position = [x, y];
      const tile = match.getTile(position);
      const facility =
        tile.type === "base" || tile.type === "airport" || tile.type === "port" ? tile.type : null;

      if (
        facility !== null &&
        "playerSlot" in tile &&
        tile.playerSlot === player.data.slot &&
        match.getUnit(position) === undefined
      ) {
        buildableTiles.push({ position, facility });
      }
    }
  }

  return {
    funds: player.data.funds,
    units,
    production: { priceTable, buildableTiles },
  };
};
