import { PlayerSlot } from "server/schemas/player-slot";
import { MovementType } from "../units/movement-type";
import { TileType } from "server/schemas/tile";

/** A nonzero integer (or null for impassible) for every possible "movement type". */
export type TileMovementCosts = Record<MovementType, number | null>;

export interface BaseAbstractTile {
  /**
   * An integer from 0 to 4 which modifies the amount of damage
   * a unit on this tile takes from attacks.
   */
  defenseStars: number;
  /** Normal movement costs for every "movement type", ignoring COs and weather. */
  movementCosts: TileMovementCosts;
}

export interface AbstractProperty extends BaseAbstractTile {
  isProperty: true;
  providesFunds: boolean;
  /** undefined if it does not resupply */
  resuppliedMovementTypes?: readonly MovementType[];
  /** undefined if this is currently neutral */
  owningPlayer?: PlayerSlot;
  /** undefined if nobody is capturing it */
  captureStatus?: {
    capturingPlayer: PlayerSlot;
    /** A number from 0 to 20 */
    captureHp: number;
  };
}

/**
 * For example, 'base' or 'port' or 'airport'.
 */
export interface AbstractProductionBuilding extends AbstractProperty {
  isProperty: true;
  buildableMovementTypes: readonly MovementType[];
}

/**
 * For example, an unbroken pipe seam can become a broken pipe seam.
 * Another example, an unfired missile silo can bevome a fired missile silo.
 */
export interface AbstractChangableTile extends BaseAbstractTile {
  canBecomeTile: TileType;
}

/**
 * For example, an unbroken pipe seam can become a broken pipe seam.
 */
export interface AbstractDestructibleTile extends AbstractChangableTile {
  canBecomeTile: TileType;
  maxHp: number;
  /** if undefined, assume it is the same as maxHp */
  currentHp?: number;
}

export type AbstractTile =
  | BaseAbstractTile
  | AbstractProperty
  | AbstractProductionBuilding
  | AbstractChangableTile
  | AbstractDestructibleTile;
