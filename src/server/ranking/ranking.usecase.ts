import type { GameMode, Prisma, PrismaClient } from "@prisma/client";
import { logger } from "shared/utils/logger";
import {
  DIVISIONS_PER_RANK,
  climbable,
  entryRankOf,
  anchorOrdinalOf,
  applyMerit,
  meritDelta,
  startingLadder,
  type Ladder,
  type RankDef,
} from "./merit";
import {
  defaultSkill,
  expectedScore,
  inPlacements,
  placementScore,
  rateMatch,
  skillOrdinal,
  type Skill,
} from "./skill";

/** A stored ladder row: the position plus the peak the player has ever reached. */
type StoredLadder = Ladder & { peak: string | null };

/** Accepts either the base client or a transaction client, so a caller can stay atomic. */
type Db = PrismaClient | Prisma.TransactionClient;

/**
 * The `ranking` feature. Two numbers, two jobs (plan §1):
 *
 *   - `PlayerSkill` (OpenSkill μ/σ) — pairs opponents, sizes Merit. NEVER leaves the server.
 *   - `PlayerRank` (rank + Military Merit) — progression + identity. What players see.
 *
 * Both are keyed per MODE and POOLED across rulesets: a fog duel and a standard duel move the same
 * `duel` rating and the same `duel` ladder. The playerbase is too small to shard them (plan §1.3) —
 * revisit with data (per-ruleset residuals vs predicted score), not opinion. QUEUES still split by
 * mode × ruleset × ranked; only the rating pools. Don't conflate the two.
 *
 * Driven from the finalize transaction; the engine never sees any of it.
 */
export class RankingUsecase {
  constructor(private readonly db: PrismaClient) {}

  /**
   * The ladder definition, straight from the `Rank` table. Which ranks exist, their order and which
   * are reachable are DATA — a season rollover reseeds these rows rather than shipping a migration.
   * The merit math in `merit.ts` stays pure by taking this as a parameter.
   */
  async loadRanks(tx: Db = this.db): Promise<RankDef[]> {
    return tx.rank.findMany({
      select: { code: true, order: true, active: true, hasDivisions: true, populationShare: true },
      orderBy: { order: "asc" },
    });
  }

  /** Ladder rows for display, ordered — label and emblem included so the FE never mirrors them. */
  async listRanks() {
    return this.db.rank.findMany({ orderBy: { order: "asc" } });
  }

  /** Current hidden skill per player for a mode; players with no row yet get the OpenSkill default. */
  async getSkills(playerIds: string[], mode: GameMode): Promise<Map<string, Skill>> {
    const skills = new Map(playerIds.map((id) => [id, defaultSkill()]));

    if (playerIds.length === 0) {
      return skills;
    }

    const rows = await this.db.playerSkill.findMany({
      where: { mode, playerId: { in: playerIds } },
      select: { playerId: true, mu: true, sigma: true },
    });

    for (const row of rows) {
      skills.set(row.playerId, { mu: row.mu, sigma: row.sigma });
    }

    return skills;
  }

  /** The displayed ladder per mode for one player — rank, division, Merit, placement state. */
  async getLadder(playerId: string) {
    const [ladderRows, skills, ranks] = await Promise.all([
      this.db.playerRank.findMany({ where: { playerId } }),
      this.db.playerSkill.findMany({ where: { playerId } }),
      this.loadRanks(),
    ]);

    // Placements are shown as the ladder's entry position, whatever it is called — derived from the
    // seeded order, not from a code baked in here.
    const entry = entryRankOf(ranks)?.code ?? null;

    const skillByMode = new Map(skills.map((row) => [row.mode, row]));

    return ladderRows.map((row) => {
      const skill = skillByMode.get(row.mode);
      // An admin-set rank is authoritative — it shows even while the skill estimate is provisional.
      const provisional = !row.placementsExempt && (skill === undefined || inPlacements(skill));

      return {
        mode: row.mode,
        // Placements hide the rank entirely — an unsettled estimate isn't a rank yet.
        rank: provisional ? entry : row.rankCode,
        division: row.division,
        merit: row.merit,
        games: skill?.games ?? 0,
        inPlacements: provisional,
      };
    });
  }

