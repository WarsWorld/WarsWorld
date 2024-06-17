import type { LeagueType } from "@prisma/client";
import type { CO, COID } from "shared/schemas/co";
import type { MatchRules } from "shared/schemas/match-rules";

export type MapSetting = {
  mapId: string; //?
  matchRules: MatchRules;
  allowedCOs: (CO | COID)[]; //depending if matchRules has its own game version or not, we need CO version
};

// we are probably gonna have these lists in JSON files for easier editing, and they are gonna define
// the current map rotation.
const exampleMapSettingList: MapSetting[] = [
  {
    mapId: "map",
    matchRules: {
      timeRestrictions: {
        startingSeconds: 10,
        maxTurnSeconds: 10,
        turnSecondsIncrement: 2,
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
        startingSeconds: 10,
        maxTurnSeconds: 10,
        turnSecondsIncrement: 2,
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

// it's a partial record because not all leagueTypes will have an active queue for now
export const mapSettingListMap: Partial<Record<LeagueType, MapSetting[]>> = {
  standard: exampleMapSettingList,
  fog: exampleMapSettingList,
  highFunds: exampleMapSettingList,
};

export const getRandomMapSetting = (leagueType: LeagueType) => {
  const mapSettings = mapSettingListMap[leagueType];

  if (mapSettings && mapSettings.length > 0) {
    return mapSettings[Math.floor(Math.random() * mapSettings.length)];
  }

  return undefined;
};
