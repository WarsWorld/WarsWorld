import { matchStore } from "server/match-store";
import { prisma } from "server/prisma/prisma-client";
import { deriveGameOver } from "server/routers/match/game-over";
import { logger } from "shared/utils/logger";

/**
 * One-off backfill: persist the outcome of matches that are already decided but still stored as
 * "playing" (the pre-feature state — outcome was only ever derived on read).
 *
 * `matchStore.rebuild()` replays every non-finished match's event log, and its `finalizeIfGameOver`
 * pass flips the decided ones to "finished" in memory. Here we write that snapshot
 * (status / winnerTeamIndex / finishedAt / playerState-with-result) back to the DB so finished
 * matches become the archived, queryable records the History view reads.
 *
 * Idempotent — already-finished matches aren't reloaded by rebuild, so re-running is a no-op.
 * Run: `tsx prisma/scripts/backfill-finished.ts`
 */
async function main() {
  await matchStore.rebuild();

  let promoted = 0;

  for (const match of matchStore.getAllMatches()) {
    if (match.status !== "finished") {
      continue;
    }

    const winnerTeamIndex = deriveGameOver(match, undefined)?.winnerTeamIndex ?? null;

    await prisma.match.update({
      where: { id: match.id },
      data: {
        status: "finished",
        winnerTeamIndex,
        finishedAt: new Date(),
        playerState: match.getAllPlayers().map((player) => player.data),
      },
    });

    promoted += 1;
    logger.info(`[backfill] finalized match ${match.id} (winnerTeamIndex=${winnerTeamIndex})`);
  }

  logger.info(`[backfill] done — ${promoted} match(es) promoted to finished.`);
  await prisma.$disconnect();
}

void main();
