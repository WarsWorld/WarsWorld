import type { LeagueType, Match, MatchStatus, WWMap } from "@prisma/client";
import { unitPropertiesMap } from "shared/match-logic/buildable-unit";
import { applyMainEventToMatch } from "shared/match-logic/events/apply-event-to-match";
import { getBaseMovementCost } from "shared/match-logic/movement-cost";
import type { MatchRules } from "shared/schemas/match-rules";
import type { Position } from "shared/schemas/position";
import { isSamePosition } from "shared/schemas/position";
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
import { PlayerInMatchWrapper } from "./player-in-match";
import { PlayersWrapper } from "./players";
import { UnitWrapper } from "./unit";
import { UnitsWrapper } from "./units";

/** TODO: Add favorites, possibly spectators, also a timer */
export class MatchWrapper {
  public playerToRemoveWeatherEffect: PlayerInMatchWrapper | null = null;
  public players = new PlayersWrapper([], this);
  public units = new UnitsWrapper([]);
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

    this.players = new PlayersWrapper(
      players.map((p) => new PlayerInMatchWrapper(p, this)),
      this
    );

    this.units = new UnitsWrapper(units.map((u) => new UnitWrapper(u, this)));
  }

  applyMainEvent(event: MainEvent) {
    applyMainEventToMatch(this, event);
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

  /**
   * returns the amount of movement points which must be spent to *enter* the tile
   * `null` means impassible terrain.
   * 
   * TODO maybe put this on unit wrapper?
   */
  getMovementCost(position: Position, unitType: UnitType): number | null {
    const player = this.players.getCurrentTurnPlayer();

    const baseMovementCost = getBaseMovementCost(
      unitPropertiesMap[unitType].movementType,
      player.getWeatherSpecialMovement(),
      this.getTile(position).type
    );

    if (baseMovementCost === null) {
      return null;
    }

    /** TODO we might need to add a position to the movementCost hook later on */
    return (
      player.getHook("movementCost")?.(baseMovementCost, {
        match: this,
        unitType
      }) ?? baseMovementCost
    );
  }
}
