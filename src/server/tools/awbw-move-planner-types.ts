/**
 * Type definitions for AWBW Move Planner JSON export format
 */

export interface AWBWMovePlannerExport {
  plannerName: string;
  buildingsState: AWBWBuildingsState;
  unitsState: Record<string, AWBWUnit>;
  fogArray: unknown[]; // Not needed for import
}

export interface AWBWBuildingsState {
  [x: string]: {
    [y: string]: AWBWBuilding | AWBWBuilding[];
  };
}

export interface AWBWBuilding {
  buildings_capture: number;
  buildings_id: number;
  buildings_x: number;
  buildings_y: number;
  terrain_defense: number;
  terrain_id: number;
  terrain_name: string;
  buildings_players_id?: string | number;
  buildings_team?: string;
  countries_code?: string;
  countries_id?: number;
  countries_name?: string;
  is_occupied?: boolean;
  buildings_games_id?: number;
  buildings_last_capture?: number;
  buildings_last_updated?: string;
}

export interface AWBWUnit {
  units_id: number;
  units_games_id?: number;
  units_players_id: string | number;
  units_name: string;
  units_movement_points?: number;
  units_vision?: number;
  units_fuel: number;
  units_fuel_per_turn?: number;
  units_sub_dive?: string;
  units_ammo: number;
  units_short_range?: number;
  units_long_range?: number;
  units_second_weapon?: string;
  units_cost: number;
  units_movement_type?: string;
  units_x: number;
  units_y: number;
  units_moved?: number;
  units_capture?: number;
  units_fired?: number;
  units_hit_points: number;
  units_cargo1_units_id?: number | string;
  units_cargo2_units_id?: number | string;
  units_carried?: string;
  countries_code: string;
  generic_id?: number;
  moved?: number;
}

// Unit name mapping from AWBW to WarsWorld
export const awbwUnitNameToWWType: Record<string, string> = {
  "Infantry": "infantry",
  "Mech": "mech",
  "Recon": "recon",
  "Tank": "tank",
  "APC": "apc",
  "Artillery": "artillery",
  "Anti-Air": "antiAir",
  "Missile": "missile",
  "Rocket": "rocket",
  "Medium Tank": "mediumTank",
  "Md Tank": "mediumTank",
  "Neo Tank": "neoTank",
  "Mega Tank": "megaTank",
  "Megatank": "megaTank",
  "T-Copter": "transportCopter",
  "B-Copter": "battleCopter",
  "Fighter": "fighter",
  "Bomber": "bomber",
  "Stealth": "stealth",
  "Black Bomb": "blackBomb",
  "Black Boat": "blackBoat",
  "Lander": "lander",
  "Cruiser": "cruiser",
  "Sub": "sub",
  "Battleship": "battleship",
  "Carrier": "carrier",
  "Piperunner": "pipeRunner",
  "Pipe Runner": "pipeRunner",
};