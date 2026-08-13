/**
 * The ladder definition, as stored in the `Rank` table. Passed into the pure functions below rather
 * than read from a module constant, so which ranks exist is DATA (swappable by seeding) while how
 * players move across them stays CODE (reviewed and versioned).
 */
export type RankDef = {
  code: string;
  order: number;
  active: boolean;
  hasDivisions: boolean;
  /**
   * Cumulative population share at the top of this rank (0..1), or null for a rank outside the
   * banded range. Percentile placement reads this; the per-rank number is seeded data, so retuning
   * the curve is a reseed rather than a deploy.
   */
  populationShare: number | null;
};

/** Divisions per rank, best-first when displayed (V is the lowest, I the highest). */
export const DIVISIONS_PER_RANK = 5;
export const MERIT_PER_DIVISION = 100;

/**
 * The ladder as actually climbable: active, in order, excluding placements and the apex.
 *
 * Both endpoints sit OUTSIDE the linear coordinate — the entry rank is below it (merit is
 * meaningless during placements) and the apex above it (merit is unbounded so the top still sorts).
 */
export const climbable = (ranks: RankDef[]): RankDef[] =>
  ranks
    .filter((rank) => rank.active && rank.hasDivisions)
    .slice()
    .sort((a, b) => a.order - b.order);

/**
 * The two rankless positions, derived STRUCTURALLY from `order` + `hasDivisions` — never from rank
 * names. A divisionless rank below the climbable band is placements; one above it is the apex.
 *
 * Naming the codes here would put the ladder's vocabulary back in code, which is exactly what the
 * `Rank` table exists to avoid: renaming "cadet" or crowning a differently-named apex is a reseed.
 *
 * Both are `undefined` when the band is empty or the ladder omits an endpoint — callers treat that
 * as "no such position", not as a default.
 */
const rankless = (ranks: RankDef[]): RankDef[] =>
  ranks.filter((rank) => rank.active && !rank.hasDivisions);

export const entryRankOf = (ranks: RankDef[]): RankDef | undefined => {
  const band = climbable(ranks);

  if (band.length === 0) {
    return undefined;
  }

  return rankless(ranks)
    .filter((rank) => rank.order < band[0].order)
    .sort((a, b) => b.order - a.order)[0];
};

export const apexRankOf = (ranks: RankDef[]): RankDef | undefined => {
  const band = climbable(ranks);

  if (band.length === 0) {
    return undefined;
  }

  return rankless(ranks)
    .filter((rank) => rank.order > band[band.length - 1].order)
    .sort((a, b) => a.order - b.order)[0];
};

/** `rank` is null only where the ladder has no such position — an unseeded or endpoint-less ladder. */
export type Ladder = { rank: string | null; division: number; merit: number };

/** Where a fresh player starts: in placements, no rank shown. Null when the ladder has no entry. */
export const startingLadder = (ranks: RankDef[] = []): Ladder => ({
  rank: entryRankOf(ranks)?.code ?? null,
  division: DIVISIONS_PER_RANK,
  merit: 0,
});

/** Total Merit from the bottom of the climbable ladder — the linear coordinate promotions move along. */
export const totalMeritOf = (ladder: Ladder, ranks: RankDef[]): number => {
  const ladderRanks = climbable(ranks);
  const rankIndex = ladderRanks.findIndex((rank) => rank.code === ladder.rank);

  if (rankIndex < 0) {
    // cadet (below the ladder) or marechal (above it): merit is a raw score, not a position.
    return ladder.rank !== null && ladder.rank === apexRankOf(ranks)?.code
      ? ladderRanks.length * DIVISIONS_PER_RANK * MERIT_PER_DIVISION + ladder.merit
      : 0;
  }

  // Divisions count DOWN (V is lowest), so invert to get distance travelled.
  const divisionsClimbed = DIVISIONS_PER_RANK - ladder.division;

  return (rankIndex * DIVISIONS_PER_RANK + divisionsClimbed) * MERIT_PER_DIVISION + ladder.merit;
};

/** The inverse: a linear Merit coordinate back to rank + division + remainder. */
export const ladderFromTotal = (total: number, ranks: RankDef[]): Ladder => {
  const ladderRanks = climbable(ranks);

  // No ladder seeded means the ranked system does not exist here: everyone stays at the entry
  // position rather than being swept to the apex. Without this the ceiling is 0, `total >= ceiling`
  // is always true, and every player is crowned Marechal.
  if (ladderRanks.length === 0) {
    return startingLadder(ranks);
  }

  const ceiling = ladderRanks.length * DIVISIONS_PER_RANK * MERIT_PER_DIVISION;

  if (total >= ceiling) {
    const apex = apexRankOf(ranks);

    // Apex: unbounded Merit, so the top of the ladder still sorts. A ladder with no apex has no
    // position above the band, so the climb stops at its top division instead of inventing one.
    if (apex !== undefined) {
      return { rank: apex.code, division: 1, merit: total - ceiling };
    }

    return {
      rank: ladderRanks[ladderRanks.length - 1].code,
      division: 1,
      merit: MERIT_PER_DIVISION - 1,
    };
  }

  const clamped = Math.max(0, total);
  const divisionsTotal = Math.floor(clamped / MERIT_PER_DIVISION);
  const rankIndex = Math.min(
    ladderRanks.length - 1,
    Math.floor(divisionsTotal / DIVISIONS_PER_RANK),
  );
  const divisionsClimbed = divisionsTotal - rankIndex * DIVISIONS_PER_RANK;

  return {
    rank: ladderRanks[rankIndex].code,
    division: DIVISIONS_PER_RANK - divisionsClimbed,
    merit: clamped % MERIT_PER_DIVISION,
  };
};

