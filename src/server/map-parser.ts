import { Army } from 'utils/wars-world-types';

const terrainCodeToText: Record<string, string> = {
  pl: 'plain',
  fo: 'forest',
  mo: 'mountain',
  sh: 'shoal',
  ri: 'river',
  ro: 'road',
  pi: 'pipe',
  re: 'reef',
  se: 'sea',
  br: 'road',
};

const ownerShipCodeToText: Record<string, Army> = {
  bm: 'blueMoon',
  os: 'orangeStar',
};

const awbwTileMapping: Record<number, string> = {
  '1': 'pl0',
  '3': 'fo0',
  '2': 'mo0',
  '34': 'ne1',
  '111': 'si1',
  '33': 're0',
  //river
  '4': 'ri1',
  '5': 'ri3',
  '7': 'ri8',
  '8': 'ri2',
  '9': 'ri4',
  //road
  '15': 'ro1',
  '16': 'ro3',
  '18': 'ro8',
  '19': 'ro2',
  '20': 'ro4',
  '21': 'ro6',
  //bridge
  '26': 'br1',
  '27': 'br3',
  //ocean
  '28': 'se0',
  //shoal
  '29': 'sh1',
  '30': 'sh5',
  '31': 'sh3',
  '32': 'sh7',
  '37': 'ne4', //port
  //factory
  '35': 'ne2',
  '44': 'bm2',
  '39': 'os2',
  //headquarters
  '42': 'os0',
  '47': 'bm0',
  '105': 'pi1', //pipe
  //pipe ending
  '109': 'pi3',
  '110': 'pi4',
  //comtower
  '133': 'ne5',
};

export type UnitOnMap = {
  // id: number;
  name: string;
  country: Army;
  hp: number;
  isUsed: boolean;
  capture: boolean;
};

export type MapTile = {
  terrainImage: string;
  terrainType: string;
  terrainOwner: Army | null;
  terrainCapture: number;
  unit: false | UnitOnMap;
};

export type PlayerInMatch = {
  id: number;
  username: string;
  co: string;
  color: string;
  armyValue: string;
  timePlayed: number;
  unitCount: number;
  properties: number;
  gold: number;
};

export type PlayerState = {
  turn: number;
  day: number;
  unitsToRefresh: [];
} & Record<Exclude<Army, null>, PlayerInMatch>;

export type MapMetaData = {
  mapName: string;
  columns: number;
  rows: number;
  players: number;
  author: string;
  published: string;
};

export type Match = {
  playerState: PlayerState;
  mapMetaData: MapMetaData;
  mapTiles: MapTile[];
};

const causticFinaleAwbw = [
  34, 3, 1, 5, 1, 1, 34, 3, 2, 2, 3, 7, 9, 2, 34, 26, 28, 111, 1, 1, 34, 26, 3,
  1, 1, 1, 39, 1, 1, 5, 35, 1, 1, 32, 33, 28, 3, 7, 27, 9, 34, 1, 3, 1, 3, 1,
  42, 26, 3, 1, 3, 1, 30, 27, 27, 9, 1, 1, 1, 29, 28, 28, 4, 27, 4, 9, 1, 1, 2,
  3, 1, 34, 16, 34, 3, 2, 32, 30, 30, 28, 34, 16, 34, 1, 1, 3, 1, 1, 1, 2, 16,
  1, 2, 2, 3, 34, 1, 3, 18, 20, 3, 1, 3, 1, 1, 3, 35, 7, 35, 1, 1, 1, 1, 21, 15,
  15, 20, 1, 1, 34, 1, 1, 7, 27, 4, 9, 3, 1, 34, 19, 1, 3, 1, 34, 3, 3, 1, 1, 3,
  34, 5, 47, 1, 3, 1, 1, 3, 16, 1, 1, 1, 2, 2, 2, 3, 1, 18, 15, 26, 1, 1, 2, 2,
  44, 1, 21, 15, 34, 1, 3, 2, 2, 3, 18, 20, 34, 5, 3, 44, 2, 3, 1, 1, 34, 1, 1,
  3, 1, 3, 2, 34, 16, 3, 28, 28, 1, 1, 3, 4, 27, 8, 1, 3, 1, 34, 3, 1, 1, 1, 16,
  1, 32, 28, 3, 1, 34, 2, 16, 28, 29, 29, 2, 1, 1, 34, 1, 3, 21, 34, 32, 31, 1,
  1, 1, 34, 21, 19, 3, 30, 31, 3, 1, 16, 1, 1, 1, 3, 30, 1, 34, 3, 1, 1, 3, 21,
  19, 3, 31, 1, 34, 21, 15, 19, 1, 2, 2, 1, 7, 27, 4, 133, 2, 1, 21, 19, 28, 8,
  1, 1, 3, 34, 1, 2, 3, 1, 26, 34, 1, 110, 105, 2, 3, 21, 15, 26, 1, 39, 1, 1,
  1, 1, 34, 7, 9, 1, 3, 111, 109, 133, 1, 34, 2, 5, 3, 2, 1, 3, 35, 15, 15, 26,
  3, 1, 34,
];

export const awbwMapToWWMap = (): Match => {
  const mapTiles = causticFinaleAwbw.reduce<MapTile[]>(
    (prev, tileValue, index) => {
      const foundMapping = awbwTileMapping[tileValue];

      if (foundMapping === undefined) {
        throw new Error(`Unsupported tile: ${tileValue}`);
      }

      const id = foundMapping.slice(0, 2);

      const terrain = terrainCodeToText[id] ?? 'property';
      const ownerShip = ownerShipCodeToText[id] ?? null;

      if (index === 163) {
        const newTile: MapTile = {
          terrainImage: foundMapping,
          terrainType: terrain,
          terrainOwner: ownerShip,
          terrainCapture: 0,
          unit: {
            // id: 0,
            name: 'Infantry',
            country: 'blueMoon', //countries[Math.floor(Math.random() * 2)],
            hp: 100, //Math.floor(Math.random() * (101 - 1) + 1),
            isUsed: false,
            capture: false,
            //ammo
            //gas
          },
        };

        return [...prev, newTile];
      }

      return [
        ...prev,
        {
          terrainImage: foundMapping,
          terrainType: terrain,
          terrainOwner: ownerShip,
          terrainCapture: 0,
          unit: false,
        },
      ];
    },
    [],
  );

  return {
    mapTiles,
    mapMetaData: {
      mapName: 'Caustic Finale',
      columns: 18,
      rows: 18,
      players: 2,
      author: 'Hellraider',
      published: '05/11/2008',
    },
    playerState: {
      turn: 0,
      day: 1,
      unitsToRefresh: [],
      orangeStar: {
        id: 1,
        username: 'orangeStar',
        co: 'Sami',
        color: 'orange',
        armyValue: '0',
        timePlayed: 10,
        unitCount: 0,
        properties: 3,
        gold: 3000,
      },

      blueMoon: {
        id: 2,
        username: 'blueMoon',
        co: 'Rachel',
        color: 'blue',
        armyValue: '0',
        timePlayed: 100,
        unitCount: 0,
        properties: 3,
        gold: 0,
      },
    },
  };
};
