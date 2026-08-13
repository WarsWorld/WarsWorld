import { getCOProperties } from "shared/match-logic/co";
import { throwIfCantMoveIntoUnit } from "shared/match-logic/events/handlers/move";
import { getUnloadablePositions } from "shared/match-logic/events/handlers/unload/checkUnloadTiles";
import type { Facility } from "shared/match-logic/game-constants/unit-properties";
import { unitPropertiesMap } from "shared/match-logic/game-constants/unit-properties";
import type { PathNode } from "shared/match-logic/pathfinding";
import { getAccessibleNodes, getAttackTargetTiles } from "shared/match-logic/pathfinding";
import type { Direction, Position } from "shared/schemas/position";
import { addDirection, allDirections, getDirection, isSamePosition } from "shared/schemas/position";
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
    const nodes = unit.data.isReady
      ? getAccessibleNodes(match, unit)
      : new Map<Position, PathNode>();

    // Enemies attackable from each move destination — precomputed so the client can plan an attack
    // (move + fire) with NO round-trip. Indirect units can't fire after moving, so they only get
    // targets from where they currently stand.
    const indirect = unit.isIndirect();
    const attacksByTile: { from: Position; targets: Position[] }[] = [];

    for (const node of nodes.values()) {
      if (indirect && !isSamePosition(node.pos, unit.data.position)) {
        continue;
      }

      const targets = getAttackTargetTiles(match, unit, node.pos);

      if (targets.length > 0) {
        attacksByTile.push({ from: node.pos, targets });
      }
    }

    // Reachable tiles occupied by a friendly unit into which THIS unit can validly LOAD or JOIN.
    // Uses the engine's own move-into rule, so the client never offers a load the BE would reject.
    const loadableTiles: Position[] = [];

    for (const node of nodes.values()) {
      if (isSamePosition(node.pos, unit.data.position)) {
        continue;
      }

      const occupant = match.getUnit(node.pos);

      if (occupant === undefined || occupant.player.team !== unit.player.team) {
        continue;
      }

      try {
        throwIfCantMoveIntoUnit(unit, occupant);
        loadableTiles.push(node.pos);
      } catch {
        // Not a valid load/join target (full, wrong type, target at full HP, …).
      }
    }

    // For a transport carrying units: the valid unload drops (which cargo slot, which direction)
    // per reachable destination, so the client can offer + buffer an unload with no round-trip.
    const unloadsByTile: {
      from: Position;
      drops: { isSecondUnit: boolean; direction: Direction; position: Position }[];
    }[] = [];

    if (unit.isTransport() && unit.data.isReady) {
      const cargo: { isSecondUnit: boolean; type: UnitType }[] = [];

      if (unit.data.loadedUnit !== null) {
        cargo.push({ isSecondUnit: false, type: unit.data.loadedUnit.type });
      }

      if ("loadedUnit2" in unit.data && unit.data.loadedUnit2 !== null) {
        cargo.push({ isSecondUnit: true, type: unit.data.loadedUnit2.type });
      }

      if (cargo.length > 0) {
        for (const node of nodes.values()) {
          const here = match.getUnit(node.pos);

          // The transport can only stop (and unload) on an empty tile, or stand still on its own.
          if (here !== undefined && !isSamePosition(node.pos, unit.data.position)) {
            continue;
          }

          const drops: { isSecondUnit: boolean; direction: Direction; position: Position }[] = [];

          for (const carried of cargo) {
            for (const dropPos of getUnloadablePositions(unit, { type: carried.type }, node.pos)) {
              const occupant = match.getUnit(dropPos);

              // Can't drop onto an occupied tile (its own origin vacates as it moves, so that's ok).
              if (occupant !== undefined && !isSamePosition(dropPos, unit.data.position)) {
                continue;
              }

              drops.push({
                isSecondUnit: carried.isSecondUnit,
                direction: getDirection(node.pos, dropPos),
                position: dropPos,
              });
            }
          }

          if (drops.length > 0) {
            unloadsByTile.push({ from: node.pos, drops });
          }
        }
      }
    }

    // In-place / after-move ability (a move+ability subaction): an APC supplies its neighbours; a
    // sub or stealth toggles concealment. `kind` is the neutral direction of the toggle (hide vs
    // reveal); the client picks the unit-specific verb (a sub DIVE/SURFACEs, a stealth HIDE/APPEARs).
    let ability: { kind: "supply" | "hide" | "reveal" } | null = null;

    if (unit.data.isReady) {
      if (unit.data.type === "apc") {
        ability = { kind: "supply" };
      } else if (unit.data.type === "sub" || unit.data.type === "stealth") {
        ability = { kind: "hidden" in unit.data && unit.data.hidden ? "reveal" : "hide" };
      }
    }

    // Missile silo: an infantry/mech ending its move on an unfired silo can launch (target chosen on
    // the board — any in-bounds tile). Precomputed so the client offers LAUNCH with no round-trip.
    const launchTiles: Position[] = [];

    if (unit.isInfantryOrMech() && unit.data.isReady) {
      for (const node of nodes.values()) {
        const nodeTile = match.getTile(node.pos);

        if (nodeTile.type === "unusedSilo" && "fired" in nodeTile && !nodeTile.fired) {
          launchTiles.push(node.pos);
        }
      }
    }

    // Black boat repair: adjacent friendly units it can resupply/heal, per reachable destination
    // (same shape as unloadsByTile — a direction + the resulting target tile). BE validates funds.
    const repairsByTile: {
      from: Position;
      targets: { direction: Direction; position: Position }[];
    }[] = [];

    if (unit.data.type === "blackBoat" && unit.data.isReady) {
      for (const node of nodes.values()) {
        const here = match.getUnit(node.pos);

        // The boat can only stop (and repair) on an empty tile, or stand still on its own.
        if (here !== undefined && !isSamePosition(node.pos, unit.data.position)) {
          continue;
        }

        const targets: { direction: Direction; position: Position }[] = [];

        for (const dir of allDirections) {
          const adjacent = addDirection(node.pos, dir);
          const adjacentUnit = match.getUnit(adjacent);

          if (
            adjacentUnit !== undefined &&
            adjacentUnit.player.team === unit.player.team &&
            !isSamePosition(adjacent, unit.data.position)
          ) {
            targets.push({ direction: dir, position: adjacent });
          }
        }

        if (targets.length > 0) {
          repairsByTile.push({ from: node.pos, targets });
        }
      }
    }

    return {
      position: unit.data.position,
      type: unit.data.type,
      isReady: unit.data.isReady,
      // Tiles this unit can move to, each with its shortest-path parent (for a plain parent-walk) and
      // the movement cost to ENTER it (for cursor-drawn manual routing — the client sums these along
      // the traced path and checks against `movementPoints`). Fog-aware: pathfinding only blocks on
      // enemies the owner can see, so a hidden unit doesn't shrink this set. Empty once the unit acted.
      reachableTiles: Array.from(nodes.values()).map((node) => ({
        position: node.pos,
        parent: node.parent,
        cost: unit.getMovementCost(node.pos) ?? 0,
      })),
      // Total movement budget this turn — the ceiling for a manually-routed (non-shortest) path.
      movementPoints: unit.getMovementPoints(),
      // Enemy positions this unit can attack, keyed by the tile it fires from (see above).
      attacksByTile,
      // Friendly-occupied reachable tiles this unit can validly load/join into.
      loadableTiles,
      // Valid unload drops (cargo slot + direction) per reachable destination, for transports.
      unloadsByTile,
      // In-place / after-move ability this unit can perform (apc supply, sub/stealth dive/surface).
      ability,
      // Reachable unfired-silo tiles an infantry/mech can launch a missile from.
      launchTiles,
      // Friendly repair targets (direction + tile) per reachable destination, for black boats.
      repairsByTile,
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

  // CO power state for the acting player: the meter, its star breakdown, and each available power
  // (name + meter cost + whether it can be activated right now). All engine-derived so the client
  // renders the bar and offers activation with no rules knowledge. A power is a main action:
  // `{ type: "coPower", isSuper }`; its board effects are BE-resolved (never previewed).
  const coProperties = getCOProperties(player.data.coId);
  const starCost = player.getPowerStarCost();
  const maxMeter = player.getMaxPowerMeter();
  const canActivate = player.data.COPowerState === "no-power";

  const describePower = (isSuper: boolean) => {
    const power = isSuper ? coProperties.powers.superCOPower : coProperties.powers.COPower;

    if (power === undefined) {
      return null;
    }

    const cost = power.stars * starCost;

    return {
      name: power.name,
      stars: power.stars,
      cost,
      available: canActivate && player.data.powerMeter >= cost,
    };
  };

  const power = {
    coName: coProperties.displayName,
    state: player.data.COPowerState,
    meter: player.data.powerMeter,
    maxMeter,
    // Star breakdown for the bar: how many are lit vs the CO's total (== super stars, or CO stars
    // when the CO has no super). starCost > 0 for any CO that has a power; guard just in case. The
    // meter can briefly go negative right after a power is used, so floor at 0.
    currentStars: starCost > 0 ? Math.max(0, Math.floor(player.data.powerMeter / starCost)) : 0,
    totalStars: starCost > 0 ? Math.floor(maxMeter / starCost) : 0,
    copower: describePower(false),
    superCopower: describePower(true),
  };

  return {
    funds: player.data.funds,
    units,
    production: { priceTable, buildableTiles },
    power,
  };
};
