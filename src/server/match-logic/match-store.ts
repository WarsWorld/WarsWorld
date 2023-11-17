import type { Match, Player, WWMap } from "@prisma/client";
import { LeagueType } from "@prisma/client";
import { prisma } from "server/prisma/prisma-client";
import { MapWrapper } from "shared/wrappers/map";
import { MatchWrapper } from "shared/wrappers/match";
import { UnitsWrapper } from "shared/wrappers/units";

class MatchStore {
  /** Maps from match ids to match wrappers */
  private matchMap: Map<string, MatchWrapper> = new Map();

  createMatchAndStore(rawMatch: Match, rawMap: WWMap) {
    const matchWrapper = new MatchWrapper(
      rawMatch.id,
      {
        leagueType: LeagueType.standard,
      },
      rawMatch.status,
      new MapWrapper(rawMap),
      new UnitsWrapper([]),
      0,
      "clear"
    );

    rawMatch.playerState.forEach((p) => matchWrapper.addUnwrappedPlayer(p));
    this.matchMap.set(rawMatch.id, matchWrapper);
    return matchWrapper;
  }

  async rebuild() {
    console.log("Rebuilding server state...");

    const rawMatches = await prisma.match.findMany({
      where: {
        status: {
          not: "finished",
        },
      },
      include: {
        map: true,
        Event: true,
      },
    });

    rawMatches.forEach((rawMatch) => {
      const match = this.createMatchAndStore(rawMatch, rawMatch.map);
      rawMatch.Event.forEach((dbEvent) => match.applyEvent(dbEvent.content));
    });

    console.log("Rebuilding server state done.");
  }

  get(matchId: Match["id"]) {
    return this.matchMap.get(matchId);
  }

  /** TODO maybe not a good idea to have a method like this. should be handled on the procedure layer. */
  getOrThrow(matchId: Match["id"]) {
    const match = this.get(matchId);

    if (match === undefined) {
      throw new Error(`Match with id ${matchId} not found in MatchStore`);
    }

    return match;
  }

  getMatchesOfPlayer(playerId: Player["id"]) {
    return this.getAll().filter(
      (m) => m.players.getById(playerId) !== undefined
    );
  }

  getAll() {
    return [...this.matchMap.values()];
  }
}

export const matchStore = new MatchStore();
