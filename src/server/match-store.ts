import type { Match, WWMap } from "@prisma/client";
import { prisma } from "server/prisma/prisma-client";
import { MatchWrapper } from "shared/wrappers/match";
import { logger } from "shared/utils/logger";
import { pageMatchIndex } from "./page-match-index";
import { playerMatchIndex } from "./player-match-index";
import type { ChangeableTile } from "../shared/types/server-match-state";
import { willBeChangeableTile } from "../shared/schemas/tile";
import {
  applyMainEventToMatch,
  applySubEventToMatch,
} from "../shared/match-logic/events/apply-event-to-match";
import { UnitWrapper } from "shared/wrappers/unit";
import { finalizeIfGameOver } from "./routers/match/finalize";

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
    logger.info("Rebuilding server state...");

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
          logger.error(
            `[rebuild] match ${rawMatch.id}: event #${dbEvent.index} failed to replay — quarantining ` +
              `this match (removed from all indices) to avoid serving divergent state:`,
            error instanceof Error ? error.message : error,
          );
          // Halting alone isn't enough: a truncated match left in the indices would still be served
          // and WRITABLE, permanently diverging from the DB event log. Pull it out of every index so
          // it's invisible until a clean redeploy/replay rebuilds it from scratch.
          this.quarantineMatch(match);
          break;
        }
      }

      // Replay reproduces elimination status but never re-flips match.status, so a match that was
      // decided (but whose finished-snapshot predates this feature, or whose finalize write was lost
      // to a crash) would come back as "playing". Re-derive here so the in-memory status matches what
      // a fresh finalize would produce; the DB snapshot is reconciled by the backfill script.
      finalizeIfGameOver(match);
    }

    logger.info("Rebuilding server state done.");
  }

  get(matchId: Match["id"]) {
    return this.index.get(matchId);
  }

  getAllMatches() {
    return [...this.index.values()];
  }

  removeMatchFromIndex(match: MatchWrapper) {
    this.index.delete(match.id);
  }

  /**
   * Remove a match from every index (store + page listing + per-player listing). Used when a match
   * fails to fully replay on boot: serving a half-applied match would diverge from its event log, so
   * we make it invisible instead. `createMatchAndIndex` always registers it in all three indices
   * before replay, so each removal is guaranteed to find it.
   */
  private quarantineMatch(match: MatchWrapper) {
    this.removeMatchFromIndex(match);
    pageMatchIndex.removeMatch(match);

    for (const player of match.getAllPlayers()) {
      playerMatchIndex.onPlayerLeave(player);
    }
  }
}

export const matchStore = new MatchStore();
