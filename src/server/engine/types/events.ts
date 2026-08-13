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
} from "server/core/schemas/action";
import type { Army } from "server/core/schemas/army";
import type { COID } from "server/core/schemas/co";
import type { PlayerSlot } from "server/core/schemas/player-slot";
import type { Position } from "server/core/schemas/position";
import type { WWUnit } from "server/core/schemas/unit";
import type { Weather } from "server/core/schemas/weather";
import type { CapturableTile } from "server/core/schemas/tile-state";
import type { PlayerInMatch } from "server/engine/entities/player-in-match-state";

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
  fundsGained?: number; //for joining. it is not undefined if and only if the move is a join
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
  playerId: string;
};

export type PlayerEliminatedEvent = WithPlayer & {
  type: "player-eliminated";
} & (
    | { eliminationReason: Exclude<Turn["eliminationReason"], undefined> }
    | { eliminationReason: Exclude<AttackEvent["eliminationReason"], undefined> }
    | {
        eliminationReason: Exclude<AbilityEvent["eliminationReason"], undefined>;
        capturedByPlayerId: string;
      }
    | { eliminationReason: "timer-ran-out" }
  );

type WithElimination<Reason extends string> = {
  eliminationReason?: Reason;
};

/** TODO maybe add the turn/day number */
export type Turn = WithElimination<"all-units-crashed"> & {
  newWeather: Weather | null;
  /**
   * Duration in days for a newly-drawn random weather (see getRandomWeatherDurationDays). Only set
   * when `newWeather` is a non-clear random draw; defaults to 1 day when absent (CO-power / legacy
   * events, which carry their own fixed duration through `setWeather`).
   */
  newWeatherDays?: number;
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
  discoveredProperties?: CapturableTile[];
};

type EmittableAttackParticipantInfo = {
  playerSlot: PlayerSlot;
  powerChargeGained?: number;
  position?: Position;
  HP?: number;
  usedAmmo?: boolean;
  /**
   * Only used for Sasha SCOP
   */
  damageTakenInFunds?: number;
};
export type EmittableAttackEvent = {
  type: "attack";
  attacker?: EmittableAttackParticipantInfo;
  defender?: EmittableAttackParticipantInfo;
  playerUpdate: PlayerInMatch[];
};

export type EmittableSubEvent =
  | AbilityEvent
  | WaitEvent
  | RepairEvent
  | LaunchMissileEvent
  | UnloadWaitEvent
  | EmittableAttackEvent;

export type EmittableMoveEvent = MoveEventWithoutSubEvent &
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
  WithDiscoveries & { teamIndex: number };

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

/**
 * v2 lobby/general-picker round events. Unlike {@link NonStoredEvent} these aren't all per-player
 * (a reveal/cancel is match-wide), so they carry their own optional `playerId` rather than the
 * mandatory {@link WithPlayer}. Emitted on the match room once the Match(setup) exists.
 */
export type LobbyMatchEvent = { matchId: string } & (
  | { type: "pick-started"; pickEndsAt: string }
  | { type: "co-locked"; playerId: string }
  | { type: "pick-reveal"; players: { playerId: string; coId: COID }[] }
  | { type: "match-cancelled"; reason: string; leaverIds: string[] }
);

export type Emittable = (EmittableEvent | NonStoredEvent | LobbyMatchEvent) & { matchId: string };
