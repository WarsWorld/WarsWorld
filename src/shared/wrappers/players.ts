import { Player } from "@prisma/client";
import { CO } from "server/schemas/co";
import { PlayerSlot } from "server/schemas/player-slot";
import { MatchWrapper } from "./match";
import { PlayerInMatchWrapper } from "./player-in-match";

export class PlayersWrapper {
  constructor(
    public data: PlayerInMatchWrapper[],
    public match: MatchWrapper
  ) {}

  getCurrentTurnPlayer() {
    const player = this.data.find((p) => p.data.hasCurrentTurn);

    if (player === undefined) {
      throw new Error("No player with current turn was found");
    }

    return player;
  }

  getById(playerId: string) {
    return this.data.find((p) => p.data.playerId === playerId);
  }

  getBySlot(playerSlot: PlayerSlot) {
    return this.data.find((p) => p.data.slot === playerSlot);
  }

  getBySlotOrThrow(playerSlot: PlayerSlot) {
    const player = this.getBySlot(playerSlot);

    if (player === undefined) {
      throw new Error(`Could not find player by slot ${playerSlot}`);
    }

    return player;
  }

  hasById(playerId: string) {
    return this.getById(playerId) !== undefined;
  }

  leave(player: Player) {
    this.data = this.data.filter((p) => p.data.playerId !== player.id);
  }

  join(player: Player, slot: PlayerSlot, co: CO) {
    this.data.push(
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
        this.match
      )
    );
  }

  setReady(player: Player, ready: boolean) {
    const pimw = this.getById(player.id);

    if (pimw === undefined) {
      throw new Error(
        `Can't set ready for playerId ${player.id}: Not found in match`
      );
    }

    pimw.data.ready = ready;
  }
}
