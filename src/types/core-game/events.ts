import { Player } from "@prisma/client";
import {
  AttackAction,
  COPowerAction,
  DirectPersistableAction,
  MoveAction,
  SuperCOPowerAction,
  UnloadAction,
} from "components/schemas/action";
import { CO } from "components/schemas/co";
import { UnitDuringMatch } from "components/schemas/unit";
import { ServerMatchState } from "./server-match-state";
import { isSamePosition } from "components/schemas/position";

export interface MatchStartEvent {
  type: "match-start"; // maybe add who's player's turn it is or which army starts?
}

export interface MoveEvent extends MoveAction {
  trap?: boolean; // maybe we need a unit here..?
  discovered?: UnitDuringMatch[];
}

export interface InvalidActionEvent {
  type: "invalid-action";
  reason: string;
}

export interface UnloadEvent extends UnloadAction {
  unloadedUnit: UnitDuringMatch;
}

export interface AttackEvent extends AttackAction {
  defenderHP: number; // we could probably derive these as well if we just submit the rolled luck value
  attackerHP?: number; // missing means no counter-attack
}

// checked: is player's turn
const generateAttackEvent = (
  moveAction: MoveAction,
  attackAction: AttackAction,
  matchState: ServerMatchState,
): AttackEvent => {
  const currentPlayerInMatch = matchState.players.find((p) => p.hasCurrentTurn);

  const attacker = matchState.units.find((u) =>
    isSamePosition(moveAction.path.at(-1)!, u.position),
  );
  const defender = matchState.units.find((u) =>
    isSamePosition(attackAction.defenderPosition, u.position),
  );

  if (defender === undefined) {
    throw new Error("Defending unit not found");
  }

  if (attacker === undefined) {
    throw new Error("Attacking unit not found");
  }

  // is attacker unit of current player and is not waited
  // is defending unit actually an enemy
  // is defending unit in range
  // is defending unit visible
  // is defending unit attackable by attacking unit

  // if co power etc etc etc

  return {
    ...attackAction,
    defenderHP: 1,
    attackerHP: 1,
  };
};

export interface COPowerEvent extends COPowerAction {
  rngRoll?: number;
}

export interface SuperCOPowerEvent extends SuperCOPowerAction {
  rngRoll?: number;
}

interface WithPlayer {
  player: Player;
}

export interface PlayerJoinedEvent extends WithPlayer {
  type: "player-joined";
  playerSlot: number;
}

export interface PlayerLeftEvent extends WithPlayer {
  type: "player-left";
}

export interface PlayerChangedReadyStatusEvent extends WithPlayer {
  type: "player-changed-ready-status";
  ready: boolean;
}

export interface PlayerPickedCOEvent extends WithPlayer {
  type: "player-picked-co";
  co: CO;
}

export interface PlayerEliminated extends WithPlayer {
  type: "player-eliminated";
}

export type WWEvent =
  | MatchStartEvent
  | MoveEvent
  | UnloadEvent
  | AttackEvent
  | PlayerJoinedEvent
  | PlayerLeftEvent
  | PlayerChangedReadyStatusEvent
  | PlayerPickedCOEvent
  | PlayerEliminated
  | COPowerEvent
  | SuperCOPowerEvent
  | DirectPersistableAction;

export type EmittableEvent = WWEvent & { matchId: string };
