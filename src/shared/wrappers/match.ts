import { MatchStatus } from "@prisma/client";
import { PlayerSlot } from "server/schemas/player-slot";
import { Position, isSamePosition } from "server/schemas/position";
import {
  COHookProps,
  COHookPropsWithDefender,
} from "shared/match-logic/co-hooks";
import { createUnitFromBuildAction } from "shared/match-logic/create-unit-from-build-action";
import { Weather } from "shared/match-logic/tiles";
import { EmittableEvent } from "shared/types/events";
import {
  BackendMatchState,
  ChangeableTile,
} from "shared/types/server-match-state";
import { MapWrapper } from "./map";
import { PlayersWrapper } from "./players";
import { UnitsWrapper } from "./units";

export class MatchWrapper {
  constructor(
    public id: string,
    public rules: BackendMatchState["rules"],
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
    let nextAvailablePlayerSlot: PlayerSlot | null = null;

    for (let i = 0; i < this.map.data.numberOfPlayers; i++) {
      if (this.players.getBySlot(i) !== undefined) {
        nextAvailablePlayerSlot = i;
        break;
      }
    }

    if (nextAvailablePlayerSlot === null) {
      throw new Error("No player slots available (game full)");
    }

    return nextAvailablePlayerSlot;
  }

  allSlotsReady() {
    let ready = true;

    for (let i = 0; i < this.map.data.numberOfPlayers; i++) {
      if (this.players.getBySlot(i)?.data.ready !== true) {
        ready = false;
      }
    }

    return ready;
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
}
