import type { MainAction, SubAction } from "shared/schemas/action";
import type { Position } from "shared/schemas/position";
import type { MainEventWithSubEvents, SubEvent } from "shared/types/events";
import type { MatchWrapper } from "shared/wrappers/match";

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
