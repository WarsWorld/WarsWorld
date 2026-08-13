import { prisma } from "server/prisma/prisma-client";
import { RankingUsecase } from "server/ranking/ranking.usecase";

/**
 * The single startup composition root: construct every feature usecase once, in explicit
 * dependency order, and hand each router its instance from here. Features depend on the narrow
 * cross-feature interfaces — this file is the only place that knows the concrete wiring, so no
 * router imports a sibling router's singleton (see src/server/CLAUDE.md "Explicit wiring":
 * compose once, don't stash module singletons on shared mutable state).
 *
 * One line per feature; it grows as features land.
 */
export const rankingUsecase = new RankingUsecase(prisma);
