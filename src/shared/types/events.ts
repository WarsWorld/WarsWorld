import type { Player } from "@prisma/client";
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
import type { Position } from "shared/schemas/position";
import type { Weather } from "shared/schemas/weather";

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

export type WithPlayer = {
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

export type WithElimination<Reason extends string> = {
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
