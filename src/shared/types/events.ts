import type { Player } from "@prisma/client";
import type { WithMatchId } from "server/trpc/middleware/match";
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
  WaitAction
} from "shared/schemas/action";
import type { Army } from "shared/schemas/army";
import type { CO } from "shared/schemas/co";
import type {
  UnitWithHiddenStats,
  UnitWithVisibleStats
} from "shared/schemas/unit";
import type { Weather } from "shared/schemas/weather";

/** player slot 0 implicity starts */
export type MatchStartEvent = {
  type: "match-start";
  weather: Weather;
};

export type MatchEndEvent = {
  type: "match-end";
  winningTeamPlayerIds: string[] | null; // null = draw
  // TODO this type can probably be made a lot more fine-grained later on
};

export type MoveEvent = {
  trap: boolean;
  subEvent: SubEvent;
} & Omit<MoveAction, "subAction">;

export type AttackEvent = {
  /**
   * The new defender HP after the attack.
   */
  defenderHP: number;
  /**
   * The new attacker HP after the attack.
   * If undefined, that means HP is unchanged
   * because there was no counter-attack.
   */
  attackerHP?: number;
} & AttackAction;

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

export type EmittableEvent = MainEvent &
  WithMatchId & {
    discoveredUnits?: (UnitWithHiddenStats | UnitWithVisibleStats)[];
    eventIndex: number;
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
