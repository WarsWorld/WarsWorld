import { prisma } from "../server/prisma/prisma-client";
import { Tile } from "../components/schemas/tile";
import { WWMap } from "@prisma/client";

export interface AWBWMapImportSchema {
  name: string;
  tileDataString: string;
  numberOfPlayers: 2;
}

export const importAWBWMap = (data: AWBWMapImportSchema) =>
  prisma.wWMap
    .create({
      data: {
        name: data.name,
        numberOfPlayers: data.numberOfPlayers,
        tiles: convertAWBWMapToWWMap(data.tileDataString),
      },
    })
    .then(() => console.log("Imported!"))
    .catch((error) => {
      console.error("An error occurred while importing the map");
      console.error(error);
    });

export const convertAWBWMapToWWMap = (
  tileDataString: string,
): WWMap["tiles"] => {
  const tileData2DM = tileDataString
    .trim()
    .split("\n")
    .map((l) =>
      l
        .trim()
        .split(",")
        .map((t) => t.trim()),
    );
  const tileDataFlat = tileData2DM.flat();
  const width = tileData2DM[0].length;

  const parsedArray: Tile[][] = [];
  for (let i = 0; i < width; i++) {
    const emptyArray: Tile[] = [];
    for (let j = 0; j < width; j++) {
      emptyArray.push(awbwTileMapping[tileDataFlat[j + i * width]]);
    }
    parsedArray.push(emptyArray);
  }

  return parsedArray as WWMap["tiles"];
};

