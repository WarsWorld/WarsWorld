import { TileType } from "server/schemas/tile";
import { tiles } from "./tiles";

/**
 * Calculate the defense of a unit.
 * Specifically, this calculates `D_TR * HP_D` as defined at
 * https://awbw.fandom.com/wiki/Damage_Formula
 *
 * @param hp the current hp of the unit, an integer from 1 to 100
 * @param tileType the tile which the unit is on, e.g. "plains"
 */
export const getUnitTerrainDefense = (hp: number, tileType: TileType) => {
  /**
   * We *store* health as a number from 1 to 100,
   * and *display* health as a number from 1 to 10, by dividing by 10 with rounding.
   * The damage formula is based this "visual health".
   */
  const visualHp = Math.ceil(hp / 10);
  return tiles[tileType].defenseStars * visualHp;
};
