import { ordinal, predictWin, rate, rating } from "openskill";

/**
 * Pure skill-rating math — the hidden half of the ranked system. No I/O: fed plain numbers, returns
 * plain numbers, so it's exhaustively unit-testable. Replaces `elo.ts`.
 *
 * OpenSkill (Weng-Lin, MIT) rather than Elo or TrueSkill:
 *   - Elo has no uncertainty, so a new player needs ~25 games to find their level, and no concept of
 *     staleness — bad in a game where a turn takes days.
 *   - Elo can't rate teams or FFA. `rate()` handles duel, teams and free-for-all in one call.
 *   - TrueSkill is patented by Microsoft. Do not reach for it.
 *
 * This rating is NEVER shown to a player: it drives pairing and sizes Merit. What they see is their
 * rank + Military Merit (`merit.ts`). A number players can see is a number they play instead of the
 * game.
 */

/** A player's hidden rating. Mirrors OpenSkill's `Rating`, mirrored again by the `PlayerSkill` row. */
export type Skill = { mu: number; sigma: number };

/** OpenSkill defaults: μ 25, σ 25/3 ≈ 8.333. `ordinal()` of a fresh rating is exactly 0. */
export const defaultSkill = (): Skill => rating();

/** A match result from one side's point of view. */
export type Score = 0 | 0.5 | 1;

/**
 * The conservative estimate OpenSkill exposes: μ − 3σ. Use this anywhere a rating is *compared* to a
 * threshold (Merit anchors, leaderboards) — it charges a player for uncertainty, so a lucky 3-game
 * newcomer can't out-rank a settled veteran. Pairing uses μ via {@link winProbability} instead.
 *
 * Starts at 0 for a fresh rating and rises as σ shrinks.
 */
export const skillOrdinal = (skill: Skill): number => ordinal(skill);

/**
 * P(teams[0] beats teams[1]), 0..1. Accounts for BOTH the μ gap and each side's σ, which is why the
 * matchmaker gates on this rather than |Δμ|: there is no fixed μ distance that means "fair", because
 * the same gap is decisive between two settled players and a coin-flip between two provisional ones.
 */
export const winProbability = (a: Skill[], b: Skill[]): number => predictWin([a, b])[0];

/**
 * Expected score for `teams[index]`, 0..1 — the `E` in Merit's `(S − E)` term.
 *
 * For a duel this is exact. For N>2 it is P(winning outright), which is NOT the expectation of a
 * placement score: a player who reliably takes 2nd of 4 has low win probability but a mid-range
 * result. `predictRank` can't fix this — it returns [mostLikelyRank, itsProbability], not a
 * distribution over places (plan §4.2). The effect is that FFA Merit leans toward outright wins,
 * which is defensible for a free-for-all. Revisit with data.
 */
export const expectedScore = (teams: Skill[][], index: number): number => predictWin(teams)[index];

/**
 * Normalised placement score for a finisher: 1st → 1, last → 0, middle → linear.
 * For a duel it collapses to the familiar win=1 / loss=0 (i.e. a {@link Score}).
 */
export const placementScore = (place: number, teamCount: number): number =>
  teamCount <= 1 ? 1 : (teamCount - place) / (teamCount - 1);

/**
 * Rate a finished match. `teams` are the rated sides (one entry each in a duel/FFA, several in 2v2);
 * `places` is each side's finishing position, 1-based, with EQUAL values meaning a draw.
 *
 * Credit inside a team is split by rating — a 2v2 doesn't move both members identically, which is the
 * team-average hack `applyMatchResult` used to apologise for.
 */
export const rateMatch = (teams: Skill[][], places: number[]): Skill[][] =>
  rate(
    teams.map((team) => team.map((member) => ({ mu: member.mu, sigma: member.sigma }))),
    { rank: places },
  ) as Skill[][];

/** Map a stored `MatchPlayer.result` to a 1-based place. Anything not won/drawn counts as a loss. */
export const placeForResult = (result: string | null): number =>
  result === "won" ? 1 : result === "drawn" ? 1 : 2;

/**
 * Is this rating still provisional? While σ is wide the estimate isn't trustworthy, so the player is
 * in placements and shows no rank. A confidence threshold rather than a game count: OpenSkill tells
 * us when it's settled.
 *
 * CALIBRATED AGAINST MEASURED DECAY, not a guess. σ after N duels on this engine:
 *
 *   games:                1      5      10     20     40
 *   mixed record:         8.07   7.14   6.22   4.95   3.60
 *   unbeaten:             8.07   7.28   6.77   6.26   5.81   <- plateaus ~5.8
 *
 * Two things this makes obvious, and an earlier draft got both wrong:
 *
 *   1. σ falls FAR slower than assumed (that draft guessed ~0.27/game and set the gate at 4.0).
 *   2. An UNBEATEN player's σ never reaches 4.0 at all — winning as expected teaches the model
 *      nothing, so it plateaus. The gate has to sit above that plateau or a dominant player is
 *      trapped in placements forever and never sees a rank.
 *
 * 6.5 leaves placements at ~9 games on a mixed record and ~14 unbeaten. `RankCard` says "10 typical",
 * which is honest for both.
 *
 * Re-measure if OpenSkill's tau/beta are tuned: this is downstream of them, and setting it below the
 * unbeaten plateau hides the whole feature.
 */
export const PLACEMENT_SIGMA = 6.5;

export const inPlacements = (skill: Skill): boolean => skill.sigma > PLACEMENT_SIGMA;
