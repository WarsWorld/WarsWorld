import type {
  LeagueType,
  Match,
  MatchStatus,
  Player,
  WWMap
} from "@prisma/client";
import { DispatchableError } from "shared/DispatchedError";
import type { MatchRules } from "shared/schemas/match-rules";
import type { PlayerSlot } from "shared/schemas/player-slot";
import type { Position } from "shared/schemas/position";
import { getDistance, isSamePosition } from "shared/schemas/position";
import type { Tile } from "shared/schemas/tile";
import type { WWUnit } from "shared/schemas/unit";
import type { Weather } from "shared/schemas/weather";
import type {
  ChangeableTile,
  PlayerInMatch
} from "shared/types/server-match-state";
import { MapWrapper } from "./map";
import type { PlayerInMatchWrapper } from "./player-in-match";
import { TeamWrapper } from "./team";
import { UnitWrapper } from "./unit";
import { Vision } from "./vision";

/** TODO: Add favorites, possibly spectators, also a timer */
export class MatchWrapper {
  private currentWeather: Weather = "clear"; // made private so no one changes currentWeather without setter on accident
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
  public map: MapWrapper;

  constructor(
    public id: Match["id"],
    public leagueType: LeagueType,
    public changeableTiles: ChangeableTile[],
    public rules: MatchRules,
    public status: MatchStatus,
    map: WWMap,
    players: PlayerInMatch[],
    units: WWUnit[],
    public turn: number
  ) {
    this.map = new MapWrapper(map);
    players.forEach(player => this.addUnwrappedPlayer(player));
    this.units = units.map(unit => new UnitWrapper(unit, this))
  }

  /**
   * Returns if the match is currently in fog of war
   */
  isFow(): boolean {
    return this.rules.fogOfWar || (this.rules.gameVersion === "AWDS" && this.currentWeather === "rain");
  }

  setWeather(weather: Weather, duration: number) {
    this.currentWeather = weather;
    this.playerToRemoveWeatherEffect = this.getCurrentTurnPlayer();
    this.weatherDaysLeft = duration;

    if (this.rules.gameVersion === "AWDS" && !this.rules.fogOfWar) { // check for rain/clear fog of war activation
      for (const team of this.teams) {
        team.vision = (weather === "rain") ? new Vision(team) : null;
      }
    }
  }
  getCurrentWeather(): Weather {
    return this.currentWeather;
  }

  getTile(position: Position): Tile | ChangeableTile {
    this.map.throwIfOutOfBounds(position);

    const foundChangeableTile = this.changeableTiles.find((t) =>
      isSamePosition(t.position, position)
    );

    if (foundChangeableTile !== undefined) {
      if ("hp" in foundChangeableTile && foundChangeableTile.hp < 1) {
        return { // TODO if this is used in frontend, we need to see what type of broken pipe it is
          type: "plain",
          variant: "broken-pipe-right-left"
        };
      }

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

  getPlayerById(playerId: Player["id"]) {
    return this.getAllPlayers().find((p) => p.data.id === playerId);
  }

  getPlayerBySlot(playerSlot: PlayerSlot) {
    return this.getAllPlayers().find((p) => p.data.slot === playerSlot);
  }

  addUnwrappedPlayer(player: PlayerInMatch): PlayerInMatchWrapper {

    //lets check if the rules have a teamMapping
    if (this.rules.teamMapping !== undefined) {
      //check for team
      const teamIndex = this.rules.teamMapping[player.slot];
      const foundTeam = this.teams?.find((team) => team.index === teamIndex);

      //there is no team
      if (foundTeam != undefined) {
        return foundTeam.addUnwrappedPlayer(player);
      }
    }

    //no teamMapping
    //TODO: if there's no teamMapping, I assume that then we can use the player.slot as the players default team index?
    const team = new TeamWrapper([player], this, player.slot)
    this.teams.push(team);
    return team.players[0];
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

  /**
   * IMPORTANT!
   * Param is VISUAL hp, since all sources of damaging without killing
   * are "multiples of 10" (nothing does 25 damage, for example)
   */
  damageUntil1HPInRadius({
    radius,
    visualHpAmount,
    epicenter
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
