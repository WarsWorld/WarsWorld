import type { Match, WWMap } from "@prisma/client";
import { prisma } from "server/prisma/prisma-client";
import { MapWrapper } from "shared/wrappers/map";
import { MatchWrapper } from "shared/wrappers/match";
import { UnitsWrapper } from "shared/wrappers/units";
import { pageMatchIndex } from "./page-match-index";
import { playerMatchIndex } from "./player-match-index";
import { PlayerInMatchWrapper } from "shared/wrappers/player-in-match";

export class MatchStore {
  private index = new Map<Match["id"], MatchWrapper>();

  createMatchAndIndex(rawMatch: Match, rawMap: WWMap) {
    const match = new MatchWrapper(
      rawMatch.id,
      rawMatch.leagueType,
      rawMatch.rules,
      rawMatch.status,
      new MapWrapper(rawMap),
      new UnitsWrapper([]),
      0
    );

    match.players.data = rawMatch.playerState.map((p) => new PlayerInMatchWrapper(p, match));

    this.index.set(match.id, match);

    for (const player of match.players.data) {
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
      rawMatch.Event.forEach((dbEvent) => match.applyMainEvent(dbEvent.content));
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
