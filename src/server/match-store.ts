import type { Match, WWMap } from "@prisma/client";
import { prisma } from "server/prisma/prisma-client";
import { MatchWrapper } from "shared/wrappers/match";
import { pageMatchIndex } from "./page-match-index";
import { playerMatchIndex } from "./player-match-index";
import type { ChangeableTile } from "../shared/types/server-match-state";
import { willBeChangeableTile } from "../shared/schemas/tile";
import { applyMainEventToMatch, applySubEventToMatch } from "../shared/match-logic/events/apply-event-to-match";
import { UnitWrapper } from "shared/wrappers/unit";

const getChangeableTilesFromMap = (map: WWMap): ChangeableTile[] => {
  const changeableTiles: ChangeableTile[] = [];

  for (let y = 0; y < map.tiles.length; y++) {
    for (let x = 0; x < map.tiles[y].length; x++) {
      const tile = map.tiles[y][x];

      if (willBeChangeableTile(tile)) {
        if (tile.type === "unusedSilo") {
          changeableTiles.push({
            type: tile.type,
            position: [x, y],
            fired: false
          });
        }
        else if (tile.type === "pipeSeam") {
          changeableTiles.push({
            type: tile.type,
            position: [x, y],
            hp: 99
          });
        }
        else {
          changeableTiles.push({
            type: tile.type,
            position: [x, y],
            playerSlot: tile.playerSlot
          });
        }
      }
    }
  }

  return changeableTiles;
};


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
      UnitWrapper,
      0
    );

    this.index.set(match.id, match);

    for (const player of match.getAllPlayers()) {
      playerMatchIndex.onPlayerJoin(player);
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
      rawMatch.Event.forEach((dbEvent) => {
          applyMainEventToMatch(match, dbEvent.content);

          if (dbEvent.content.type === "move") {
            applySubEventToMatch(match, dbEvent.content);
          }
        }
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
