import type { WWUnit } from "shared/schemas/unit";
import type { PlayerInMatch } from "shared/types/server-match-state";
import type { Position } from "../schemas/position";
import type { MatchWrapper } from "./match";
import { PlayerInMatchWrapper } from "./player-in-match";
import { Vision } from "./vision";

export class TeamWrapper {
  public players: PlayerInMatchWrapper[];
  public vision: Vision | null = null; // changes from null to vision to null when it rains / clear in awds

  constructor(
    players: PlayerInMatch[],
    public match: MatchWrapper,
    public index: number,
  ) {
    this.players = players.map((p) => new PlayerInMatchWrapper(p, this));

    if (match.isFogOfWar()) {
      this.vision = new Vision(this);
    }
  }

  isPositionVisible(position: Position) {
    if (this.match.isFogOfWar()) {
      if (this.vision === null) {
        this.vision = new Vision(this); // that should not happen, but whatever
      }

      return this.vision.isPositionVisible(position);
    }

    // in clear weather all positions are visible
    return true;
  }

  getUnits() {
    return this.players.flatMap((player) => player.getUnits());
  }

  getEnemyUnits() {
    const playerSlotsOfTeam = this.players.map((p) => p.data.slot);

    return this.match.units.filter((unit) => !playerSlotsOfTeam.includes(unit.data.playerSlot));
  }

  canSeeUnitAtPosition(position: Position) {
    const playerSlots = this.players.map((player) => player.data.slot);
    const tile = this.match.getTile(position);
    const unit = this.match.getUnit(position);

    if (unit === undefined) {
      return false; //no unit in specified position
    }

    if (playerSlots.includes(unit.player.data.slot)) {
      return true; // own unit
    }

    if ("playerSlot" in tile && playerSlots.includes(tile.playerSlot)) {
      return true; // on top of allied property
    }

    // sub or stealth ability
    if ("hidden" in unit.data && unit.data.hidden) {
      return unit.getNeighbouringUnits().some((unit) => playerSlots.includes(unit.data.playerSlot));
    }

    return this.isPositionVisible(unit.data.position);
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
        if ("hidden" in enemy.data && enemy.data.hidden) {
          return enemy
            .getNeighbouringUnits()
            .some((unit) => playerSlots.includes(unit.data.playerSlot));
        }

        return this.isPositionVisible(enemy.data.position);
      })
      .map<WWUnit>((visibleEnemyUnit) => {
        if (visibleEnemyUnit.player.data.coId.name === "sonja") {
          return {
            ...visibleEnemyUnit.data,
            stats: "hidden",
          };
        }

        return visibleEnemyUnit.data;
      });
  }

  addUnwrappedPlayer(player: PlayerInMatch): PlayerInMatchWrapper {
    const playerWrapper = new PlayerInMatchWrapper(player, this);
    this.players.push(playerWrapper);
    return playerWrapper;
  }
}
