import type { Player } from "@prisma/client";
import type { WithMatchId } from "server/trpc/middleware/match";
import type {
  AbilityAction,
  AttackAction,
  BuildAction,
  COPowerAction, DeleteAction,
  LaunchMissileAction,
  MoveAction,
  PassTurnAction,
  RepairAction,
  UnloadNoWaitAction,
  UnloadWaitAction,
  WaitAction,
} from "shared/schemas/action";
import type { Army } from "shared/schemas/army";
import type { COID } from "shared/schemas/co";
import type { Position } from "shared/schemas/position";
import type { WWUnit } from "shared/schemas/unit";
import type { Weather } from "shared/schemas/weather";
import type { ChangeableTile } from "./server-match-state";
import type { PlayerSlot } from "shared/schemas/player-slot";

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

export type MoveEvent<SubEventType extends SubEvent = SubEvent> = {
  trap: boolean;
  subEvent: SubEventType;
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
} & AttackAction &
  WithElimination<`all-${"attacker" | "defender"}-units-destroyed`>;

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
    | { eliminationReason: Exclude<Turn["eliminationReason"], undefined> }
    | { eliminationReason: Exclude<AttackEvent["eliminationReason"], undefined> }
    | {
        eliminationReason: Exclude<AbilityEvent["eliminationReason"], undefined>;
        capturedByPlayerId: Player["id"];
      }
    | { eliminationReason: "timer-ran-out" }
  );

type WithElimination<Reason extends string> = {
  eliminationReason?: Reason;
};

/** TODO maybe add the turn/day number */
export type Turn = WithElimination<"all-units-crashed"> & {
  newWeather: Weather | null;
};

export type PassTurnEvent = PassTurnAction & { turns: Turn[] };

export type AbilityEvent = AbilityAction &
  WithElimination<"hq-or-labs-captured" | "property-goal-reached">;

export type DeleteEvent = DeleteAction &
  WithElimination<`all-units-destroyed`>;

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
  | DeleteEvent
  | MatchEndEvent;

export type SubEvent =
  | AbilityEvent
  | WaitEvent
  | RepairEvent
  | LaunchMissileEvent
  | UnloadWaitEvent
  | AttackEvent;


type WithDiscoveries = {
  discoveredUnits?: WWUnit[];
  discoveredChangeableTiles?: ChangeableTile[]; // TODO e.g. properties / pipeseam in fog of war
}

export type EmittableSubEvent =
  | AbilityEvent
  | WaitEvent
  | RepairEvent
  | LaunchMissileEvent
  | (UnloadWaitEvent & WithDiscoveries)
  | {
      type: "attack";
      attackerHP?: number;
      attackerPlayerSlot: PlayerSlot;
      attackerPowerCharge: number;
      defenderHP?: number;
      defenderPosition?: Position;
      defenderPlayerSlot: PlayerSlot;
      defenderPowerCharge: number;
    };

export type EmittableMoveEvent = (Omit<MoveEvent, "subEvent"> & WithDiscoveries & {
  subEvent: EmittableSubEvent;
  /**
   * e.g. for when a unit moves from FoW into vision or when it's unloaded into vision
   */
  appearingUnit?: WWUnit
});

export type EmittableEvent = 
  | MatchStartEvent
  | EmittableMoveEvent
  | (UnloadNoWaitEvent & WithDiscoveries)
  | PlayerEliminatedEvent
  | (COPowerEvent & WithDiscoveries)
  | PassTurnEvent
  | (BuildEvent & WithDiscoveries)
  | DeleteEvent
  | MatchEndEvent;

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
