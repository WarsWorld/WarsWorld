import { describe, expect, it } from "vitest";
import {
  BASE_MERIT,
  DIVISIONS_PER_RANK,
  LADDER_CEILING,
  MERIT_PER_DIVISION,
  ORDINAL_CEIL,
  anchorOrdinalOf,
  apexRankOf,
  applyMerit,
  climbable,
  entryRankOf,
  ladderFromTotal,
  meritDelta,
  startingLadder,
  totalMeritOf,
  type Ladder,
  type RankDef,
} from "server/ranking/merit";

/**
 * Military Merit + the ladder — pure, no DB. This is the displayed half of ranked, so it's the half
 * players will argue about; every claim the plan's table makes is locked here.
 */

/**
 * The ladder definition the DB seeds. Ranks are DATA now, so these tests pin the math against a
 * FIXTURE rather than a module constant — which is the point: swapping the ladder is a reseed, and
 * the rules below must hold for whatever ladder is handed to them.
 *
 * sergeant/major/colonel ship inactive, exactly as seeded, so "skips dormant ranks" stays testable.
 */
const RANKS: RankDef[] = [
  { code: "cadet", order: 0, active: true, hasDivisions: false, populationShare: null },
  { code: "private", order: 1, active: true, hasDivisions: true, populationShare: 0.4 },
  { code: "sergeant", order: 2, active: false, hasDivisions: true, populationShare: null },
  { code: "lieutenant", order: 3, active: true, hasDivisions: true, populationShare: 0.75 },
  { code: "captain", order: 4, active: true, hasDivisions: true, populationShare: 0.95 },
  { code: "major", order: 5, active: false, hasDivisions: true, populationShare: null },
  { code: "colonel", order: 6, active: false, hasDivisions: true, populationShare: null },
  { code: "marechal", order: 7, active: true, hasDivisions: false, populationShare: 1 },
];

const hasDivisions = (code: string): boolean =>
  RANKS.find((rank) => rank.code === code)?.hasDivisions ?? false;

const at = (rank: Ladder["rank"], division: number, merit = 0): Ladder => ({
  rank,
  division,
  merit,
});

describe("ladder geometry", () => {
  it("round-trips a position through its linear Merit coordinate", () => {
    for (const ladder of [
      at("private", 5),
      at("private", 1, 99),
      at("lieutenant", 3, 50),
      at("captain", 1, 99),
    ]) {
      expect(ladderFromTotal(totalMeritOf(ladder, RANKS), RANKS)).toEqual(ladder);
    }
  });

  it("starts a fresh player in placements, below the ladder", () => {
    expect(startingLadder(RANKS)).toEqual({
      rank: "cadet",
      division: DIVISIONS_PER_RANK,
      merit: 0,
    });
    expect(totalMeritOf(startingLadder(RANKS), RANKS)).toBe(0);
  });

  it("counts divisions DOWN — V is the bottom, I the top of a rank", () => {
    expect(totalMeritOf(at("private", 5), RANKS)).toBeLessThan(
      totalMeritOf(at("private", 1), RANKS),
    );
  });

  it("promotes across a division at 100 Merit, and across a rank at the top of one", () => {
    expect(applyMerit(at("private", 5, 90), 20, RANKS)).toEqual(at("private", 4, 10));
    // Private I + 100 -> the next active rank. Sergeant is dormant, so that's Lieutenant.
    expect(applyMerit(at("private", 1, 90), 20, RANKS)).toEqual(at("lieutenant", 5, 10));
  });

  it("demotes back down, and floors at the bottom of the ladder", () => {
    expect(applyMerit(at("lieutenant", 5, 10), -20, RANKS)).toEqual(at("private", 1, 90));
    expect(applyMerit(at("private", 5, 10), -50, RANKS)).toEqual(at("private", 5, 0));
  });

  it("skips dormant ranks entirely — the ladder is the ACTIVE rows, not every seeded rank", () => {
    const climbed = Array.from({ length: DIVISIONS_PER_RANK * 3 }, (_, i) => i).reduce(
      (ladder) => applyMerit(ladder, MERIT_PER_DIVISION, RANKS),
      at("private", 5),
    );

    // Never lands on sergeant/major/colonel, which are seeded but inactive.
    expect(climbable(RANKS).map((rank) => rank.code)).not.toContain("sergeant");
    expect(["lieutenant", "captain", "marechal"]).toContain(climbed.rank);
  });

  it("makes marechal an apex: no divisions, unbounded Merit so the top still sorts", () => {
    expect(hasDivisions("marechal")).toBe(false);
    expect(hasDivisions("cadet")).toBe(false);
    expect(hasDivisions("captain")).toBe(true);

    const apex = ladderFromTotal(LADDER_CEILING(RANKS) + 250, RANKS);
    expect(apex.rank).toBe("marechal");
    expect(apex.merit).toBe(250);
    // Still climbing above the ceiling: two Marechals are comparable.
    expect(totalMeritOf(applyMerit(apex, 30, RANKS), RANKS)).toBeGreaterThan(
      totalMeritOf(apex, RANKS),
    );
  });
});