const awbwTileMapping: Record<string, Tile> = {
  "1": { type: "plain", variant: "normal" },
  "2": { type: "mountain" },
  "3": { type: "forest" },
  "4": { type: "river", variant: "right-left" },
  "5": { type: "river", variant: "top-bottom" },
  "6": { type: "river", variant: "top-right-bottom-left" },
  "7": { type: "river", variant: "top-right" },
  "8": { type: "river", variant: "right-bottom" },
  "9": { type: "river", variant: "bottom-left" },
  "10": { type: "river", variant: "top-left" },
  "11": { type: "river", variant: "right-bottom-left" },
  "12": { type: "river", variant: "top-bottom-left" },
  "13": { type: "river", variant: "top-right-left" },
  "14": { type: "river", variant: "top-right-bottom" },
  "15": { type: "road", variant: "right-left" },
  "16": { type: "road", variant: "top-bottom" },
  "17": { type: "road", variant: "top-right-bottom-left" },
  "18": { type: "road", variant: "top-right" },
  "19": { type: "road", variant: "right-bottom" },
  "20": { type: "road", variant: "bottom-left" },
  "21": { type: "road", variant: "top-left" },
  "22": { type: "road", variant: "right-bottom-left" },
  "23": { type: "road", variant: "top-bottom-left" },
  "24": { type: "road", variant: "top-right-left" },
  "25": { type: "road", variant: "top-right-bottom" },
  "26": { type: "bridge", variant: "right-left" },
  "27": { type: "bridge", variant: "top-bottom" },
  "28": { type: "sea" },
  "29": { type: "shoal" },
  "30": { type: "shoal" },
  "31": { type: "shoal" },
  "32": { type: "shoal" },
  "33": { type: "reef" },
  "34": { type: "city", playerSlot: -1 },
  "35": { type: "base", playerSlot: -1 },
  "36": { type: "airport", playerSlot: -1 },
  "37": { type: "port", playerSlot: -1 },
  "38": { type: "city", playerSlot: 0 },
  "39": { type: "base", playerSlot: 0 },
  "40": { type: "airport", playerSlot: 0 },
  "41": { type: "hq", playerSlot: 0 },
  "42": { type: "port", playerSlot: 0 },
  "43": { type: "city", playerSlot: 1 },
  "44": { type: "base", playerSlot: 1 },
  "45": { type: "airport", playerSlot: 1 },
  "46": { type: "hq", playerSlot: 1 },
  "47": { type: "port", playerSlot: 1 },
  "48": { type: "city", playerSlot: 2 },
  "49": { type: "base", playerSlot: 2 },
  "50": { type: "airport", playerSlot: 2 },
  "51": { type: "hq", playerSlot: 2 },
  "52": { type: "port", playerSlot: 2 },
  "53": { type: "city", playerSlot: 3 },
  "54": { type: "base", playerSlot: 3 },
  "55": { type: "airport", playerSlot: 3 },
  "56": { type: "hq", playerSlot: 3 },
  "57": { type: "port", playerSlot: 3 },
  "81": { type: "city", playerSlot: 5 },
  "82": { type: "base", playerSlot: 5 },
  "83": { type: "airport", playerSlot: 5 },
  "84": { type: "hq", playerSlot: 5 },
  "85": { type: "port", playerSlot: 5 },
  "86": { type: "city", playerSlot: 6 },
  "87": { type: "base", playerSlot: 6 },
  "88": { type: "airport", playerSlot: 6 },
  "89": { type: "hq", playerSlot: 6 },
  "90": { type: "port", playerSlot: 6 },
  "91": { type: "city", playerSlot: 4 },
  "92": { type: "base", playerSlot: 4 },
  "93": { type: "airport", playerSlot: 4 },
  "94": { type: "hq", playerSlot: 4 },
  "95": { type: "port", playerSlot: 4 },
  "96": { type: "city", playerSlot: 7 },
  "97": { type: "base", playerSlot: 7 },
  "98": { type: "airport", playerSlot: 7 },
  "99": { type: "hq", playerSlot: 7 },
  "100": { type: "port", playerSlot: 7 },
  "101": { type: "pipe", variant: "right-left" },
  "102": { type: "pipe", variant: "top-bottom" },
  "103": { type: "pipe", variant: "top-left" },
  "104": { type: "pipe", variant: "top-right" },
  "105": { type: "pipe", variant: "right-bottom" },
  "106": { type: "pipe", variant: "bottom-left" },
  "107": { type: "pipe", variant: "top" },
  "108": { type: "pipe", variant: "right" },
  "109": { type: "pipe", variant: "bottom" },
  "110": { type: "pipe", variant: "left" },
  "111": { type: "unusedSilo" },
  "112": { type: "usedSilo" },
  "113": { type: "pipeSeam", variant: "right-left", hp: 100 },
  "114": { type: "pipeSeam", variant: "top-bottom", hp: 100 },
  "115": { type: "plain", variant: "broken-pipe-right-left" },
  "116": { type: "plain", variant: "broken-pipe-top-bottom" },
  "117": { type: "base", playerSlot: 8 },
  "118": { type: "airport", playerSlot: 8 },
  "119": { type: "city", playerSlot: 8 },
  "120": { type: "hq", playerSlot: 8 },
  "121": { type: "port", playerSlot: 8 },
  "122": { type: "base", playerSlot: 9 },
  "123": { type: "airport", playerSlot: 9 },
  "124": { type: "city", playerSlot: 9 },
  "125": { type: "hq", playerSlot: 9 },
  "126": { type: "port", playerSlot: 9 },
  "127": { type: "comtower", playerSlot: 8 },
  "128": { type: "comtower", playerSlot: 4 },
  "129": { type: "comtower", playerSlot: 1 },
  "130": { type: "comtower", playerSlot: 7 },
  "131": { type: "comtower", playerSlot: 2 },
  "132": { type: "comtower", playerSlot: 9 },
  "133": { type: "comtower", playerSlot: -1 },
  "134": { type: "comtower", playerSlot: 0 },
  "135": { type: "comtower", playerSlot: 5 },
  "136": { type: "comtower", playerSlot: 3 },
  "137": { type: "comtower", playerSlot: 6 },
  "138": { type: "lab", playerSlot: 8 },
  "139": { type: "lab", playerSlot: 4 },
  "140": { type: "lab", playerSlot: 1 },
  "141": { type: "lab", playerSlot: 7 },
  "142": { type: "lab", playerSlot: 2 },
  "143": { type: "lab", playerSlot: 6 },
  "144": { type: "lab", playerSlot: 9 },
  "145": { type: "lab", playerSlot: -1 },
  "146": { type: "lab", playerSlot: 0 },
  "147": { type: "lab", playerSlot: 5 },
  "148": { type: "lab", playerSlot: 3 },
  "149": { type: "airport", playerSlot: 10 },
  "150": { type: "base", playerSlot: 10 },
  "151": { type: "city", playerSlot: 10 },
  "152": { type: "comtower", playerSlot: 10 },
  "153": { type: "hq", playerSlot: 10 },
  "154": { type: "lab", playerSlot: 10 },
  "155": { type: "port", playerSlot: 10 },
  "156": { type: "airport", playerSlot: 11 },
  "157": { type: "base", playerSlot: 11 },
  "158": { type: "city", playerSlot: 11 },
  "159": { type: "comtower", playerSlot: 11 },
  "160": { type: "hq", playerSlot: 11 },
  "161": { type: "lab", playerSlot: 11 },
  "162": { type: "port", playerSlot: 11 },
  "163": { type: "airport", playerSlot: 12 },
  "164": { type: "base", playerSlot: 12 },
  "165": { type: "city", playerSlot: 12 },
  "166": { type: "comtower", playerSlot: 12 },
  "167": { type: "hq", playerSlot: 12 },
  "168": { type: "lab", playerSlot: 12 },
  "169": { type: "port", playerSlot: 12 },
  "170": { type: "airport", playerSlot: 13 },
  "171": { type: "base", playerSlot: 13 },
  "172": { type: "city", playerSlot: 13 },
  "173": { type: "comtower", playerSlot: 13 },
  "174": { type: "hq", playerSlot: 13 },
  "175": { type: "lab", playerSlot: 13 },
  "176": { type: "port", playerSlot: 13 },
  "181": { type: "airport", playerSlot: 14 },
  "182": { type: "base", playerSlot: 14 },
  "183": { type: "city", playerSlot: 14 },
  "184": { type: "comtower", playerSlot: 14 },
  "185": { type: "hq", playerSlot: 14 },
  "186": { type: "lab", playerSlot: 14 },
  "187": { type: "port", playerSlot: 14 },
  "188": { type: "airport", playerSlot: 15 },
  "189": { type: "base", playerSlot: 15 },
  "190": { type: "city", playerSlot: 15 },
  "191": { type: "comtower", playerSlot: 15 },
  "192": { type: "hq", playerSlot: 15 },
  "193": { type: "lab", playerSlot: 15 },
  "194": { type: "port", playerSlot: 15 },
};
