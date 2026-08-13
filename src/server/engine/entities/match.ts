import type { LeagueType, MatchStatus, WWMap } from "server/engine/types/domain-entities";
import { DispatchableError } from "server/engine/DispatchedError";
import type { MatchRules } from "server/core/schemas/match-rules";
import type { PlayerSlot } from "server/core/schemas/player-slot";
import type { Position } from "server/core/schemas/position";
import { getDistance, isSamePosition } from "server/core/schemas/position";
import type { Tile } from "server/core/schemas/tile";
import type { WWUnit } from "server/core/schemas/unit";
import type { Weather } from "server/core/schemas/weather";
import type { ChangeableTile } from "server/core/schemas/tile-state";
import {
  createNeutralPlayerInMatch,
  type PlayerInMatch,
} from "server/engine/entities/player-in-match-state";
import { MapWrapper } from "server/engine/entities/map";
import { PlayerInMatchWrapper } from "server/engine/entities/player-in-match";
import { TeamWrapper } from "server/engine/entities/team";
import type { UnitWrapper } from "server/engine/entities/unit";
import { Vision } from "server/engine/entities/vision";

/**
 * an alternative to storing tile sprite references through the generic data type
 * could something like this on the frontend:
 *
 * const cityNeutral = mapContainer.getChildAt(1)
 * cityNeutral.removeFromParent();
 *
 * const cityOrangeStar = new AnimatedSprite("...");
 * mapContainer.addChildAt(cityOrangeStar, 1)
 */

/** TODO: Add favorites, possibly spectators, also a timer */
export class MatchWrapper<
  ChangeableTileType extends ChangeableTile = ChangeableTile,
  UnitWrapperType extends UnitWrapper = UnitWrapper,