describe("ladder endpoints are derived, not named", () => {
  /**
   * The whole point of the `Rank` table: the math must not know that placements are called "cadet"
   * or the apex "marechal". Both are found structurally — a divisionless rank below the climbable
   * band is the entry, one above it is the apex.
   */
  it("finds the endpoints from order + hasDivisions", () => {
    expect(entryRankOf(RANKS)?.code).toBe("cadet");
    expect(apexRankOf(RANKS)?.code).toBe("marechal");
  });

  it("follows a completely renamed ladder", () => {
    const renamed: RankDef[] = [
      { code: "novice", order: 0, active: true, hasDivisions: false, populationShare: null },
      { code: "bronze", order: 1, active: true, hasDivisions: true, populationShare: null },
      { code: "silver", order: 2, active: true, hasDivisions: true, populationShare: null },
      { code: "legend", order: 3, active: true, hasDivisions: false, populationShare: null },
    ];

    expect(entryRankOf(renamed)?.code).toBe("novice");
    expect(apexRankOf(renamed)?.code).toBe("legend");
    expect(startingLadder(renamed).rank).toBe("novice");
    // Climbing off the top lands on the renamed apex, not on a hardcoded "marechal".
    expect(ladderFromTotal(LADDER_CEILING(renamed) + 10, renamed).rank).toBe("legend");
  });

  it("has no endpoints when the ladder omits them", () => {
    const bandOnly: RankDef[] = [
      { code: "bronze", order: 1, active: true, hasDivisions: true, populationShare: null },
      { code: "silver", order: 2, active: true, hasDivisions: true, populationShare: null },
    ];

    expect(entryRankOf(bandOnly)).toBeUndefined();
    expect(apexRankOf(bandOnly)).toBeUndefined();
    expect(startingLadder(bandOnly).rank).toBeNull();
    // With no apex, the climb stops at the top of the band rather than inventing a position.
    expect(ladderFromTotal(LADDER_CEILING(bandOnly) + 500, bandOnly).rank).toBe("silver");
  });

  it("ignores an inactive endpoint", () => {
    const dormantApex = RANKS.map((rank) =>
      rank.code === "marechal" ? { ...rank, active: false } : rank,
    );

    expect(apexRankOf(dormantApex)).toBeUndefined();
  });
});

