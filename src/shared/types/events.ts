import type { Player } from "@prisma/client";
import type { WithMatchId } from "server/trpc/middleware/match";
import type { Weather } from "shared/match-logic/tiles";
import type {
  AbilityAction,
  AttackAction,
  BuildAction,
  COPowerAction,
  LaunchMissileAction,
  MoveAction,
  PassTurnAction,
  RepairAction,
  UnloadNoWaitAction,
  UnloadWaitAction,
  WaitAction,
} from "shared/schemas/action";
import type { Army } from "shared/schemas/army";
import type { CO } from "shared/schemas/co";
import type { WWUnit } from "shared/schemas/unit";

// TODO: Maybe add who's player's turn it is or which army starts?
export type MatchStartEvent = {
  type: "match-start";
  weather: Weather;
};

export type MatchEndEvent = {
  type: "match-end";
  winningTeamPlayerIds: string[] | null; // null = draw
  // TODO this type can probably be made a lot more fine-grained later on
};

export interface MoveEvent extends Omit<MoveAction, "subAction"> {
  trap: boolean;
  subEvent: SubEvent;
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

export type COPowerEvent = COPowerAction;

type WithPlayer = {
  playerId: Player["id"];
};

export type PlayerEliminated = WithPlayer & {
  type: "player-eliminated";
  condition: string;
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

export type MainEvent =
  | MatchStartEvent
  | MoveEvent
  | UnloadNoWaitEvent
  | PlayerEliminated
  | COPowerEvent
  | PassTurnEvent
  | BuildEvent
  | MatchEndEvent;

export type SubEvent =
  | AbilityEvent
  | WaitEvent
  | RepairEvent
  | LaunchMissileEvent
  | UnloadWaitEvent
  | AttackEvent;

/**
 * TODO to handle non-stored things like player-join etc.
 * maybe just make a different kind of "event" called "change" or something?
 * or "loggedevent" vs. "nonloggedevent" ? probably way too verbose.
 */

export type EmittableEvent = MainEvent &
  WithMatchId & {
    discoveredUnits?: WWUnit[];
  };

export type NonStoredEvent = WithPlayer &
  WithMatchId &
  (
    | {
        type: "player-joined";
      }
    | {
        type: "player-picked-co";
        co: CO;
      }
    | {
        type: "player-picked-army";
        army: Army;
      }
    | {
        type: "player-left";
      }
    | {
        type: "player-changed-ready-status";
        ready: boolean;
      }
  );

export type Emittable = EmittableEvent | NonStoredEvent;