  /**
   * The player's SETTLED rank for a mode, or null while they're still in placements (or have no
   * rating yet). Matchmaking uses this to band ranked pairings — a `null` means "no band applies",
   * exactly as everywhere else the rank is withheld until the estimate settles.
   */
  async rankFor(playerId: string, mode: GameMode): Promise<string | null> {
    const [rank, skill] = await Promise.all([
      this.db.playerRank.findUnique({
        where: { playerId_mode: { playerId, mode } },
        select: { rankCode: true, placementsExempt: true },
      }),
      this.db.playerSkill.findUnique({
        where: { playerId_mode: { playerId, mode } },
        select: { mu: true, sigma: true, games: true },
      }),
    ]);

    if (rank === null) {
      return null;
    }

    // An admin-set rank bands in matchmaking like any settled rank; otherwise the placement gate holds.
    if (!rank.placementsExempt && (skill === null || inPlacements(skill))) {
      return null;
    }

    return rank.rankCode;
  }

  /**
   * Admin override: set a player's VISIBLE rank + division for one mode directly, bypassing match
   * results. Merit is reset to a division's baseline (0) — the tools decision was "visible rank only",
   * so this never touches the hidden OpenSkill rating the matchmaker pairs on.
   *
   * `rank`/`division` are validated at the router boundary (rank ∈ ACTIVE_RANKS, division 1–5), so
   * this trusts them; it only normalises the division for the two rankless tiers. `peakRank` climbs
   * but never drops — an admin demotion shouldn't erase a legitimately-earned peak.
   *
   * Marks the row `placementsExempt` so the rank shows immediately: without it the read side masks
   * any rank as "placements" until the hidden skill estimate settles, which for a fresh player never
   * happens until they've played — so an admin override would look like it did nothing.
   */
  async setLadder(playerId: string, mode: GameMode, rank: string, division: number): Promise<void> {
    const ranks = await this.loadRanks();
    const orderOf = (code: string): number =>
      ranks.find((entry) => entry.code === code)?.order ?? -1;

    // cadet (placements) and marechal (apex) carry no division — pin to the schema default. An
    // unknown code takes the same path: no ladder row means no divisions to normalise against.
    const normalizedDivision =
      ranks.find((entry) => entry.code === rank)?.hasDivisions === true
        ? division
        : DIVISIONS_PER_RANK;

    const existing = await this.db.playerRank.findUnique({
      where: { playerId_mode: { playerId, mode } },
      select: { peakRankCode: true },
    });

    const isNewPeak =
      existing?.peakRankCode == null || orderOf(rank) >= orderOf(existing.peakRankCode);
    const peakRank = isNewPeak ? rank : existing.peakRankCode;

    await this.db.playerRank.upsert({
      where: { playerId_mode: { playerId, mode } },
      create: {
        playerId,
        mode,
        rankCode: rank,
        division: normalizedDivision,
        merit: 0,
        peakRankCode: rank,
        placementsExempt: true,
      },
      update: {
        rankCode: rank,
        division: normalizedDivision,
        merit: 0,
        peakRankCode: peakRank,
        placementsExempt: true,
      },
    });
  }

  /**
   * One player's Merit movement from a single match, for the End-Game screen — or null when the match
   * wasn't rated for them (casual, unranked, or they didn't play it). `applyMatchResult` already wrote
   * the `MeritEvent`; this just reads it back, viewer-scoped.
   *
   * Placements are honoured the same way `getLadder` does: while the estimate is unsettled the rank is
   * withheld and the caller shows placement progress instead of a rank/Merit line.
   */
  async matchOutcome(playerId: string, matchId: string) {
    const [event, match] = await Promise.all([
      this.db.meritEvent.findUnique({
        where: { matchId_playerId: { matchId, playerId } },
        select: { delta: true, rankAfterCode: true, divisionAfter: true },
      }),
      this.db.match.findUnique({ where: { id: matchId }, select: { mode: true } }),
    ]);

    if (event === null || match === null) {
      return null;
    }

    const [skill, rank] = await Promise.all([
      this.db.playerSkill.findUnique({
        where: { playerId_mode: { playerId, mode: match.mode } },
        select: { mu: true, sigma: true, games: true },
      }),
      this.db.playerRank.findUnique({
        where: { playerId_mode: { playerId, mode: match.mode } },
        select: { placementsExempt: true },
      }),
    ]);
    // An admin-set rank shows on the end-game screen too, rather than falling back to placements.
    const provisional = rank?.placementsExempt !== true && (skill === null || inPlacements(skill));

    return {
      delta: event.delta,
      rank: event.rankAfterCode,
      division: event.divisionAfter,
      games: skill?.games ?? 0,
      inPlacements: provisional,
    };
  }

