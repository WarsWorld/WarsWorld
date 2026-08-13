import { describe, expect, it } from "vitest";
import {
  defaultSkill,
  expectedScore,
  inPlacements,
  placeForResult,
  placementScore,
  rateMatch,
  skillOrdinal,
  winProbability,
} from "server/ranking/skill";

/**
 * Our OpenSkill wiring — NOT OpenSkill itself (it's a tested library; re-testing it would just
 * assert its arithmetic back at it). What's locked here is the part we could get wrong: that a duel
 * moves both sides symmetrically, that teams and FFA are rated at all, that a draw is a draw, and
 * that the placement gate reads sigma.
 */

const settled = (mu: number) => ({ mu, sigma: 1.5 });

describe("defaults", () => {
  it("starts every player at the OpenSkill default, whose ordinal is exactly 0", () => {
    const fresh = defaultSkill();
    expect(fresh.mu).toBe(25);
    expect(fresh.sigma).toBeCloseTo(25 / 3, 6);
    expect(skillOrdinal(fresh)).toBeCloseTo(0, 6);
  });

  it("charges for uncertainty: ordinal rises as sigma settles at the same mu", () => {
    expect(skillOrdinal(settled(25))).toBeGreaterThan(skillOrdinal(defaultSkill()));
  });
});

describe("winProbability", () => {
  it("is 0.5 between identical ratings", () => {
    expect(winProbability([defaultSkill()], [defaultSkill()])).toBeCloseTo(0.5, 6);
  });

  /** The reason the matchmaker gates on this rather than a rating gap (plan §4.1). */
  it("depends on sigma, not just the mu gap", () => {
    const fresh = winProbability([{ mu: 33, sigma: 8.333 }], [{ mu: 25, sigma: 8.333 }]);
    const settledGap = winProbability([settled(33)], [settled(25)]);

    expect(settledGap).toBeGreaterThan(fresh);
  });
});

describe("rateMatch", () => {
  it("moves a duel symmetrically and shrinks both sigmas", () => {
    const [[winner], [loser]] = rateMatch([[defaultSkill()], [defaultSkill()]], [1, 2]);

    expect(winner.mu).toBeGreaterThan(25);
    expect(loser.mu).toBeLessThan(25);
    // Zero-sum in mu for an even duel.
    expect(winner.mu - 25).toBeCloseTo(25 - loser.mu, 6);
    // Both learned something, whoever won.
    expect(winner.sigma).toBeLessThan(defaultSkill().sigma);
    expect(loser.sigma).toBeLessThan(defaultSkill().sigma);
  });

  it("leaves mu alone on a draw (equal places) but still shrinks sigma", () => {
    const [[a], [b]] = rateMatch([[defaultSkill()], [defaultSkill()]], [1, 1]);

    expect(a.mu).toBeCloseTo(25, 6);
    expect(b.mu).toBeCloseTo(25, 6);
    expect(a.sigma).toBeLessThan(defaultSkill().sigma);
  });

  it("rates a free-for-all from finishing order", () => {
    const rated = rateMatch(
      [[defaultSkill()], [defaultSkill()], [defaultSkill()], [defaultSkill()]],
      [1, 2, 3, 4],
    );
    const mus = rated.map((team) => team[0].mu);

    // Strictly decreasing: 1st gains most, last loses most.
    expect(mus[0]).toBeGreaterThan(mus[1]);
    expect(mus[1]).toBeGreaterThan(mus[2]);
    expect(mus[2]).toBeGreaterThan(mus[3]);
  });

  /** The team-average hack the old Elo apologised for: a 2v2 should NOT move both members alike. */
  it("splits credit inside a team by rating, not evenly", () => {
    const [winners] = rateMatch(
      [
        [settled(30), defaultSkill()],
        [settled(25), settled(25)],
      ],
      [1, 2],
    );

    const strongGain = winners[0].mu - 30;
    const weakGain = winners[1].mu - 25;

    expect(strongGain).not.toBeCloseTo(weakGain, 3);
  });
});

describe("scores and places", () => {
  it("maps a result to a 1-based place, drawn sharing first", () => {
    expect(placeForResult("won")).toBe(1);
    expect(placeForResult("drawn")).toBe(1);
    expect(placeForResult("lost")).toBe(2);
    expect(placeForResult(null)).toBe(2);
  });

  it("normalises placement to 1..0, collapsing to win/loss for a duel", () => {
    expect(placementScore(1, 2)).toBe(1);
    expect(placementScore(2, 2)).toBe(0);
    // 4-player FFA: 2nd of 4 is two-thirds of the way up.
    expect(placementScore(2, 4)).toBeCloseTo(2 / 3, 6);
    expect(placementScore(4, 4)).toBe(0);
  });

  it("gives every side an even expectation when all ratings match", () => {
    const teams = [[defaultSkill()], [defaultSkill()], [defaultSkill()], [defaultSkill()]];
    expect(expectedScore(teams, 0)).toBeCloseTo(0.25, 6);
  });
});

describe("placements", () => {
  /** A confidence gate, not a game count — OpenSkill says when it's settled. */
  it("holds a player in placements until sigma settles", () => {
    expect(inPlacements(defaultSkill())).toBe(true);
    expect(inPlacements(settled(25))).toBe(false);
  });

  /**
   * Regression: the gate must be REACHABLE. Sigma decays far slower than it looks, so a threshold set
   * too low silently traps players in placements and hides the ladder entirely.
   */
  it("lets a normal mixed record out of placements within ~10 games", () => {
    let a = defaultSkill();
    let b = defaultSkill();

    for (let game = 1; game <= 10; game++) {
      [[a], [b]] = game % 2 === 1 ? rateMatch([[a], [b]], [1, 2]) : rateMatch([[a], [b]], [2, 1]);
    }

    expect(inPlacements(a)).toBe(false);
  });

  /**
   * The nastier case: an UNBEATEN player's sigma plateaus (~5.8), because winning as expected teaches
   * the model nothing. A gate below that plateau would trap exactly the players who most want a rank.
   */
  it("lets an unbeaten player out too — the gate sits above the plateau", () => {
    let a = defaultSkill();
    let b = defaultSkill();

    for (let game = 0; game < 15; game++) {
      [[a], [b]] = rateMatch([[a], [b]], [1, 2]);
    }

    expect(inPlacements(a)).toBe(false);

    // ...and the plateau is real: 40 straight wins never gets near the old 4.0 gate.
    for (let game = 0; game < 25; game++) {
      [[a], [b]] = rateMatch([[a], [b]], [1, 2]);
    }

    expect(a.sigma).toBeGreaterThan(4.0);
  });
});
