import { LeagueType } from "@prisma/client";
/** TODO extract prisma dependency */
import { prisma } from "server/prisma/prisma-client";
import { getChangeableTilesFromMap } from "shared/match-logic/get-changeable-tile-from-map";
import { MapWrapper } from "shared/wrappers/map";
import { MatchWrapper } from "shared/wrappers/match";
import { PlayersWrapper } from "shared/wrappers/players";
import { UnitsWrapper } from "shared/wrappers/units";

class MatchStore {
  /** Maps from match ids to match wrappers */
  private matchMap: Map<string, MatchWrapper> = new Map();

  set(id: string, matchState: MatchWrapper) {
    this.matchMap.set(id, matchState);
  }

  async rebuild() {
    console.log("Rebuilding server state...");

    const matches = await prisma.match.findMany({
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

    matches.forEach((match) => {
      const initialChangeableTiles = getChangeableTilesFromMap(match.map);

      this.matchMap.set(
        match.id,
        new MatchWrapper(
          match.id,
          {
            leagueType: LeagueType.standard,
          },
          match.status,
          new MapWrapper(match.map),
          initialChangeableTiles,
          new UnitsWrapper([]),
          0,
          new PlayersWrapper(match.playerState),
          "clear"
        )
      );

      // TODO apply all events to serverMatchState
    });

    console.log("Rebuilding server state done.");
  }

  get(matchId: string) {
    return this.matchMap.get(matchId);
  }

  /** TODO maybe not a good idea to have a method like this. should be handled on the procedure layer. */
  getOrThrow(matchId: string) {
    const match = this.get(matchId);

    if (match === undefined) {
      throw new Error(`Match with id ${matchId} not found in MatchStore`);
    }

    return match;
  }

  getMatchesOfPlayer(playerId: string) {
    return this.getAll().filter(
      (m) => m.players.getById(playerId) !== undefined
    );
  }

  getAll() {
    return [...this.matchMap.values()];
  }
}

export const matchStore = new MatchStore();
