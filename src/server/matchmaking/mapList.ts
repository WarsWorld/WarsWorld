import type { CO, COID } from "shared/schemas/co";
import type { MatchRules } from "shared/schemas/match-rules";
import { z } from "zod";

export type MapSetting = {
  mapId: string; //?
  matchRules: MatchRules;
  allowedCOs: (CO | COID)[]; //depending if matchRules has its own game version or not, we need CO version
};

export const leagueQueuesSchema = z.enum(["STD", "FOW", "HF"]);
export type LeagueQueues = z.infer<typeof leagueQueuesSchema>;

// we are probably gonna have these lists in JSON files for easier editing, and they are gonna define
// the current map rotation.
const exampleMapSettingList: MapSetting[] = [
  {
    mapId: "map",
    matchRules: {
      timeRestrictions: {
        startingMinutes: 10,
        maxTurnMinutes: 10,
        turnMinutesIncrement: 2,
      },
      unitCapPerPlayer: 50,
      fogOfWar: false,
      gameVersion: "AWDS",
      fundsPerProperty: 1000,
      labUnitTypes: [],
      bannedUnitTypes: ["blackBomb"],
      captureLimit: 20,
      dayLimit: 35,
      weatherSetting: "clear",
      teamMapping: [0, 1],
    },
    allowedCOs: ["adder", "andy"],
  },

  {
    mapId: "map2",
    matchRules: {
      timeRestrictions: {
        startingMinutes: 10,
        maxTurnMinutes: 10,
        turnMinutesIncrement: 2,
      },
      unitCapPerPlayer: 50,
      fogOfWar: false,
      gameVersion: "AWDS",
      fundsPerProperty: 1000,
      labUnitTypes: [],
      bannedUnitTypes: ["blackBomb"],
      captureLimit: 25,
      dayLimit: 35,
      weatherSetting: "clear",
      teamMapping: [0, 1],
    },
    allowedCOs: ["adder", "andy", "hachi"],
  },
];

export const mapSettingListMap: Record<LeagueQueues, MapSetting[]> = {
  STD: exampleMapSettingList,
  FOW: exampleMapSettingList,
  HF: exampleMapSettingList,
};