describe("an unseeded ladder", () => {
  /**
   * Ranks are DATA, so an empty `Rank` table is a real state: the ranked system simply doesn't exist
   * in that deployment. It must degrade to "nobody has a rank", NOT to "everybody is at the apex" —
   * with no ranks the ceiling is 0, so an unguarded `total >= ceiling` crowns every player Marechal.
   */
  it("leaves everyone at the entry position instead of crowning them", () => {
    expect(ladderFromTotal(0, [])).toEqual(startingLadder([]));
    expect(ladderFromTotal(5000, [])).toEqual(startingLadder([]));
    expect(ladderFromTotal(5000, []).rank).not.toBe("marechal");
  });

  it("has no climbable ladder at all", () => {
    expect(climbable([])).toEqual([]);
    // A ladder of only inactive ranks is the same situation.
    expect(climbable(RANKS.map((rank) => ({ ...rank, active: false })))).toEqual([]);
  });

  it("cannot be climbed — applying Merit is a no-op", () => {
    expect(applyMerit(startingLadder([]), 500, [])).toEqual(startingLadder([]));
  });
});

describe("anchorOrdinalOf", () => {
  /** The convergence term compares skill to rank, so both must be in ordinal units — not Merit. */
  it("projects a ladder position onto the ordinal scale, rising with rank", () => {
    expect(anchorOrdinalOf(at("private", 5), RANKS)).toBe(0);
    expect(anchorOrdinalOf(ladderFromTotal(LADDER_CEILING(RANKS), RANKS), RANKS)).toBeCloseTo(
      ORDINAL_CEIL,
      5,
    );
    expect(anchorOrdinalOf(at("captain", 1), RANKS)).toBeGreaterThan(
      anchorOrdinalOf(at("private", 1), RANKS),
    );
  });
});

describe("meritDelta", () => {
  /** The headline promise: an even, converged game is a predictable ±20. */
  it("pays ±BASE_MERIT for an even match at a converged rank", () => {
    expect(meritDelta(0.5, 1, 0)).toBe(BASE_MERIT);
    expect(meritDelta(0.5, 0, 0)).toBe(-BASE_MERIT);
  });

  /** "Balanced by the expected result" — this IS Elo's (S − E), rescaled. */
  it("pays more for beating a favourite, and less for beating an underdog", () => {
    expect(meritDelta(0.2, 1, 0)).toBe(32);
    expect(meritDelta(0.85, 1, 0)).toBe(6);
  });

  it("punishes losing to an underdog, and forgives losing to a favourite", () => {
    expect(meritDelta(0.85, 0, 0)).toBe(-34);
    expect(meritDelta(0.2, 0, 0)).toBe(-8);
  });

  /** A win always pays and a loss always costs — never 0, however lopsided. */
  it("clamps so a win never yields nothing and a loss is never free", () => {
    expect(meritDelta(0.99, 1, 0)).toBeGreaterThanOrEqual(5);
    expect(meritDelta(0.01, 0, 0)).toBeLessThanOrEqual(-5);
    expect(meritDelta(0.01, 1, 30)).toBeLessThanOrEqual(40);
    expect(meritDelta(0.99, 0, -30)).toBeGreaterThanOrEqual(-40);
  });

  /** The LoL trick: rank chases skill, so a smurf climbs and an over-ranked player slides. */
  it("nudges an under-ranked player up faster and an over-ranked one down faster", () => {
    const underWin = meritDelta(0.5, 1, 30);
    const underLoss = meritDelta(0.5, 0, 30);
    expect(underWin).toBeGreaterThan(BASE_MERIT);
    expect(underLoss).toBeGreaterThan(-BASE_MERIT); // loses less

    const overWin = meritDelta(0.5, 1, -30);
    const overLoss = meritDelta(0.5, 0, -30);
    expect(overWin).toBeLessThan(BASE_MERIT); // gains less
    expect(overLoss).toBeLessThan(-BASE_MERIT); // loses more
  });

  it("treats a draw as its own thing, not a nudged win or loss", () => {
    expect(meritDelta(0.5, 0.5, 0)).toBe(0);
    // `expected` is THIS player's win probability. Holding a favourite (E=0.1) to a draw beat the
    // prediction, so it pays...
    expect(meritDelta(0.1, 0.5, 0)).toBeGreaterThan(0);
    // ...and being held to one as the favourite (E=0.9) did not, so it costs.
    expect(meritDelta(0.9, 0.5, 0)).toBeLessThan(0);
  });
});
