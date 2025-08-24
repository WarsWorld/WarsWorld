/**
 * AI Game State Representation
 * 
 * These types represent a simplified, immutable game state
 * optimized for AI decision-making and minimax algorithms.
 * They are decoupled from the game engine implementation.
 */

export interface AIGameState {
  currentPlayerIndex: number;
  players: AIPlayer[];
  units: AIUnit[];
  tiles: AITile[];
  mapSize: { width: number; height: number };
  turn: number;
  weather?: AIWeather;
  fogOfWar: boolean;
}

export interface AIPlayer {
  id: string;
  index: number;
  teamIndex: number;
  funds: number;
  isAI: boolean;
  coName?: string;
  coPowerCharge?: number;
  coPowerActive?: boolean;
}

export interface AIUnit {
  id: string;
  type: string;
  playerIndex: number;
  position: AIPosition;
  hp: number;
  fuel: number;
  ammo?: number;
  isReady: boolean;
  captureProgress?: number;
  loadedUnits?: string[]; // Unit IDs that are loaded in this transport
}

export interface AITile {
  position: AIPosition;
  type: string;
  ownerIndex?: number; // Player index that owns this property
  capturePoints?: number; // Remaining capture points for capturable tiles
  variant?: string; // For tiles with multiple visual variants
}

export interface AIWeather {
  type: "clear" | "rain" | "snow";
  daysRemaining: number;
}

export type AIPosition = [number, number]; // [x, y]

export interface AIAction {
  type: "move" | "attack" | "build" | "capture" | "load" | "unload" | "endTurn";
  unitId?: string;
  from?: AIPosition;
  to?: AIPosition;
  targetPosition?: AIPosition;
  unitType?: string; // For build actions
  unloadPositions?: AIPosition[]; // For unload actions
}

/**
 * Result of evaluating a game state
 */
export interface AIStateEvaluation {
  score: number;
  factors: {
    unitValue: number;
    territoryControl: number;
    positionAdvantage: number;
    economicAdvantage: number;
  };
}

/**
 * Utility functions for working with positions
 */
export function isSamePosition(pos1: AIPosition, pos2: AIPosition): boolean {
  return pos1[0] === pos2[0] && pos1[1] === pos2[1];
}

export function getManhattanDistance(pos1: AIPosition, pos2: AIPosition): number {
  return Math.abs(pos1[0] - pos2[0]) + Math.abs(pos1[1] - pos2[1]);
}

export function isPositionInBounds(
  position: AIPosition,
  mapSize: { width: number; height: number }
): boolean {
  return (
    position[0] >= 0 &&
    position[0] < mapSize.width &&
    position[1] >= 0 &&
    position[1] < mapSize.height
  );
}

/**
 * Deep clone a game state for immutable operations
 */
export function cloneGameState(state: AIGameState): AIGameState {
  return structuredClone(state);
}