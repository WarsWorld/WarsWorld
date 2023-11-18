import type { LeagueType, Match, MatchStatus, Player } from "@prisma/client";
import { applyMainEventToMatch } from "shared/match-logic/apply-event-to-match";
import type { CO } from "shared/schemas/co";
import type { PlayerSlot } from "shared/schemas/player-slot";
import type { Position } from "shared/schemas/position";
import { isSamePosition } from "shared/schemas/position";
import type { MovementType } from "shared/match-logic/buildable-unit";
import type {
  COHookProps,
  COHookPropsWithDefender,
} from "shared/match-logic/co-hooks";
import { getChangeableTilesFromMap } from "shared/match-logic/get-changeable-tile-from-map";
import type { Weather } from "shared/match-logic/tiles";
import { getBaseMovementCost } from "shared/match-logic/tiles";
import type { WWEvent } from "shared/types/events";
import type {
  ChangeableTile,
  PlayerInMatch,
} from "shared/types/server-match-state";
import type { MapWrapper } from "./map";
import { PlayerInMatchWrapper } from "./player-in-match";
import { PlayersWrapper } from "./players";
import type { UnitsWrapper } from "./units";
import type { Tile } from "shared/schemas/tile";
import { UnitWrapper } from "./unit";
import type { WWUnit } from "shared/schemas/unit";

/** TODO: Add favorites, possibly spectators, also a timer */
export class MatchWrapper {
  public playerToRemoveWeatherEffect?: PlayerInMatchWrapper;
  public changeableTiles: ChangeableTile[];
  public players = new PlayersWrapper([]);

  constructor(
    public id: Match["id"],
    public rules: {
      fogOfWar?: boolean;
      fundsMultiplier?: number;
      leagueType: LeagueType;
    },
    public status: MatchStatus,
    public map: MapWrapper,
    public units: UnitsWrapper,
    public turn: number,
    public currentWeather: Weather
  ) {
    this.changeableTiles = getChangeableTilesFromMap(map.data);
  }

  addUnwrappedPlayer(player: PlayerInMatch) {
    this.players.data.push(new PlayerInMatchWrapper(player, this));
  }

  applyEvent(event: WWEvent) {
    applyMainEventToMatch(this, event);
  }

  getCOHookPropsWithUnit(unitPosition: Position): COHookProps {
    return {
      attackerData: this.players
        .getCurrentTurnPlayer() // TODO is this safe or are there cases where we should use the position to determine the player instead?
        .getCOHookPlayerProps(unitPosition),
      matchState: this,
    };
  }

  getCOHookPropsWithDefender(
    attackerPosition: Position,
    defenderPosition: Position
  ): COHookPropsWithDefender {
    const attackerUnit = this.units.getUnitOrThrow(attackerPosition);
    const defenderUnit = this.units.getUnitOrThrow(defenderPosition);

    const attacker = this.players.getBySlotOrThrow(
      attackerUnit.data.playerSlot
    );
    const defender = this.players.getBySlotOrThrow(
      defenderUnit.data.playerSlot
    );

    return {
      attackerData: attacker.getCOHookPlayerProps(attackerPosition),
      defenderData: defender.getCOHookPlayerProps(defenderPosition),
      matchState: this,
    };
  }

  getNextAvailableSlot() {
    for (let i = 0; i < this.map.data.numberOfPlayers; i++) {
      if (this.players.getBySlot(i) !== undefined) {
        return i;
      }
    }

    throw new Error("No player slots available (game full)");
  }

  allSlotsReady() {
    for (let i = 0; i < this.map.data.numberOfPlayers; i++) {
      if (this.players.getBySlot(i)?.data.ready !== true) {
        return false;
      }
    }

    return true;
  }

  join(player: Player, slot: PlayerSlot, co: CO) {
    this.players.data.push(
      new PlayerInMatchWrapper(
        {
          playerId: player.id,
          slot,
          ready: false,
          co,
          funds: 0,
          powerMeter: 0,
          army: "orange-star",
          COPowerState: "no-power",
        },
        this
      )
    );
  }

  getTile(position: Position): Tile | ChangeableTile {
    this.map.throwIfOutOfBounds(position);

    const foundChangeableTile = this.changeableTiles.find((t) =>
      isSamePosition(t.position, position)
    );

    if (foundChangeableTile !== undefined) {
      return foundChangeableTile;
    }

    return this.map.data.tiles[position[1]][position[0]];
  }

  getTileOrThrow(position: Position) {
    const tile = this.getTile(position);

    if (tile === undefined) {
      throw new Error(`Could not get tile at ${JSON.stringify(position)}`);
    }

    return tile;
  }

  /**
   * returns the amount of movement points which must be spent to *enter* the tile
   * `null` means impassible terrain.
   */
  getMovementCost(position: Position, movementType: MovementType) {
    const tileType = this.getTile(position).type;
    const baseMovementCost = getBaseMovementCost(
      tileType,
      movementType,
      this.currentWeather
    );

    if (baseMovementCost === null) {
      return null;
    }

    return this.players
      .getCurrentTurnPlayer()
      .getCOHooksWithUnit(position)
      .onMovementCost(baseMovementCost);
  }

  eliminatePlayer(player: PlayerInMatchWrapper) {
    player.data.eliminated = true;

    if (this.playerToRemoveWeatherEffect === player) {
      this.playerToRemoveWeatherEffect = player.getNextAlivePlayer();
    }
  }

  //TODO: check function is correct
  captureTile(position: Position) {
    const tile = this.getTile(position);

    if ("playerSlot" in tile) {
      tile.playerSlot = this.players.getCurrentTurnPlayer().data.slot;
    }
  }

  addUnwrappedUnit(unit: WWUnit) {
    this.units.data.push(new UnitWrapper(unit, this));
  }
}
