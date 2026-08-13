import type { Match, WWMap } from "@prisma/client";
import { prisma } from "server/prisma/prisma-client";
import { MatchWrapper } from "shared/wrappers/match";
import { pageMatchIndex } from "./page-match-index";
import { playerMatchIndex } from "./player-match-index";
import type { ChangeableTile } from "../shared/types/server-match-state";
import { willBeChangeableTile } from "../shared/schemas/tile";
import {
  applyMainEventToMatch,
  applySubEventToMatch,
} from "../shared/match-logic/events/apply-event-to-match";
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
            fired: false,
          });
        } else if (tile.type === "pipeSeam") {
          changeableTiles.push({
            type: tile.type,
            position: [x, y],
            hp: 99,
          });
        } else {
          changeableTiles.push({
            type: tile.type,
            position: [x, y],
            playerSlot: tile.playerSlot,
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
      0,
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
          not: "finished",
        },
      },
      include: {
        map: true,
        Event: true,
      },
    });

    for (const rawMatch of rawMatches) {
      const match = this.createMatchAndIndex(rawMatch, rawMatch.map);

      // Replay strictly in order. A single bad event must not crash the whole server on boot (that
      // would take down every match at once) — but it must ALSO not be silently skipped while later
      // events keep applying: that corrupts state (turn/ownership scramble) invisibly. So on the
      // first failure we HALT this match's replay and log loudly, leaving it at its last consistent
      // point. Stale-but-consistent is recoverable; silently scrambled is not. (CO-version validation
      // now prevents the usual trigger — an unimplemented CO throwing mid-replay.)
      for (const dbEvent of rawMatch.Event) {
        try {
          applyMainEventToMatch(match, dbEvent.content);

          if (dbEvent.content.type === "move") {
            applySubEventToMatch(match, dbEvent.content);
          }
        } catch (error) {
          console.error(
            `[rebuild] match ${rawMatch.id}: event #${dbEvent.index} failed to replay — halting this ` +
              `match's replay to avoid corrupting its state:`,
            error instanceof Error ? error.message : error,
          );
          break;
        }
      }
    }

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