  /**
   * Rate a finished ranked match and move its players' ladders. Runs in the caller's transaction so
   * rating writes are atomic with the outcome. No-ops unless the match is ranked and not already
   * rated (`ratedAt` — finalize is reachable more than once).
   *
   * Teams are rated as teams: OpenSkill splits credit inside a 2v2 by rating rather than moving both
   * members identically, which is the team-average hack this used to apologise for.
   */
  async applyMatchResult(tx: Db, matchId: string): Promise<void> {
    const match = await tx.match.findUnique({
      where: { id: matchId },
      // `mode` only — the rating pools across rulesets, so `ruleset` is irrelevant here.
      select: { isRanked: true, ratedAt: true, mode: true },
    });

    if (match === null || !match.isRanked || match.ratedAt !== null) {
      return;
    }

    // Claim the match before rating it. The read above is a check-then-act: two concurrent finalizes
    // both see `ratedAt: null` and both proceed, and `games: { increment: 1 }` is not idempotent, so
    // the loser of the race double-counts. Making the claim itself the guard closes that — READ
    // COMMITTED does not, even inside the caller's transaction.
    const claimed = await tx.match.updateMany({
      where: { id: matchId, ratedAt: null },
      data: { ratedAt: new Date() },
    });

    if (claimed.count === 0) {
      return;
    }

    const seats = await tx.matchPlayer.findMany({
      where: { matchId, isSpectator: false },
      select: { playerId: true, team: true, result: true },
    });

    // Group into teams; every member of a team shares the team's result.
    const byTeam = new Map<number, { playerIds: string[]; result: string | null }>();

    for (const seat of seats) {
      const team = byTeam.get(seat.team) ?? { playerIds: [], result: seat.result };
      team.playerIds.push(seat.playerId);
      byTeam.set(seat.team, team);
    }

    // A rating game needs at least two opposing sides; otherwise there's nothing to compare.
    if (byTeam.size < 2) {
      logger.warn(`[ranking] match ${matchId} has < 2 teams; skipping rating.`);
      await tx.match.update({ where: { id: matchId }, data: { ratedAt: new Date() } });
      return;
    }

    const playerIds = seats.map((seat) => seat.playerId);
    const skills = await this.loadSkills(tx, playerIds, match.mode);
    const ladders = await this.loadLadders(tx, playerIds, match.mode);
    const ranks = await this.loadRanks(tx);
    // An unseeded `Rank` table means the ladder does not exist in this deployment. Hidden skill
    // still moves — it is the matchmaker's input and is independent of the displayed ladder — but
    // nothing writes a rank or a Merit event, because there is no ladder to place anyone on.
    const hasLadder = climbable(ranks).length > 0;

    if (!hasLadder) {
      logger.warn(`[ranking] no ranks seeded; rating skill only for match ${matchId}.`);
    }

    const teams = [...byTeam.values()];
    const teamSkills = teams.map((team) => team.playerIds.map((id) => skills.get(id)!));
    // 1-based finishing places; equal values mean a draw, which is how OpenSkill expresses one.
    const places = teams.map((team) =>
      team.result === "won" ? 1 : team.result === "drawn" ? 1 : 2,
    );

    // A rated match needs at least one decided seat. Un-stamped results (both sides abandoned, or a
    // rebuild that reached finalize without stamping) would otherwise read as "everyone lost" and
    // debit the whole lobby a full loss.
    if (teams.every((team) => team.result === null)) {
      logger.warn(`[ranking] match ${matchId} has no stamped results; skipping rating.`);
      await tx.match.update({ where: { id: matchId }, data: { ratedAt: new Date() } });
      return;
    }

    const rated = rateMatch(teamSkills, places);

    for (const [teamIndex, team] of teams.entries()) {
      // Everyone on a side shares its outcome, so E and S are per-team, not per-player.
      const expected = expectedScore(teamSkills, teamIndex);
      // A draw is scored 0.5 explicitly, NOT via `places`. Equal places are how OpenSkill expresses
      // a draw, but they also make `placementScore` return 1 for BOTH sides of a drawn duel — which
      // put both into meritDelta's win branch and minted Merit out of nothing (+20 each).
      const score = team.result === "drawn" ? 0.5 : placementScore(places[teamIndex], teams.length);

      for (const [memberIndex, playerId] of team.playerIds.entries()) {
        const after = rated[teamIndex][memberIndex];

        await tx.playerSkill.upsert({
          where: { playerId_mode: { playerId, mode: match.mode } },
          create: { playerId, mode: match.mode, mu: after.mu, sigma: after.sigma, games: 1 },
          update: { mu: after.mu, sigma: after.sigma, games: { increment: 1 } },
        });

        if (!hasLadder) {
          continue;
        }

        // Merit is sized off the rating BEFORE this game (what we predicted), and the ladder position
        // the player is climbing from — not the post-game numbers.
        const ladder: StoredLadder = ladders.get(playerId) ?? {
          ...startingLadder(ranks),
          peak: null,
        };
        const gap = skillOrdinal(skills.get(playerId)!) - anchorOrdinalOf(ladder, ranks);
        const delta = meritDelta(expected, score, gap);
        const next = this.promote(applyMerit(ladder, delta, ranks), ladder, ranks);

        if (next === null) {
          continue;
        }

        await tx.playerRank.upsert({
          where: { playerId_mode: { playerId, mode: match.mode } },
          create: {
            playerId,
            mode: match.mode,
            rankCode: next.rank,
            division: next.division,
            merit: next.merit,
            peakRankCode: next.rank,
          },
          update: {
            rankCode: next.rank,
            division: next.division,
            merit: next.merit,
            peakRankCode: next.peak,
          },
        });

        await tx.meritEvent.upsert({
          where: { matchId_playerId: { matchId, playerId } },
          create: {
            matchId,
            playerId,
            delta,
            rankAfterCode: next.rank,
            divisionAfter: next.division,
          },
          update: { delta, rankAfterCode: next.rank, divisionAfter: next.division },
        });
      }
    }

    logger.info(`[ranking] rated match ${matchId} (${teams.length} teams, ${match.mode}).`);
  }

