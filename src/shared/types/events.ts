import type { Match, Player } from "@prisma/client";
import type {
  AbilityAction,
  AttackAction,
  BuildAction,
  COPowerAction,
  LaunchMissileAction,
  PassTurnAction,
  RepairAction,
  SuperCOPowerAction,
  UnloadWaitAction,
  UnloadNoWaitAction,
  WaitAction,
  MoveAction,
} from "server/schemas/action";
import type { CO } from "server/schemas/co";
import type { WWUnit } from "server/schemas/unit";
import type { Weather } from "shared/match-logic/tiles";
import type { Army } from "../../server/schemas/army";

// TODO: Maybe add who's player's turn it is or which army starts?
export type MatchStartEvent = {
  type: "match-start";
  weather: Weather;
};

export type MatchEndEvent = {
  type: "match-end";
  condition: string;
  winningTeamPlayerIds: string[] | null; // null = draw
  // TODO this type can probably be made a lot more fine-grained later on
};

export interface MoveEvent extends Omit<MoveAction, "subAction"> {
  trap: boolean;
  subEvent: WWEvent;
}

export type InvalidActionEvent = {
  type: "invalid-action";
  reason: string;
};

/*export interface UnloadWaitEvent extends UnloadWaitAction {
  unloadedUnit: WWUnit;
};

export interface UnloadNoWaitEvent extends UnloadNoWaitAction {
  unloadedUnit: WWUnit;
}*/ //why is unloaded unit specified?

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

export type COPowerEvent = COPowerAction & {
  rngRoll?: number;
};

export type SuperCOPowerEvent = SuperCOPowerAction & {
  rngRoll?: number;
};

type WithPlayer = {
  playerId: Player["id"];
};

export type PlayerJoinedEvent = WithPlayer & {
  type: "player-joined";
};

export type PlayerLeftEvent = WithPlayer & {
  type: "player-left";
};

export type PlayerChangedReadyStatusEvent = WithPlayer & {
  type: "player-changed-ready-status";
  ready: boolean;
};

export type PlayerPickedCOEvent = WithPlayer & {
  type: "player-picked-co";
  co: CO;
};

export type PlayerPickedArmyEvent = WithPlayer & {
  type: "player-picked-army";
  army: Army;
};

export type PlayerEliminated = WithPlayer & {
  type: "player-eliminated";
};

// TODO maybe add the turn/day number
// TODO important! add repairs, fuel drain, loss condition like
// last unit was a fighter and crashed etc.
export type PassTurnEvent = PassTurnAction & {
  newWeather?: Weather;
};

export type AbilityEvent = AbilityAction;
export type BuildEvent = BuildAction;
export type LaunchMissileEvent = LaunchMissileAction;
export type RepairEvent = RepairAction;
export type WaitEvent = WaitAction;
export type UnloadNoWaitEvent = UnloadNoWaitAction;
export type UnloadWaitEvent = UnloadWaitAction;

export type WWEvent =
  | MatchStartEvent
  | MoveEvent
  | UnloadNoWaitEvent
  | UnloadWaitEvent
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
  matchId: Match["id"];
  discoveredUnits?: WWUnit[];
};
