import { Player } from "@prisma/client";
import {
  AttackAction,
  COPowerAction,
  DirectPersistableAction,
  MoveAction,
  SuperCOPowerAction,
  UnloadAction,
} from "server/schemas/action";
import { CO } from "server/schemas/co";
import { UnitDuringMatch } from "server/schemas/unit";

// TODO: Maybe add who's player's turn it is or which army starts?
export interface MatchStartEvent {
  type: "match-start";
}

export interface MoveEvent extends MoveAction {
  trap?: boolean;
}

export interface InvalidActionEvent {
  type: "invalid-action";
  reason: string;
}

export interface UnloadEvent extends UnloadAction {
  unloadedUnit: UnitDuringMatch;
}

export interface AttackEvent extends AttackAction {
  /**
   * The new defender HP after the attack.
   * TODO: Consider sending just the luck roll(s) for the event,
   *       and calculating HP later.
   */
  defenderHP: number;
  /**
   * The new attacker HP after the attack.
   * If undefined, that means HP is unchanged
   * because there was no counter-attack.
   * TODO: Consider sending just the luck roll(s) for the event,
   *       and calculating HP later.
   */
  attackerHP?: number;
}

export interface COPowerEvent extends COPowerAction {
  rngRoll?: number;
}

export interface SuperCOPowerEvent extends SuperCOPowerAction {
  rngRoll?: number;
}

interface WithPlayer {
  player: Player;
}

export interface PlayerJoinedEvent extends WithPlayer {
  type: "player-joined";
  playerSlot: number;
}

export interface PlayerLeftEvent extends WithPlayer {
  type: "player-left";
}

export interface PlayerChangedReadyStatusEvent extends WithPlayer {
  type: "player-changed-ready-status";
  ready: boolean;
}

export interface PlayerPickedCOEvent extends WithPlayer {
  type: "player-picked-co";
  co: CO;
}

export interface PlayerEliminated extends WithPlayer {
  type: "player-eliminated";
}

export type WWEvent =
  | MatchStartEvent
  | MoveEvent
  | UnloadEvent
  | AttackEvent
  | PlayerJoinedEvent
  | PlayerLeftEvent
  | PlayerChangedReadyStatusEvent
  | PlayerPickedCOEvent
  | PlayerEliminated
  | COPowerEvent
  | SuperCOPowerEvent
  | DirectPersistableAction;

export type EmittableEvent = WWEvent & {
  matchId: string;
  discoveredUnits?: UnitDuringMatch[];
};
