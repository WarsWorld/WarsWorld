/**
 * Funds every player starts a match with, before any income.
 *
 * Like Advance Wars, players begin at zero and earn income each turn from the properties they own
 * (see `PlayerInMatchWrapper.getFundsPerTurn`). The starting player receives their first income
 * when the match starts (`applyMatchStartEvent`); every other player receives theirs when their
 * turn begins (`applyPassTurnEvent`).
 */
export const INITIAL_FUNDS = 0;
