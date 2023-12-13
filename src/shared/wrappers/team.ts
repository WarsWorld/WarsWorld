import type { WWUnit } from "shared/schemas/unit";
import type { PlayerInMatch } from "shared/types/server-match-state";
import type { MatchWrapper } from "./match";
import { PlayerInMatchWrapper } from "./player-in-match";
import { Vision } from "./vision";

export class TeamWrapper {
  public players: PlayerInMatchWrapper[];
  private vision: Vision = new Vision(this);

  constructor(
    players: PlayerInMatch[],
    public match: MatchWrapper,
    public index: number
  ) {
    this.players = players.map((p) => new PlayerInMatchWrapper(p, this));
  }

  getUnits() {
    return this.players.flatMap((player) => player.getUnits());
  }

  getEnemyUnits() {
    const playerSlotsOfTeam = this.players.map((p) => p.data.slot);

    return this.match.units.filter(
      (unit) => !playerSlotsOfTeam.includes(unit.data.playerSlot)
    );
  }

  getEnemyUnitsInVision() {

    const playerSlots = this.players.map((player) => player.data.slot);

    return this.getEnemyUnits()
      .filter((enemy) => {
        const tile = enemy.getTile();

        // units hidden by ability (sub/stealth) also get revealed on owned properties
        if ("playerSlot" in tile && playerSlots.includes(tile.playerSlot)) {
          return true;
        }

        // sub or stealth ability
        const isHiddenThroughAbility =
          "hidden" in enemy.data && enemy.data.hidden;

        if (isHiddenThroughAbility) {
          return enemy
            .getNeighbouringUnits()
            .some((unit) => playerSlots.includes(unit.data.playerSlot));
        }

        return this.vision.isPositionVisible(enemy.data.position);
      })
      .map<WWUnit>((visibleEnemyUnit) => {
        if (visibleEnemyUnit.player.data.coId.name === "sonja") {
          return {
            ...visibleEnemyUnit.data,
            stats: "hidden"
          };
        }

        return visibleEnemyUnit.data;
      });
  }

  addUnwrappedPlayer(player: PlayerInMatch): PlayerInMatchWrapper {
    const playerWrapper = new PlayerInMatchWrapper(player, this)
    this.players.push(playerWrapper);
    return playerWrapper
  }

  refreshVision() {
    this.vision = new Vision(this)
  }

  getVision() {
    return this.vision;
  }
}
