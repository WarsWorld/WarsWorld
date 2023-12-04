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
import type { COID } from "shared/schemas/co";
import type { Position } from "shared/schemas/position";
import type { WWUnit } from "shared/schemas/unit";
import type { Weather } from "shared/schemas/weather";
import type { ChangeableTile } from "./server-match-state";

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

export type COPowerEvent = COPowerAction & {
  /** used for rachel, von-bolt and sturm SCOPs */
  positions?: Position[];
};

type WithPlayer = {
  playerId: Player["id"];
};

export type PlayerEliminatedEvent = WithPlayer & {
  type: "player-eliminated";
} & (
  { eliminationType: "all-units-destroyed" }
  | { eliminationType: "hq-or-labs-captured", capturedByPlayerId: Player["id"] }
  | { eliminationType: "timer-ran-out" }
);

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
  | PlayerEliminatedEvent
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
    discoveredUnits?: WWUnit[];
    discoveredChangeableTiles?: ChangeableTile[]; // TODO e.g. properties / pipeseam in fog of war
    index: number;
  };

export type NonStoredEvent = WithPlayer &
  WithMatchId &
  (
    | {
        type: "player-joined";
      }
    | {
        type: "player-picked-co";
        coId: COID;
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
