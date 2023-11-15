import { LeagueType, MatchStatus, Player } from "@prisma/client";
import { Position, isSamePosition } from "server/schemas/position";
import {
  COHookProps,
  COHookPropsWithDefender,
} from "shared/match-logic/co-hooks";
import { createUnitFromBuildAction } from "shared/match-logic/create-unit-from-build-action";
import { Weather } from "shared/match-logic/tiles";
import { EmittableEvent } from "shared/types/events";
import { ChangeableTile } from "shared/types/server-match-state";
import { MapWrapper } from "./map";
import { PlayersWrapper } from "./players";
import { UnitsWrapper } from "./units";
import { PlayerInMatchWrapper } from "./player-in-match";
import { PlayerSlot } from "server/schemas/player-slot";
import { CO } from "server/schemas/co";

/** TODO: Add favorites, possibly spectators, also a timer */
export class MatchWrapper {
  constructor(
    public id: string,
    public rules: {
      fogOfWar?: boolean;
      fundsMultiplier?: number;
      leagueType: LeagueType;
    },
    public status: MatchStatus,
    public map: MapWrapper,
    public changeableTiles: ChangeableTile[],
    public units: UnitsWrapper,
    public turn: number,
    public players: PlayersWrapper,
    public currentWeather: Weather,
    public weatherNextDay: Weather | null
  ) {}

  applyEvent(event: EmittableEvent) {
    switch (event.type) {
      case "build": {
        const currentPlayerSlot = this.players.getCurrentTurnPlayer().data.slot;
        const unit = createUnitFromBuildAction(event, currentPlayerSlot);
        this.units.addUnit(unit);
      }
    }
  }

  getCOHookProps(unitPosition: Position): COHookProps {
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

    const attacker = this.players.getBySlotOrThrow(attackerUnit.playerSlot);
    const defender = this.players.getBySlotOrThrow(defenderUnit.playerSlot);

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

  getTile(position: Position) {
    this.map.throwIfOutOfBounds(position);

    const foundChangeableTile = this.changeableTiles.find((t) =>
      isSamePosition(t.position, position)
    );

    if (foundChangeableTile !== undefined) {
      return foundChangeableTile;
    }

    return this.map.data.tiles[position[1]][position[0]];
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
}
