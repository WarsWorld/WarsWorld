import type { Player } from "@prisma/client";
import type { MatchWrapper } from "shared/wrappers/match";
import type { PlayerInMatchWrapper } from "shared/wrappers/player-in-match";

class PlayerMatchIndex {
  private index = new Map<Player["id"], MatchWrapper[]>();

  getPlayerMatches(playerId: Player["id"]) {
    return this.index.get(playerId);
  }

  onPlayerJoin(player: PlayerInMatchWrapper, match: MatchWrapper) {
    const playerMatches = this.index.get(player.data.id);

    if (playerMatches === undefined) {
      this.index.set(player.data.id, [match]);
    } else {
      playerMatches.push(match);
    }
  }

  onPlayerLeave(player: PlayerInMatchWrapper, match: MatchWrapper) {
    const playerMatchesIndex = this.index.get(player.data.id);

    if (playerMatchesIndex === undefined) {
      throw new Error(`Tried to remove a match for player ${player.data.id} from playerIdIndex but index entry wasn't found`);
    }

    const matchIndex = playerMatchesIndex.findIndex((m) => m.id === match.id);

    if (matchIndex === -1) {
      throw new Error(`Tried to remove match ${match.id} for player ${player.data.id} from playerIdIndex but match wasn't found in index`);
    }

    playerMatchesIndex.splice(matchIndex, 1);

    if (playerMatchesIndex.length === 0) {
      this.index.delete(player.data.id);
    }
  }
}

export const playerMatchIndex = new PlayerMatchIndex();
