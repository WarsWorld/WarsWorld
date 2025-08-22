import { matchStore } from "server/match-store";
import { performAction } from "server/services/perform-action";
import { getAccessibleNodes, reconstructPath } from "shared/match-logic/pathfinding";
import type { BuildAction, MoveAction, PassTurnAction } from "shared/schemas/action";
import type { Position } from "shared/schemas/position";
import { isUnitProducingProperty } from "shared/schemas/tile";
import type { MatchWrapper } from "shared/wrappers/match";
import type { PlayerInMatchWrapper } from "shared/wrappers/player-in-match";

// Maximum actions per AI turn to prevent infinite loops
const MAX_AI_ACTIONS = 10;

// Track AI processing to prevent re-entrancy
const aiProcessingMatches = new Set<string>();

export const runAiTurn = async (matchId: string): Promise<void> => {
  // Prevent re-entrancy
  if (aiProcessingMatches.has(matchId)) {
    console.log(`AI already processing for match ${matchId}`);
    return;
  }

  aiProcessingMatches.add(matchId);

  try {
    const match = matchStore.get(matchId);

    if (!match) {
      console.error(`Match ${matchId} not found`);
      return;
    }

    const currentPlayer = match.getCurrentTurnPlayer();

    if (currentPlayer === undefined) {
      console.error(`No current turn player for match ${matchId}`);
      return;
    }

    // Check if this is actually a computer player
    // For now, we check by ID, but this should be updated to use the PlayerKind enum
    if (currentPlayer.data.id !== "computer-player-001") {
      console.log(`Player ${currentPlayer.data.id} is not a computer player`);
      return;
    }

    console.log(`Starting AI turn for player ${currentPlayer.data.id} in match ${matchId}`);

    let actionCount = 0;
    let _actionsTaken = false;

    // Phase 1: Move one Infantry unit randomly (do this first to free up factory tiles)
    const moved = await moveRandomInfantry(match, currentPlayer);

    if (moved) {
      actionCount++;
      _actionsTaken = true;
    }

    // Phase 2: Build Infantry at all available factories (after moving units off factories)
    if (actionCount < MAX_AI_ACTIONS) {
      const builtAtFactories = await buildInfantryAtFactories(match, currentPlayer);
      actionCount += builtAtFactories;
      _actionsTaken = _actionsTaken || builtAtFactories > 0;

      // Phase 3: Pass turn
      console.log(
        `AI completed ${actionCount} actions (moved ${moved ? 1 : 0} unit, built ${builtAtFactories} Infantry), passing turn`,
      );
    } else {
      // Phase 3: Pass turn
      console.log(`AI completed ${actionCount} actions, passing turn`);
    }
    await passTurn(match, currentPlayer);
  } catch (error) {
    console.error(`AI turn failed for match ${matchId}:`, error);

    // Try to pass turn even if AI logic fails
    try {
      const match = matchStore.get(matchId);

      if (match) {
        const currentPlayer = match.getCurrentTurnPlayer();

        if (currentPlayer !== undefined) {
          await passTurn(match, currentPlayer);
        }
      }
    } catch (passError) {
      console.error(`Failed to pass turn after AI error:`, passError);
    }
  } finally {
    aiProcessingMatches.delete(matchId);
  }
};

const buildInfantryAtFactories = async (
  match: MatchWrapper,
  player: PlayerInMatchWrapper,
): Promise<number> => {
  let builtCount = 0;
  const infantryCost = 1000; // TODO: Get from unit properties

  // Find all factories owned by the AI player
  for (const tile of match.changeableTiles) {
    if (tile.playerSlot !== player.data.slot) {
      continue;
    }

    // Check if this is a unit-producing property
    if (!isUnitProducingProperty(tile)) {
      continue;
    }

    // Check if we have enough funds
    if (player.data.funds < infantryCost) {
      console.log(`AI player has insufficient funds (${player.data.funds}) to build Infantry`);
      break;
    }

    // Check if there's already a unit at this position
    const position: Position = [tile.position[0], tile.position[1]];

    if (match.getUnit(position)) {
      continue;
    }

    // Only build at bases (factories) for Infantry
    if (tile.type !== "base") {
      continue;
    }

    // Build Infantry
    const buildAction: BuildAction = {
      type: "build",
      playerId: player.data.id,
      matchId: match.id,
      unitType: "infantry",
      position: position,
    };

    try {
      console.log(`AI building Infantry at position [${position[0]}, ${position[1]}]`);
      await performAction(match, buildAction, true);
      builtCount++;

      // Update funds (performAction should handle this, but we track it for our logic)
      player.data.funds -= infantryCost;

      // Continue to next factory to build more Infantry
    } catch (error) {
      console.error(`Failed to build Infantry at [${position[0]}, ${position[1]}]:`, error);
    }
  }

  return builtCount;
};

const moveRandomInfantry = async (
  match: MatchWrapper,
  player: PlayerInMatchWrapper,
): Promise<boolean> => {
  // Get all Infantry units owned by the AI
  const infantryUnits = player
    .getUnits()
    .filter((unit) => unit.data.type === "infantry" && unit.data.isReady);

  if (infantryUnits.length === 0) {
    console.log("AI has no ready Infantry units to move");
    return false;
  }

  // Pick a random Infantry
  const randomIndex = Math.floor(Math.random() * infantryUnits.length);
  const unit = infantryUnits[randomIndex];

  // Get accessible tiles for this unit
  const accessibleNodes = getAccessibleNodes(match, unit);

  // Filter out the current position
  const moveOptions: Position[] = [];

  for (const [pos, _node] of accessibleNodes) {
    // Don't include current position
    if (pos[0] === unit.data.position[0] && pos[1] === unit.data.position[1]) {
      continue;
    }

    // Check if position is occupied by another unit
    const occupyingUnit = match.getUnit(pos);

    if (occupyingUnit && occupyingUnit !== unit) {
      continue;
    }

    moveOptions.push(pos);
  }

  if (moveOptions.length === 0) {
    console.log(
      `Infantry at [${unit.data.position[0]}, ${unit.data.position[1]}] has no valid moves`,
    );
    return false;
  }

  // Pick a random destination
  const randomDestIndex = Math.floor(Math.random() * moveOptions.length);
  const destination = moveOptions[randomDestIndex];

  // Reconstruct the path
  const path = reconstructPath(accessibleNodes, destination);

  if (!path) {
    console.log(`Failed to reconstruct path to [${destination[0]}, ${destination[1]}]`);
    return false;
  }

  // Create move action
  const moveAction: MoveAction = {
    type: "move",
    playerId: player.data.id,
    matchId: match.id,
    path: path,
    subAction: {
      type: "wait",
    },
  };

  try {
    console.log(
      `AI moving Infantry from [${unit.data.position[0]}, ${unit.data.position[1]}] to [${destination[0]}, ${destination[1]}]`,
    );
    await performAction(match, moveAction, true);
    return true;
  } catch (error) {
    console.error(`Failed to move Infantry:`, error);
    return false;
  }
};

const passTurn = async (match: MatchWrapper, player: PlayerInMatchWrapper): Promise<void> => {
  const passTurnAction: PassTurnAction = {
    type: "passTurn",
    playerId: player.data.id,
    matchId: match.id,
  };

  try {
    await performAction(match, passTurnAction, true);
  } catch (error) {
    console.error("Failed to pass turn:", error);
    throw error;
  }
};
