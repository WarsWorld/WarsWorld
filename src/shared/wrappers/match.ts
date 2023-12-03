import type {
  LeagueType,
  Match,
  MatchStatus,
  Player,
  WWMap
} from "@prisma/client";
import { applyMainEventToMatch } from "shared/match-logic/events/apply-event-to-match";
import type { MatchRules } from "shared/schemas/match-rules";
import type { PlayerSlot } from "shared/schemas/player-slot";
import type { Position } from "shared/schemas/position";
import { getDistance, isSamePosition } from "shared/schemas/position";
import type { Tile } from "shared/schemas/tile";
import type {
  UnitType,
  UnitWithHiddenStats,
  UnitWithVisibleStats
} from "shared/schemas/unit";
import type { Weather } from "shared/schemas/weather";
import type { MainEvent } from "shared/types/events";
import type {
  ChangeableTile,
  PlayerInMatch
} from "shared/types/server-match-state";
import { MapWrapper } from "./map";
import type { PlayerInMatchWrapper } from "./player-in-match";
import { TeamWrapper } from "./team";
import { UnitWrapper } from "./unit";
import { DispatchableError } from "shared/DispatchedError";

/** TODO: Add favorites, possibly spectators, also a timer */
export class MatchWrapper {
  public playerToRemoveWeatherEffect: PlayerInMatchWrapper | null = null;
  public weatherDaysLeft = 0;
  public teams: TeamWrapper[] = [];
  /**
   * TODO
   *
   * this property is a candidate for ArrayBuffer / IntArray optimization
   * just like Vision currently has.
   */
  public units: UnitWrapper[];
  public currentWeather: Weather = "clear";
  public map: MapWrapper;

  constructor(
    public id: Match["id"],
    public leagueType: LeagueType,
    public changeableTiles: ChangeableTile[],
    public rules: MatchRules,
    public status: MatchStatus,
    map: WWMap,
    players: PlayerInMatch[],
    units: (UnitWithHiddenStats | UnitWithVisibleStats)[],
    public turn: number
  ) {
    this.map = new MapWrapper(map);
    players.forEach(player => this.addUnwrappedPlayer(player));
    this.units = units.map(unit => new UnitWrapper(unit, this))
  }

  getTile(position: Position): Tile | ChangeableTile {
    this.map.throwIfOutOfBounds(position);

    const foundChangeableTile = this.changeableTiles.find((t) =>
      isSamePosition(t.position, position)
    );

    if (foundChangeableTile !== undefined) {
      return foundChangeableTile;
    }

    // TODO `getTile` will be called very often. map data is a candidate for
    // the same ArrayBuffer / IntArray optimization like exists for vision.
    return this.map.data.tiles[position[1]][position[0]];
  }

  // PLAYER STUFF **************************************************************
  getCurrentTurnPlayer() {
    const player = this.getAllPlayers().find((p) => p.data.hasCurrentTurn);

    if (player === undefined) {
      throw new Error("No player with current turn was found");
    }

    return player;
  }

  getAllPlayers() {
    return this.teams.flatMap((team) => team.players);
  }

  getById(playerId: Player["id"]) {
    return this.getAllPlayers().find((p) => p.data.id === playerId);
  }

  getByIdOrThrow(playerId: Player["id"]) {
    const player = this.getById(playerId);

    if (player === undefined) {
      throw new Error(`Could not find player by id ${playerId}`);
    }

    return player;
  }

  getBySlot(playerSlot: PlayerSlot) {
    return this.getAllPlayers().find((p) => p.data.slot === playerSlot);
  }

  getBySlotOrThrow(playerSlot: PlayerSlot) {
    const player = this.getBySlot(playerSlot);

    if (player === undefined) {
      throw new Error(`Could not find player by slot ${playerSlot}`);
    }

    return player;
  }

  addUnwrappedPlayer(player: PlayerInMatch) {
    const teamIndex = this.rules.teamMapping[player.slot];
    const foundTeam = this.teams.find((team) => team.index === teamIndex);

    if (foundTeam === undefined) {
      this.teams.push(new TeamWrapper([player], this, teamIndex));
      return;
    }

    foundTeam.addUnwrappedPlayer(player);
  }

  // UNIT STUFF ****************************************************************
  getUnit(position: Position) {
    return this.units.find((u) => isSamePosition(u.data.position, position));
  }

  getUnitOrThrow(position: Position) {
    const unit = this.getUnit(position);

    if (unit === undefined) {
      throw new DispatchableError(
        `No unit found at ${JSON.stringify(position)}`
      );
    }

    return unit;
  }

  hasUnit(position: Position) {
    return this.getUnit(position) !== undefined;
  }

  damageUntil1HPInRadius({
    radius,
    damageAmount,
    epicenter
  }: {
    radius: number;
    damageAmount: number;
    epicenter: Position;
  }) {
    this.units
      .filter((unit) => getDistance(unit.data.position, epicenter) <= radius)
      .forEach((unit) => unit.damageUntil1HP(damageAmount));
  }
}
