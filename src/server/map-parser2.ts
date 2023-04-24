import { WWMap } from "components/schemas/map";

type AWBWMapData = {
  name: string;
  tileData: number[];
  width: number;
};

const convertAWBWMapToWWMap = (awbwMapData: AWBWMapData): WWMap => {
  return {
    name: awbwMapData.name,
    tiles: [
      [
        {
          type: "plain",
        },
      ],
    ],
  };
};
