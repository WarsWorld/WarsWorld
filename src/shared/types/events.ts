import { Player } from "@prisma/client";
import {
  AbilityAction,
  AttackAction,
  BuildAction,
  COPowerAction,
  LaunchMissileAction,
  MoveAction,
  PassTurnAction,
  RepairAction,
  SuperCOPowerAction,
  UnloadAction,
  WaitAction,
} from "server/schemas/action";
import { CO } from "server/schemas/co";
import { WWUnit } from "server/schemas/unit";
import { Weather } from "shared/match-logic/tiles";
import { Army } from "../../server/schemas/army";

// TODO: Maybe add who's player's turn it is or which army starts?
export interface MatchStartEvent {
  type: "match-start";
  weather: Weather;
}

export type MatchEndEvent = {
  type: "match-end";
  condition: string;
  winningTeamPlayerIds: string[] | null; // null = draw
  // TODO this type can probably be made a lot more fine-grained later on
};

export interface MoveEvent extends MoveAction {
  trap?: boolean;
}

export interface InvalidActionEvent {
  type: "invalid-action";
  reason: string;
}

export interface UnloadEvent extends UnloadAction {
  unloadedUnit: WWUnit;
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

export interface PlayerPickedArmyEvent extends WithPlayer {
  type: "player-picked-army";
  army: Army;
}

export interface PlayerEliminated extends WithPlayer {
  type: "player-eliminated";
}

// TODO maybe add the turn/day number
// TODO important! add repairs, fuel drain, loss condition like
// last unit was a fighter and crashed etc.
export interface PassTurnEvent extends PassTurnAction {
  newWeather?: Weather;
}

export type AbilityEvent = AbilityAction;
export type BuildEvent = BuildAction;
export type LaunchMissileEvent = LaunchMissileAction;
export type RepairEvent = RepairAction;
export type WaitEvent = WaitAction;

export type WWEvent =
  | MatchStartEvent
  | MoveEvent
  | UnloadEvent
  | AttackEvent
  | PlayerJoinedEvent
  | PlayerLeftEvent
  | PlayerChangedReadyStatusEvent
  | PlayerPickedCOEvent
  | PlayerPickedArmyEvent
  | PlayerEliminated
  | COPowerEvent
  | SuperCOPowerEvent
  | PassTurnEvent
  | AbilityEvent
  | BuildEvent
  | LaunchMissileEvent
  | RepairEvent
  | WaitEvent;

export type EmittableEvent = WWEvent & {
  matchId: string;
  discoveredUnits?: WWUnit[];
};
