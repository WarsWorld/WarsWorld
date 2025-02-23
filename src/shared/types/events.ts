import type { Player } from "@prisma/client";
import type { WithMatchId } from "server/trpc/middleware/match";
import type {
  AbilityAction,
  AttackAction,
  BuildAction,
  COPowerAction,
  DeleteAction,
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
import type { PlayerSlot } from "shared/schemas/player-slot";
import type { Position } from "shared/schemas/position";
import type { WWUnit } from "shared/schemas/unit";
import type { Weather } from "shared/schemas/weather";
import type { CapturableTile, PlayerInMatch } from "./server-match-state";

/** player slot 0 implicity starts */
export type MatchStartEvent = {
  type: "matchStart";
  weather: Weather;
};

export type MatchEndEvent = {
  type: "matchEnd";
  winningTeamPlayerIds: string[] | null; // null = draw
  // TODO this type can probably be made a lot more fine-grained later on
};

export type MoveEventWithoutSubEvent = {
  trap: boolean;
} & Omit<MoveAction, "subAction">;

export type MoveEventWithSubEvent<SubEventType extends SubEvent = SubEvent> =
  MoveEventWithoutSubEvent & {
    subEvent: SubEventType;
  };

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

export type DeleteEvent = DeleteAction & WithElimination<`all-units-destroyed`>;

export type BuildEvent = BuildAction;
export type LaunchMissileEvent = LaunchMissileAction;
export type RepairEvent = RepairAction;
export type WaitEvent = WaitAction;
export type UnloadNoWaitEvent = UnloadNoWaitAction;
export type UnloadWaitEvent = UnloadWaitAction;

type MainEventsWithoutMoveEvent =
  | MatchStartEvent
  | UnloadNoWaitEvent
  | PlayerEliminatedEvent
  | COPowerEvent
  | PassTurnEvent
  | BuildEvent
  | DeleteEvent
  | MatchEndEvent;

export type MainEventWithSubEvents = MainEventsWithoutMoveEvent | MoveEventWithSubEvent;

export type MainEventsWithoutSubEvents = MainEventsWithoutMoveEvent | MoveEventWithoutSubEvent;

export type SubEvent =
  | AbilityEvent
  | WaitEvent
  | RepairEvent
  | LaunchMissileEvent
  | UnloadWaitEvent
  | AttackEvent;

type WithDiscoveries = {
  discoveredUnits?: WWUnit[];
  // TODO we need to add pipeseams to update their HP / destruction state upon discovery
  discoveredProperties?: CapturableTile[];
};

export type EmittableAttackEvent = {
  type: "attack";
  attackerHP?: number;
  attackerPosition?: Position;
  attackerPlayerSlot: PlayerSlot;
  defenderHP?: number;
  defenderPosition?: Position;
  defenderPlayerSlot: PlayerSlot;
  playerUpdate: PlayerInMatch[];
};

export type EmittableSubEvent =
  | AbilityEvent
  | WaitEvent
  | RepairEvent
  | LaunchMissileEvent
  | UnloadWaitEvent
  | EmittableAttackEvent;

export type EmittableMoveEvent = Omit<MoveEventWithSubEvent, "subEvent"> &
  WithDiscoveries & {
    subEvent: EmittableSubEvent;
    /**
     * e.g. for when a unit moves from FoW into vision or when it's unloaded into vision
     */
    appearingUnit?: WWUnit;
  };

export type EmittableEvent = (
  | MatchStartEvent
  | EmittableMoveEvent
  | UnloadNoWaitEvent
  | PlayerEliminatedEvent
  | COPowerEvent
  | PassTurnEvent
  | BuildEvent
  | DeleteEvent
  | MatchEndEvent
) &
  WithDiscoveries & { playerId: string };

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
        type: "player-picked-slot";
        slot: PlayerSlot;
      }
    | {
        type: "player-left";
      }
    | {
        type: "player-changed-ready-status";
        ready: boolean;
      }
  );

export type Emittable = (EmittableEvent | NonStoredEvent) & { matchId: string };