  // ── internals ───────────────────────────────────────────────────────────────────────────────────

  private async loadSkills(
    tx: Db,
    playerIds: string[],
    mode: GameMode,
  ): Promise<Map<string, Skill>> {
    const rows = await tx.playerSkill.findMany({
      where: { mode, playerId: { in: playerIds } },
      select: { playerId: true, mu: true, sigma: true },
    });
    const skills = new Map(playerIds.map((id) => [id, defaultSkill()]));

    for (const row of rows) {
      skills.set(row.playerId, { mu: row.mu, sigma: row.sigma });
    }

    return skills;
  }

  private async loadLadders(
    tx: Db,
    playerIds: string[],
    mode: GameMode,
  ): Promise<Map<string, StoredLadder>> {
    const rows = await tx.playerRank.findMany({ where: { mode, playerId: { in: playerIds } } });

    return new Map(
      rows.map((row) => [
        row.playerId,
        {
          rank: row.rankCode,
          division: row.division,
          merit: row.merit,
          // The peak must come from storage, not from this match's starting position — comparing
          // against the latter permanently downgrades a peak the moment a demoted player plays again.
          peak: row.peakRankCode,
        },
      ]),
    );
  }

  /**
   * Keep a player out of dormant ranks, and track their peak.
   *
   * `applyMerit` works on the climbable ladder, so it can only land on an ACTIVE rank already — this
   * guards the case where a rank is switched off between seasons and a stored row still names it.
   */
  private promote(
    next: Ladder,
    before: StoredLadder,
    ranks: RankDef[],
  ): (Ladder & { rank: string; peak: string }) | null {
    const orderOf = (code: string | null): number =>
      code === null ? -1 : (ranks.find((entry) => entry.code === code)?.order ?? -1);
    const isActive = ranks.some((entry) => entry.code === next.rank && entry.active);
    const landed = isActive ? next : before;

    // A null rank means the ladder has no position to place this player on, so there is nothing to
    // persist. Unreachable while a climbable band exists (the caller checks), but narrowing it here
    // is what lets the write below stay type-safe without an assertion.
    if (landed.rank === null) {
      return null;
    }

    // Compare against the STORED peak, which may outrank both the current and the starting position.
    const storedPeak = before.peak ?? before.rank;
    const peak = orderOf(landed.rank) >= orderOf(storedPeak) ? landed.rank : storedPeak;

    return { ...landed, rank: landed.rank, peak: peak ?? landed.rank };
  }
}
