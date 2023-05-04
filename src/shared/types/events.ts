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

export interface MatchStartEvent {
  type: "match-start"; // maybe add who's player's turn it is or which army starts?
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
  defenderHP: number; // we could probably derive these as well if we just submit the rolled luck value
  attackerHP?: number; // missing means no counter-attack
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
