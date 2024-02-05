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
import type { ChatMessageFrontend } from "./chat-message";
import type { CapturableTile } from "./server-match-state";
/**
 * =============== READ ME ===============
 * TERMINOLOGY:
 * - Events: Stored match actions used for match replays.
 *   They have a specific table in the database. For more info, check the prisma schema.
 *      e.g. Creating a unit
 * - Emittables: Actions that are broadcasted to subscribers using websockets.
 *      e.g. In-match chat box messages
 *
 * IMPORTANT NOTES:
 * -  Most events are emittables
 *      For the few that are not, they need to be modified and explicitly
 *      named emittable as some information needs to be hidden from the client.
 *      For example, MoveEvent to EmittableMoveEvent for FoW.
 * -  Not all emittables are events.
 *      For example, ChatMessageEmittable is not an event and
 *      not stored as an event in the database.
 *      They are label emittables for sending and receiving messsages real time.
 */

// =============== CHAT MESSAGE EMITTABLE ===============
export type ChatMessageEmittable = {
  type: "chatMessage";
} & ChatMessageFrontend;

// =============== MAIN EVENTS ===============
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

export type MoveEvent<SubEventType extends SubEvent = SubEvent> = {
  trap: boolean;
  subEvent: SubEventType;
} & Omit<MoveAction, "subAction">;

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

export type BuildEvent = BuildAction;

export type DeleteEvent = DeleteAction & WithElimination<`all-units-destroyed`>;

export type UnloadNoWaitEvent = UnloadNoWaitAction;

export type MainEvent =
  | MatchStartEvent
  | MatchEndEvent
  | MoveEvent
  | COPowerEvent
  | PlayerEliminatedEvent
  | PassTurnEvent
  | BuildEvent
  | DeleteEvent
  | UnloadNoWaitEvent;

// =============== EMITTABLE MAIN EVENTS ===============
type EmittableMoveEvent = Omit<MoveEvent, "subEvent"> &
  WithDiscoveries & {
    subEvent: EmittableSubEvent;
    /**
     * e.g. for when a unit moves from FoW into vision or when it's unloaded into vision
     */
    appearingUnit?: WWUnit;
  };

type WithDiscoveries = {
  discoveredUnits?: WWUnit[];
  discoveredProperties?: CapturableTile[];
};

export type EmittableMainEvent = (
  | MatchStartEvent
  | MatchEndEvent
  | EmittableMoveEvent // difference from MainEvent
  | COPowerEvent
  | PlayerEliminatedEvent
  | PassTurnEvent
  | BuildEvent
  | DeleteEvent
  | UnloadNoWaitEvent
) &
  WithDiscoveries;

// =============== SUB EVENTS ===============
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

export type AbilityEvent = AbilityAction &
  WithElimination<"hq-or-labs-captured" | "property-goal-reached">;

export type WaitEvent = WaitAction;

export type RepairEvent = RepairAction;

export type LaunchMissileEvent = LaunchMissileAction;

export type UnloadWaitEvent = UnloadWaitAction;

export type SubEvent =
  | AttackEvent
  | AbilityEvent
  | WaitEvent
  | RepairEvent
  | LaunchMissileEvent
  | UnloadWaitEvent;

// =============== EMITTABLE SUB EVENTS ===============
type EmittableAttackEvent = {
  type: "attack";
  attackerHP?: number;
  attackerPlayerSlot: PlayerSlot;
  attackerPowerCharge: number;
  defenderHP?: number;
  defenderPosition?: Position;
  defenderPlayerSlot: PlayerSlot;
  defenderPowerCharge: number;
} & WithElimination<`all-${"attacker" | "defender"}-units-destroyed`>;

export type EmittableSubEvent =
  | EmittableAttackEvent // difference from SubEvent
  | AbilityEvent
  | WaitEvent
  | RepairEvent
  | LaunchMissileEvent
  | UnloadWaitEvent;

// =============== MATCH EMITTABLES ===============
export type MatchEmittable = WithPlayer &
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

export type Emittable = (EmittableMainEvent | MatchEmittable | ChatMessageEmittable) & {
  matchId: string;
};