/** Total Merit at the very top of the climbable ladder — where Marechal begins. */
export const LADDER_CEILING = (ranks: RankDef[]): number =>
  climbable(ranks).length * DIVISIONS_PER_RANK * MERIT_PER_DIVISION;

/**
 * The skill an ordinal-scale player at this ladder position is *expected* to have.
 *
 * The convergence term compares a player's skill to their rank, so both sides must be in the SAME
 * unit. Merit is 0..2000; `ordinal()` is ~0 (fresh) to ~30 (a settled strong player, μ35−3σ). This
 * projects a ladder position onto the ordinal scale so the two are comparable — without it the gap
 * is Merit-minus-ordinal, which is meaningless and would peg the nudge to its clamp forever.
 *
 * The range is a GUESS, like the bands. Revisit once real ordinals exist.
 */
export const ORDINAL_FLOOR = 0;
export const ORDINAL_CEIL = 30;

export const anchorOrdinalOf = (ladder: Ladder, ranks: RankDef[]): number => {
  const ceiling = LADDER_CEILING(ranks);
  const fraction = ceiling === 0 ? 0 : clamp(totalMeritOf(ladder, ranks) / ceiling, 0, 1);

  return ORDINAL_FLOOR + fraction * (ORDINAL_CEIL - ORDINAL_FLOOR);
};

// ── The formula ───────────────────────────────────────────────────────────────────────────────────

/** Merit for an even, converged match. The "certain amount each game" a ladder needs to feel like one. */
export const BASE_MERIT = 20;

/** How far the rank-vs-skill gap can bend a result, either way. */
export const CONVERGENCE_CLAMP = 10;

/**
 * Ordinal points of skill-vs-rank gap per 1 Merit of nudge. At 3.0, the full ±10 arrives at a gap of
 * 30 ordinal points — i.e. bottom-of-ladder skill sitting at the top, or vice versa.
 */
export const CONVERGENCE_SCALE = 3.0;

/** A win always pays, a loss always costs — never 0, however lopsided the match was. */
export const MIN_WIN = 5;
export const MAX_WIN = 40;
export const MIN_LOSS = -40;
export const MAX_LOSS = -5;

const clamp = (value: number, low: number, high: number): number =>
  Math.min(high, Math.max(low, value));

/**
 * Merit for one result.
 *
 * `skillTerm` is Elo's `(S − E)` rescaled: it IS "balanced by the expected result". Beat a favourite
 * and it pays; beat someone you were expected to beat and it barely moves.
 *
 * `convergence` is the LoL trick — nudge the displayed rank toward the hidden skill, so a smurf
 * climbs fast and an over-ranked player slides back, without either being teleported.
 *
 *   even + converged  -> +20 / -20
 *   beat a favourite  -> +32 / -8      (E = 0.2)
 *   beat an underdog  -> +6  / -34     (E = 0.85)
 *   under-ranked      -> +30 / -10
 *   over-ranked       -> +10 / -30
 *
 * @param expected  E: 0..1, from `skill.expectedScore`
 * @param score     S: 1 win / 0.5 draw / 0 loss (or a placement score for FFA)
 * @param skillGap  `skillOrdinal(skill) − anchorOrdinalOf(ladder)` — BOTH in ordinal points
 */
export const meritDelta = (expected: number, score: number, skillGap: number): number => {
  const skillTerm = BASE_MERIT * 2 * (score - expected);
  const convergence = clamp(skillGap / CONVERGENCE_SCALE, -CONVERGENCE_CLAMP, CONVERGENCE_CLAMP);
  const raw = skillTerm + convergence;

  if (score > 0.5) {
    return Math.round(clamp(raw, MIN_WIN, MAX_WIN));
  }

  if (score < 0.5) {
    return Math.round(clamp(raw, MIN_LOSS, MAX_LOSS));
  }

  // A draw shouldn't be dragged into a win or a loss by the convergence nudge alone.
  return Math.round(clamp(raw, MIN_LOSS, MAX_WIN));
};

/**
 * Apply a Merit delta to a ladder position. Promotion and demotion both fall out of the linear
 * coordinate: cross 100 and you move up a division (or into the next rank), drop below 0 and you
 * move down. The floor at 0 is the bottom of the ladder — nothing below Private V.
 *
 * NO demotion grace window yet: a player at 0 Merit who loses drops a division immediately. Worth
 * adding (it's the standard kindness), but it needs somewhere to remember "you're on your last life",
 * which is a schema field — deferred rather than faked.
 */
export const applyMerit = (ladder: Ladder, delta: number, ranks: RankDef[]): Ladder =>
  ladderFromTotal(Math.max(0, totalMeritOf(ladder, ranks) + delta), ranks);
