import type { MainAction, SubAction } from "server/core/schemas/action";
import type { Position } from "server/core/schemas/position";
import type { MainEventWithSubEvents, SubEvent } from "server/engine/types/events";
import type { MatchWrapper } from "server/engine/entities/match";

export type MainActionToEvent<T extends MainAction> = (
  match: MatchWrapper,
  action: T,
) => Extract<MainEventWithSubEvents, { type: T["type"] }>;

export type SubActionToEvent<T extends SubAction> = (
  match: MatchWrapper,
  action: T,
  fromPosition: Position,
) => Extract<SubEvent, { type: T["type"] }>;

export type ApplyEvent<Event extends MainEventWithSubEvents | SubEvent> = (
  match: MatchWrapper,
  event: Event,
) => void;

export type ApplySubEvent<Event extends SubEvent> = (
  match: MatchWrapper,
  subEvent: Event,
  fromPosition: Position,
) => void;
