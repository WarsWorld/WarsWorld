import { Unit } from "@prisma/client";
import { Position } from "components/schemas/position";
import { UnitType } from "components/schemas/unit";
import { Direction } from "readline";

export type MatchStartEvent = {
  type: "match-start"; // maybe add who's player's turn it is or which army starts?
};

export type TurnEndEvent = {
  type: "turn-end"; // maybe add the turn/day number?
};

export type BuildEvent = {
  type: "build"; // maybe add army or can we safely infer that?
  unit: UnitType;
  position: Position;
};

export type AttemptMoveEvent = {
  type: "attempt-move";
  path: Position[];
  trap?: Unit;
  discovered?: Unit[];
};

export type InvalidActionEvent = {
  type: "invalid-action";
  reason: string;
};

export type WaitEvent = {
  type: "wait";
};

export type AbilityEvent = {
  type: "ability";
};

export type MissileSiloEvent = {
  type: "missile-silo";
  targetPosition: Position;
};

export type UnloadEvent = {
  type: "unload";
  direction: Direction;
  unloadedUnit: Unit;
};

export type AttackEvent = {
  type: "attack";
  defenderPosition: Position;
  defenderHP: number; // we could probably derive these as well if we just submit the rolled luck value
  attackerHP?: number; // missing means no counter-attack
};

export type RepairEvent = {
  type: "repair";
  direction: Direction;
};

export type COPowerEvent = {
  type: "co-power";
};

export type SuperCOPowerEvent = {
  type: "super-co-power";
};

export type RequestDrawEvent = {
  type: "request-draw";
};

export type ForfeitEvent = {
  type: "forfeit";
};

export type Event =
  | MatchStartEvent
  | TurnEndEvent
  | BuildEvent
  | AttemptMoveEvent
  | InvalidActionEvent
  | WaitEvent
  | AbilityEvent
  | MissileSiloEvent
  | UnloadEvent
  | AttackEvent
  | RepairEvent
  | COPowerEvent
  | SuperCOPowerEvent
  | RequestDrawEvent
  | ForfeitEvent;