> {
  private currentWeather: Weather = "clear";
  public playerToRemoveWeatherEffect: PlayerInMatchWrapper | null = null;
  public weatherDaysLeft = 0;
  public teams: TeamWrapper[] = [];
  private neutralPlayer: PlayerInMatchWrapper;
  /**
   * TODO
   *
   * this property is a candidate for ArrayBuffer / IntArray optimization
   * just like Vision currently has.
   */
  public units: UnitWrapperType[];
  public map: MapWrapper;

  constructor(
    public id: string,
    public leagueType: LeagueType,
    public changeableTiles: ChangeableTileType[], //TODO change to map from position to changeableTile for better performance
    public rules: MatchRules,
    public status: MatchStatus,
    map: WWMap,
    players: PlayerInMatch[],
    units: WWUnit[],
    UnitWrapperClass: new (unit: WWUnit, match: MatchWrapper) => UnitWrapperType,
    public turn: number,
  ) {
    this.map = new MapWrapper(map);
    players.forEach((player) => this.addUnwrappedPlayer(player));
    this.units = units.map((unit) => new UnitWrapperClass(unit, this));
    const neutralPlayerInMatch = createNeutralPlayerInMatch();
    const neutralTeam = new TeamWrapper([neutralPlayerInMatch], this, -1);
    this.neutralPlayer = new PlayerInMatchWrapper(neutralPlayerInMatch, neutralTeam);
  }

  isFogOfWar(): boolean {
    return (
      this.rules.fogOfWar || (this.rules.gameVersion === "AWDS" && this.currentWeather === "rain")
    );
  }

  setWeather(weather: Weather, duration: number) {
    this.currentWeather = weather;

    if (weather === "clear") {
      // clear has no effect to remove; releasing this lets random weather roll again next turn
      this.playerToRemoveWeatherEffect = null;
      this.weatherDaysLeft = 0;
    } else {
      this.playerToRemoveWeatherEffect = this.getCurrentTurnPlayer();
      this.weatherDaysLeft = duration;
    }

    this.recalculateWeatherVision(weather);
  }

  /**
   * Set the match's starting weather (fixed setting or the "clear" default for random). Unlike
   * setWeather this arms no removal countdown — a fixed-weather match holds this weather for the
   * whole game.
   */
  setInitialWeather(weather: Weather) {
    this.currentWeather = weather;
    this.playerToRemoveWeatherEffect = null;
    this.weatherDaysLeft = 0;
    this.recalculateWeatherVision(weather);
  }

  private recalculateWeatherVision(weather: Weather) {
    if (this.rules.gameVersion === "AWDS" && !this.rules.fogOfWar) {
      // check for rain/clear fog of war activation
      for (const team of this.teams) {
        team.vision = weather === "rain" ? new Vision(team) : null;
      }
    }
  }

  getCurrentWeather(): Weather {
    return this.currentWeather;
  }

  getTile(position: Position): Tile | ChangeableTile {
    this.map.throwIfOutOfBounds(position);

    const foundChangeableTile = this.changeableTiles.find((t) =>
      isSamePosition(t.position, position),
    );

    if (foundChangeableTile !== undefined) {
      const isBrokenPipeSeam = "hp" in foundChangeableTile && foundChangeableTile.hp < 1;

      if (isBrokenPipeSeam) {
        const tile = this.getTile(position);

        if ("variant" in tile && tile.variant === "top-bottom") {
          return {
            type: "plain",
            variant: "broken-pipe-top-bottom",
          };
        }

        return {
          type: "plain",
          variant: "broken-pipe-right-left",
        };
      }

      return foundChangeableTile;
    }

    // TODO `getTile` will be called very often. map data is a candidate for
    // the same ArrayBuffer / IntArray optimization like exists for vision.
    return this.map.data.tiles[position[1]][position[0]];
  }

  /**
   * Record, for every team that can currently SEE this tile, that its owner is now `playerSlot` —
   * their fog "last-known owner" (see fogViewChangeableTiles). Call at a capture BEFORE vision is
   * updated, so the previous owner — who always has vision of their OWN property as it's captured —
   * still counts and learns who took it. Teams without vision are NOT told, so a neutral captured
   * out of sight stays unknown until they explore it.
   */
  rememberPropertyOwnerForWatchers(position: Position, playerSlot: PlayerSlot) {
    if (!this.isFogOfWar()) {
      return;
    }

    for (const team of this.teams) {
      if (team.isPositionVisible(position)) {
        team.rememberPropertyOwner(position, playerSlot);
      }
    }
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
    return this.teams.flatMap((team) => team.players).sort((p1, p2) => p1.data.slot - p2.data.slot);
  }

  getPlayerById(playerId: string) {
    return this.getAllPlayers().find((p) => p.data.id === playerId);
  }

  getPlayerBySlot(playerSlot: PlayerSlot) {
    if (playerSlot < 0) {
      return this.neutralPlayer;
    }

    return this.getAllPlayers().find((p) => p.data.slot === playerSlot);
  }

  addUnwrappedPlayer(player: PlayerInMatch): PlayerInMatchWrapper {
    const teamIndex = this.rules.teamMapping[player.slot];
    const foundTeam = this.teams.find((team) => team.index === teamIndex);

    if (foundTeam === undefined) {
      const team = new TeamWrapper([player], this, teamIndex);
      this.teams.push(team);
      return team.players[0];
    }

    return foundTeam.addUnwrappedPlayer(player);
  }

  // UNIT STUFF ****************************************************************
  getUnit(position: Position) {
    return this.units.find((u) => isSamePosition(u.data.position, position));
  }

  getUnitOrThrow(position: Position) {
    const unit = this.getUnit(position);

    if (unit === undefined) {
      throw new DispatchableError(`No unit found at ${JSON.stringify(position)}`);
    }

    return unit;
  }

  /**
   * IMPORTANT!
   * Param is VISUAL hp, since all sources of damaging without killing
   * are "multiples of 10" (nothing does 25 damage, for example)
   */
  damageUntil1HPInRadius({
    radius,
    visualHpAmount,
    epicenter,
  }: {
    radius: number;
    visualHpAmount: number;
    epicenter: Position;
  }) {
    this.units
      .filter((unit) => getDistance(unit.data.position, epicenter) <= radius)
      .forEach((unit) => unit.damageUntil1HP(visualHpAmount));
  }
}
