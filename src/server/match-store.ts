import type { Match, WWMap } from "@prisma/client";
import { prisma } from "server/prisma/prisma-client";
import { getChangeableTilesFromMap } from "shared/match-logic/get-changeable-tile-from-map";
import { MatchWrapper } from "shared/wrappers/match";
import { pageMatchIndex } from "./page-match-index";
import { playerMatchIndex } from "./player-match-index";

export class MatchStore {
  private index = new Map<Match["id"], MatchWrapper>();

  createMatchAndIndex(rawMatch: Match, rawMap: WWMap) {
    const match = new MatchWrapper(
      rawMatch.id,
      rawMatch.leagueType,
      getChangeableTilesFromMap(rawMap),
      rawMatch.rules,
      rawMatch.status,
      rawMap,
      rawMatch.playerState,
      rawMap.predeployedUnits,
      0
    );

    this.index.set(match.id, match);

    for (const player of match.getAllPlayers()) {
      playerMatchIndex.onPlayerJoin(player, match);
    }

    pageMatchIndex.addMatch(match);

    return match;
  }

  async rebuild() {
    console.log("Rebuilding server state...");

    const rawMatches = await prisma.match.findMany({
      where: {
        status: {
          not: "finished"
        }
      },
      include: {
        map: true,
        Event: true
      }
    });

    rawMatches.forEach((rawMatch) => {
      const match = this.createMatchAndIndex(rawMatch, rawMatch.map);
      rawMatch.Event.forEach((dbEvent) =>
        match.applyMainEvent(dbEvent.content)
      );
    });

    console.log("Rebuilding server state done.");
  }

  get(matchId: Match["id"]) {
    return this.index.get(matchId);
  }

  removeMatchFromIndex(match: MatchWrapper) {
    this.index.delete(match.id);
  }
}

export const matchStore = new MatchStore();
