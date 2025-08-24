import type { MatchWrapper } from "shared/wrappers/match";
import type { Position } from "shared/schemas/position";
import { performAction } from "server/services/perform-action";
import type { 
  BuildAction, 
  MoveAction, 
  PassTurnAction 
} from "shared/types/actions";
import type { AIPosition } from "./types";

/**
 * Adapter that provides a game-engine-agnostic interface for AI actions.
 * This decouples the AI logic from the specific implementation of the game engine.
 */
export class PerformActionAdapter {
  constructor(private match: MatchWrapper) {}

  /**
   * Move a unit along a path
   * @param unitId The unique ID of the unit to move
   * @param path Array of positions forming the movement path
   */
  async moveUnit(unitId: string, path: Position[]): Promise<void> {
    // Extract position from unitId (format: "type-x-y")
    const [type, x, y] = unitId.split("-");
    const fromPosition: Position = [parseInt(x), parseInt(y)];
    
    // Find the unit at this position
    const unit = this.match.getUnit(fromPosition);
    if (!unit) {
      throw new Error(`No unit found with ID ${unitId}`);
    }

    // Create move action with wait subaction
    const action: MoveAction = {
      type: "move",
      path: path,
      playerId: unit.player.data.id,
      subAction: { type: "wait" },
    };

    await performAction(this.match, action, true);
  }

  /**
   * Attack with a unit
   * @param unitId The unique ID of the attacking unit
   * @param targetPosition The position of the target to attack
   */
  async attackWithUnit(unitId: string, targetPosition: Position): Promise<void> {
    // Extract position from unitId
    const [type, x, y] = unitId.split("-");
    const fromPosition: Position = [parseInt(x), parseInt(y)];
    
    const unit = this.match.getUnit(fromPosition);
    if (!unit) {
      throw new Error(`No unit found with ID ${unitId}`);
    }

    // For ranged units, we might not need to move
    // For direct combat, we need to move adjacent to target
    // This is simplified - real implementation would calculate optimal attack position
    const path = [fromPosition]; // Simplified: assume unit can attack from current position

    const action: MoveAction = {
      type: "move",
      path: path,
      playerId: unit.player.data.id,
      subAction: {
        type: "attack",
        targetPosition: targetPosition,
      },
    };

    await performAction(this.match, action, true);
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

    await performAction(this.match, action, true);
  }

  /**
   * Capture a property with a unit
   * @param unitId The unique ID of the capturing unit
   * @param position The position of the property to capture
   */
  async captureProperty(unitId: string, position: Position): Promise<void> {
    // Extract position from unitId
    const [type, x, y] = unitId.split("-");
    const fromPosition: Position = [parseInt(x), parseInt(y)];
    
    const unit = this.match.getUnit(fromPosition);
    if (!unit) {
      throw new Error(`No unit found with ID ${unitId}`);
    }

    // Create path to move to the property
    const path = fromPosition[0] === position[0] && fromPosition[1] === position[1]
      ? [fromPosition] // Already on the property
      : [fromPosition, position]; // Move to the property

    const action: MoveAction = {
      type: "move",
      path: path,
      playerId: unit.player.data.id,
      subAction: { type: "ability" }, // Capture is an ability action
    };

    await performAction(this.match, action, true);
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

    await performAction(this.match, action, true);
  }

  /**
   * Load a unit into a transport
   * @param unitId The unique ID of the unit to load
   * @param transportId The unique ID of the transport
   */
  async loadUnit(unitId: string, transportId: string): Promise<void> {
    // Extract positions from IDs
    const [unitType, ux, uy] = unitId.split("-");
    const [transportType, tx, ty] = transportId.split("-");
    const unitPos: Position = [parseInt(ux), parseInt(uy)];
    const transportPos: Position = [parseInt(tx), parseInt(ty)];
    
    const unit = this.match.getUnit(unitPos);
    if (!unit) {
      throw new Error(`No unit found with ID ${unitId}`);
    }

    // Move to transport and join
    const path = [unitPos, transportPos];
    
    const action: MoveAction = {
      type: "move",
      path: path,
      playerId: unit.player.data.id,
      subAction: { type: "wait" }, // Join happens automatically when moving onto transport
    };

    await performAction(this.match, action, true);
  }

  /**
   * Unload units from a transport
   * @param transportId The unique ID of the transport
   * @param unitPosition The position where to unload the first unit
   * @param dropPosition The position where to drop the unit
   */
  async unloadUnit(
    transportId: string,
    unitPosition: Position,
    dropPosition: Position
  ): Promise<void> {
    // Extract position from transportId
    const [type, x, y] = transportId.split("-");
    const transportPos: Position = [parseInt(x), parseInt(y)];
    
    const transport = this.match.getUnit(transportPos);
    if (!transport) {
      throw new Error(`No transport found with ID ${transportId}`);
    }

    // Move transport to unload position if needed
    const path = transportPos[0] === unitPosition[0] && transportPos[1] === unitPosition[1]
      ? [transportPos]
      : [transportPos, unitPosition];

    const action: MoveAction = {
      type: "move",
      path: path,
      playerId: transport.player.data.id,
      subAction: {
        type: "unloadWait",
        unitIndices: [0], // Unload first unit
        dropPositions: [dropPosition],
      },
    };

    await performAction(this.match, action, true);
  }

  /**
   * Helper method to convert AI position to game position
   */
  private toGamePosition(aiPos: AIPosition): Position {
    return [aiPos[0], aiPos[1]];
  }

  /**
   * Helper method to check if an action is valid
   * This can be extended to add validation logic
   */
  async isActionValid(action: any): Promise<boolean> {
    // Simplified validation - in reality would check:
    // - Unit movement range
    // - Valid targets
    // - Resource availability
    // - Turn order
    return true;
  }
}