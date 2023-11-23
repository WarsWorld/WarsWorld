import type { MainAction, SubAction } from "shared/schemas/action";
import type { Position } from "shared/schemas/position";
import type { MainEvent, SubEvent } from "shared/types/events";
import type { MatchWrapper } from "shared/wrappers/match";

export type MainActionToEvent<T extends MainAction> = (
  match: MatchWrapper,
  action: T
) => MainEvent;

export type SubActionToEvent<T extends SubAction> = (
  match: MatchWrapper,
  action: T,
  fromPosition: Position
) => SubEvent;
