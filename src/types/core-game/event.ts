import { Player } from "@prisma/client";
import {
  AbilityAction,
  AttackAction,
  AttemptMoveAction,
  BuildAction,
  COPowerAction,
  EndTurnAction,
  ForfeitAction,
  MissileSiloAction,
  RepairAction,
  RequestDrawAction,
  SuperCOPowerAction,
  UnloadAction,
  WaitAction,
} from "components/schemas/action";
import { CO } from "components/schemas/co";
import { Unit } from "components/schemas/unit";

export interface MatchStartEvent {
  type: "match-start"; // maybe add who's player's turn it is or which army starts?
}

export interface AttemptMoveEvent extends AttemptMoveAction {
  trap?: Unit;
  discovered?: Unit[];
}

export interface InvalidActionEvent {
  type: "invalid-action";
  reason: string;
}

export interface UnloadEvent extends UnloadAction {
  unloadedUnit: Unit;
}

export interface AttackEvent extends AttackAction {
  defenderHP: number; // we could probably derive these as well if we just submit the rolled luck value
  attackerHP?: number; // missing means no counter-attack
}

export interface PlayerJoinedEvent {
  type: "player-joined";
  player: Player;
  playerSlot: number;
}

export interface PlayerLeftEvent {
  type: "player-left";
  player: Player;
}

export interface PlayerChangedReadyStatusEvent {
  type: "player-changed-ready-status";
  player: Player;
  ready: boolean;
}

export interface PlayerPickedCOEvent {
  type: "player-picked-co";
  player: Player;
  co: CO;
}

export type WWEvent =
  | MatchStartEvent
  | EndTurnAction // maybe add the turn/day number?
  | BuildAction
  | AttemptMoveEvent
  | InvalidActionEvent
  | WaitAction
  | AbilityAction
  | MissileSiloAction
  | UnloadEvent
  | AttackEvent
  | RepairAction
  | COPowerAction
  | SuperCOPowerAction
  | RequestDrawAction
  | ForfeitAction
  | PlayerJoinedEvent
  | PlayerLeftEvent
  | PlayerChangedReadyStatusEvent
  | PlayerPickedCOEvent;

export type EmittableEvent = WWEvent & { matchId: string };
