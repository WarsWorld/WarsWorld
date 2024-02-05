import type { WithMatchId } from "server/trpc/middleware/match";
import type { Army } from "shared/schemas/army";
import type { COID } from "shared/schemas/co";
import type { PlayerSlot } from "shared/schemas/player-slot";
import type { Position } from "shared/schemas/position";
import type { WWUnit } from "shared/schemas/unit";
import type { ChatMessageFrontend } from "./chat-message";
import type {
  AbilityEvent,
  BuildEvent,
  COPowerEvent,
  DeleteEvent,
  LaunchMissileEvent,
  MatchEndEvent,
  MatchStartEvent,
  MoveEvent,
  PassTurnEvent,
  PlayerEliminatedEvent,
  RepairEvent,
  UnloadNoWaitEvent,
  UnloadWaitEvent,
  WaitEvent,
  WithElimination,
  WithPlayer,
} from "./events";
import type { CapturableTile } from "./server-match-state";

// =============== CHAT MESSAGE EMITTABLE ===============
export type ChatMessageEmittable = {
  type: "chatMessage";
} & ChatMessageFrontend;

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
