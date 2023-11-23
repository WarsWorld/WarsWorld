import type { Player } from "@prisma/client";
import type { PlayerSlot } from "shared/schemas/player-slot";
import type { PlayerInMatchWrapper } from "./player-in-match";
import type { MatchWrapper } from "./match";

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

  getById(playerId: Player["id"]) {
    return this.data.find((p) => p.data.id === playerId);
  }

  getByIdOrThrow(playerId: Player["id"]) {
    const player = this.getById(playerId);

    if (player === undefined) {
      throw new Error(`Could not find player by id ${playerId}`);
    }

    return player;
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
}
