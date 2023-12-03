import type { PlayerInMatchWrapper } from "shared/wrappers/player-in-match";

export function gainFunds(player: PlayerInMatchWrapper) {
  let numberOfFundsGivingProperties = 0;

  for (const changeableTile of player.match.changeableTiles) {
    if (
      changeableTile.type !== "lab" &&
      changeableTile.type !== "commtower" &&
      player.owns(changeableTile)
    ) {
      numberOfFundsGivingProperties++;
    }
  }

  let { fundsPerProperty } = player.match.rules;

  if (player.data.coId.name === "sasha") {
    fundsPerProperty += 100;
  }

  player.data.funds += numberOfFundsGivingProperties * fundsPerProperty;
}
