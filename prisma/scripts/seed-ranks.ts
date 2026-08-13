import { PrismaClient } from "@prisma/client";
import { realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";

/**
 * Seeds the military-rank ladder.
 *
 * Ranks are DATA, not an enum: adding a rank, renaming one, reordering the ladder or switching a
 * dormant rank on is a reseed, not a migration plus deploy. What stays in code is the RULE half —
 * how players distribute across the ladder and how Merit moves (see `server/ranking/merit.ts`).
 *
 * `order` is explicit because the ladder grows in the MIDDLE: sergeant sits between private and
 * lieutenant, so activating it must not renumber everything above it.
 *
 * Activation should only ever change at a season rollover, never mid-season — percentile bands are
 * safe precisely because activation coincides with re-placement.
 *
 * The palette is deliberately NON-METAL: honor insignia own bronze → diamond and render on the same
 * surfaces, so a gold "Captain" disc beside a gold medal would read as one system. The ladder is
 * military titles on a green → orange ramp, earned by winning; honor is metals, earned for conduct.
 *
 * `Maréchal` is accented here and ASCII (`marechal`) in `code` — display is data, identity is not.
 *
 * `populationShare` is the cumulative share of players at the TOP of each rank. Null for placements,
 * which sit outside the banded range. GUESSES — no data behind them; retuning the curve is a reseed,
 * which is why the numbers live here rather than in merit.ts.
 */
const RANKS = [
  {
    code: "cadet",
    label: "Cadet",
    order: 0,
    active: true,
    hasDivisions: false,
    emblem: "@text-slate-500 @outline-slate-500/40",
    populationShare: null,
  },
  {
    code: "private",
    label: "Private",
    order: 1,
    active: true,
    hasDivisions: true,
    emblem: "@text-green-400 @outline-green-400/50",
    populationShare: 0.4,
  },
  {
    code: "sergeant",
    label: "Sergeant",
    order: 2,
    active: false,
    hasDivisions: true,
    emblem: "@text-teal-300 @outline-teal-300/50",
    populationShare: null,
  },
  {
    code: "lieutenant",
    label: "Lieutenant",
    order: 3,
    active: true,
    hasDivisions: true,
    emblem: "@text-blue-400 @outline-blue-400/50",
    populationShare: 0.75,
  },
  {
    code: "captain",
    label: "Captain",
    order: 4,
    active: true,
    hasDivisions: true,
    emblem: "@text-violet-400 @outline-violet-400/50",
    populationShare: 0.95,
  },
  {
    code: "major",
    label: "Major",
    order: 5,
    active: false,
    hasDivisions: true,
    emblem: "@text-fuchsia-400 @outline-fuchsia-400/50",
    populationShare: null,
  },
  {
    code: "colonel",
    label: "Colonel",
    order: 6,
    active: false,
    hasDivisions: true,
    emblem: "@text-rose-400 @outline-rose-400/50",
    populationShare: null,
  },
  {
    code: "marechal",
    label: "Maréchal",
    order: 7,
    active: true,
    hasDivisions: false,
    emblem: "@text-primary @outline-primary",
    populationShare: 1,
  },
];

export const seedRanks = async (prisma: PrismaClient): Promise<void> => {
  // Two passes inside one transaction. `Rank.order` is @unique, so writing final orders row by row
  // collides the moment a reseed SWAPS two ranks — the first upsert of the pair hits the constraint
  // before the second has vacated the value. Parking every row at a negative offset first frees the
  // whole range, and reordering the ladder is exactly what a season rollover does.
  await prisma.$transaction(async (tx) => {
    for (const rank of RANKS) {
      await tx.rank.upsert({
        where: { code: rank.code },
        create: { ...rank, order: -1 - rank.order },
        update: { order: -1 - rank.order },
      });
    }

    for (const rank of RANKS) {
      await tx.rank.update({ where: { code: rank.code }, data: rank });
    }
  });
};

/**
 * Ranks are never deleted here: `code` is referenced by PlayerRank and MeritEvent, so removing a row
 * would orphan history. Retiring a rank means setting `active: false`, which takes it out of the
 * climbable band while leaving stored rows readable. Renaming a `code` is likewise not a reseed — it
 * would create a second row and strand the old references.
 */

const runAsScript =
  process.argv[1] !== undefined && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url);

if (runAsScript) {
  const prisma = new PrismaClient();

  seedRanks(prisma)
    .then(() => console.info(`Seeded ${RANKS.length} ranks.`))
    .catch((error: unknown) => {
      console.error(error);
      process.exitCode = 1;
    })
    .finally(() => void prisma.$disconnect());
}
