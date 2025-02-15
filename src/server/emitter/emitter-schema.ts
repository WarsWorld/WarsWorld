// Base event type
import type { Army } from "../../shared/schemas/army";
import type { COID } from "../../shared/schemas/co";

type BaseEvent = {
  type: string;
  matchId: string;
};

// Specific event types
type PlayerJoinedEvent = {
  type: "player-joined";
  playerId: string;
} & BaseEvent;

type PlayerLeftEvent = {
  type: "player-left";
  playerId: string;
} & BaseEvent;

type PlayerReadyEvent = {
  type: "player-changed-ready-status";
  playerId: string;
  ready: boolean;
} & BaseEvent;

type PlayerPickedCoEvent = {
  type: "player-picked-co";
  playerId: string;
  coId: COID; // You'll need to define this type
} & BaseEvent;

type PlayerPickedArmyEvent = {
  type: "player-picked-army";
  playerId: string;
  army: Army; // You'll need to define this type
} & BaseEvent;

type PlayerPickedSlotEvent = {
  type: "player-picked-slot";
  playerId: string;
  slot: number;
} & BaseEvent;

type MatchStartEvent = {
  type: "matchStart";
  weather: "clear" | "snow" | "rain" | "sandstorm";
} & BaseEvent;

// Union of all possible events
export type GameEvent =
  | PlayerJoinedEvent
  | PlayerLeftEvent
  | PlayerReadyEvent
  | PlayerPickedCoEvent
  | PlayerPickedArmyEvent
  | PlayerPickedSlotEvent
  | MatchStartEvent;
