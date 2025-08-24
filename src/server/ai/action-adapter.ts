import type { MatchWrapper } from "shared/wrappers/match";
import type { Position } from "shared/schemas/position";
import { performAction } from "server/services/perform-action";
import type { BuildAction, MoveAction, PassTurnAction } from "shared/types/actions";

/**
 * Adapter that provides a game-engine-agnostic interface for AI actions.
 * This decouples the AI logic from the specific implementation of the game engine.
 */
export class PerformActionAdapter {
  constructor(private match: MatchWrapper) {}

  /**
   * Move a unit along a path
   * @param unitId The unique ID of the unit to move (format: "x,y")
   * @param path Array of positions forming the movement path
   */
  async moveUnit(unitId: string, path: Position[]): Promise<void> {
    // Extract position from unitId (format: "x,y")
    const parts = unitId.split(",");

    if (parts.length !== 2) {
      throw new Error(`Invalid unit ID format: ${unitId}. Expected "x,y"`);
    }

    const fromPosition: Position = [parseInt(parts[0]), parseInt(parts[1])];

    // Find the unit at this position
    const unit = this.match.getUnit(fromPosition);

    if (!unit) {
      throw new Error(`Unit not found at position ${unitId}`);
    }

    // Create move action with wait subaction
    const action: MoveAction = {
      type: "move",
      path: path,
      playerId: unit.player.data.id,
      subAction: { type: "wait" },
    };

    try {
      await performAction(this.match, action, false);
    } catch (error) {
      // Game engine rejected the action - this indicates a bug in the AI
      throw new Error(
        `AI BUG: Move action rejected by game engine. Unit: ${unitId}, Path: ${JSON.stringify(path)}. ` +
          `Original error: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Attack with a unit
   * @param unitId The unique ID of the attacking unit
   * @param path Array of positions forming the movement path (AI should have calculated optimal position)
   * @param targetPosition The position of the target to attack
   */
  async attackWithUnit(unitId: string, path: Position[], targetPosition: Position): Promise<void> {
    // Extract position from unitId (format: "x,y")
    const parts = unitId.split(",");

    if (parts.length !== 2) {
      throw new Error(`Invalid unit ID format: ${unitId}. Expected "x,y"`);
    }

    const fromPosition: Position = [parseInt(parts[0]), parseInt(parts[1])];

    const unit = this.match.getUnit(fromPosition);

    if (!unit) {
      throw new Error(`Unit not found at position ${unitId}`);
    }

    // AI is responsible for calculating the correct path:
    // - For indirect units: path should be [currentPosition]
    // - For direct units: path should lead to adjacent position to target
    const action: MoveAction = {
      type: "move",
      path: path,
      playerId: unit.player.data.id,
      subAction: {
        type: "attack",
        defenderPosition: targetPosition,
      },
    };

    try {
      await performAction(this.match, action, false);
    } catch (error) {
      // Game engine rejected the action - this indicates a bug in the AI
      throw new Error(
        `AI BUG: Attack action rejected by game engine. Unit: ${unitId}, Path: ${JSON.stringify(path)}, Target: ${JSON.stringify(targetPosition)}. ` +
          `Original error: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Build a new unit at a factory or base
   * @param unitType The type of unit to build
   * @param position The position of the factory/base
   */
  async buildUnit(unitType: string, position: Position): Promise<void> {
    const currentPlayer = this.match.getCurrentTurnPlayer();

    const action: BuildAction = {
      type: "build",
      position: position,
      playerId: currentPlayer.data.id,
      unitType: unitType as any, // Type assertion needed due to specific unit type enum
    };

    try {
      await performAction(this.match, action, false);
    } catch (error) {
      // Game engine rejected the action - this indicates a bug in the AI
      throw new Error(
        `AI BUG: Build action rejected by game engine. Unit type: ${unitType}, Position: ${JSON.stringify(position)}. ` +
          `Original error: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Capture a property with a unit
   * @param unitId The unique ID of the capturing unit
   * @param path Array of positions forming the movement path to the property
   */
  async captureProperty(unitId: string, path: Position[]): Promise<void> {
    // Extract position from unitId (format: "x,y")
    const parts = unitId.split(",");

    if (parts.length !== 2) {
      throw new Error(`Invalid unit ID format: ${unitId}. Expected "x,y"`);
    }

    const fromPosition: Position = [parseInt(parts[0]), parseInt(parts[1])];

    const unit = this.match.getUnit(fromPosition);

    if (!unit) {
      throw new Error(`Unit not found at position ${unitId}`);
    }

    // AI is responsible for calculating the path to the property
    const action: MoveAction = {
      type: "move",
      path: path,
      playerId: unit.player.data.id,
      subAction: { type: "ability" }, // Capture is an ability action
    };

    try {
      await performAction(this.match, action, false);
    } catch (error) {
      // Game engine rejected the action - this indicates a bug in the AI
      throw new Error(
        `AI BUG: Capture action rejected by game engine. Unit: ${unitId}, Path: ${JSON.stringify(path)}. ` +
          `Original error: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * End the current player's turn
   */
  async endTurn(): Promise<void> {
    const currentPlayer = this.match.getCurrentTurnPlayer();

    const action: PassTurnAction = {
      type: "passTurn",
      playerId: currentPlayer.data.id,
    };

    try {
      await performAction(this.match, action, false);
    } catch (error) {
      // Game engine rejected the action - this indicates a bug in the AI
      throw new Error(
        `AI BUG: End turn action rejected by game engine. ` +
          `Original error: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Load a unit into a transport
   * @param unitId The unique ID of the unit to load
   * @param path Array of positions forming the movement path to the transport
   */
  async loadUnit(unitId: string, path: Position[]): Promise<void> {
    // Extract position from unitId (format: "x,y")
    const unitParts = unitId.split(",");

    if (unitParts.length !== 2) {
      throw new Error(`Invalid unit ID format: ${unitId}. Expected "x,y"`);
    }

    const unitPos: Position = [parseInt(unitParts[0]), parseInt(unitParts[1])];

    const unit = this.match.getUnit(unitPos);

    if (!unit) {
      throw new Error(`Unit not found at position ${unitId}`);
    }

    // AI is responsible for calculating the path to the transport
    const action: MoveAction = {
      type: "move",
      path: path,
      playerId: unit.player.data.id,
      subAction: { type: "wait" }, // Join happens automatically when moving onto transport
    };

    try {
      await performAction(this.match, action, false);
    } catch (error) {
      // Game engine rejected the action - this indicates a bug in the AI
      throw new Error(
        `AI BUG: Load unit action rejected by game engine. Unit: ${unitId}, Path: ${JSON.stringify(path)}. ` +
          `Original error: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Unload units from a transport
   * @param transportId The unique ID of the transport
   * @param path Array of positions forming the movement path for the transport
   * @param unitIndices Array of indices of units to unload
   * @param dropPositions Array of positions where to drop the units
   */
  async unloadUnit(
    transportId: string,
    path: Position[],
    unitIndices: number[],
    dropPositions: Position[],
  ): Promise<void> {
    // Extract position from transportId (format: "x,y")
    const parts = transportId.split(",");

    if (parts.length !== 2) {
      throw new Error(`Invalid unit ID format: ${transportId}. Expected "x,y"`);
    }

    const transportPos: Position = [parseInt(parts[0]), parseInt(parts[1])];

    const transport = this.match.getUnit(transportPos);

    if (!transport) {
      throw new Error(`Transport not found at position ${transportId}`);
    }

    // AI is responsible for calculating the path and unload positions
    const action: MoveAction = {
      type: "move",
      path: path,
      playerId: transport.player.data.id,
      subAction: {
        type: "unloadWait",
        unitIndices: unitIndices,
        dropPositions: dropPositions,
      },
    };

    try {
      await performAction(this.match, action, false);
    } catch (error) {
      // Game engine rejected the action - this indicates a bug in the AI
      throw new Error(
        `AI BUG: Unload action rejected by game engine. Transport: ${transportId}, Path: ${JSON.stringify(path)}, ` +
          `Indices: ${JSON.stringify(unitIndices)}, Drop positions: ${JSON.stringify(dropPositions)}. ` +
          `Original error: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
