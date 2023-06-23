import { usePlayers } from "frontend/context/players";
import { Tile } from "server/schemas/tile";
import { useRouter } from "next/router";
import {
  Application,
  Assets,
  BaseTexture,
  SCALE_MODES,
  Sprite,
  Texture,
  Container,
  Spritesheet,
  AnimatedSprite,
  DisplayObject,
  utils,
} from "pixijs";
import { useEffect, useRef, useState } from "react";
import { Layer } from "@pixi/layers";
import { PlayerInMatch } from "shared/types/server-match-state";

import { trpc } from "frontend/utils/trpc-client";
import getJSON from "../../spriteSheet/getJSON";

BaseTexture.defaultOptions.scaleMode = SCALE_MODES.NEAREST;

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
const Match = ({ parsedData }) => {
  const { currentPlayer } = usePlayers();
  const [players, setPlayers] = useState<PlayerInMatch[] | null | undefined>(
    null
  );
  const [mapData, setMapData] = useState<Tile[][] | null | undefined>(null);
  const pixiCanvasRef = useRef<HTMLCanvasElement>(null);

  const { query } = useRouter();
  const matchId = query.matchId as string;

  // make trpc call to get data and set it as players and mapData
  trpc.match.full.useQuery(
    { matchId, playerId: currentPlayer?.id ?? "" },
    {
      enabled: currentPlayer !== undefined,
      onSuccess(data) {
        if (data === null) {
          throw new Error(`Match ${matchId} not found!`);
        }

        if (!players) {
          setPlayers(data.players);
        }

        if (!mapData) {
          setMapData(data.map.tiles);
        }
      },
    }
  );

  //Important useEffect to make sure Pixi
  // only gets updated when pixiCanvasRef or mapData changes
  // we dont want it to be refreshed in react everytime something changes.
  useEffect(() => {
    const app = new Application({
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      view: pixiCanvasRef.current,
      resolution: 2,
      backgroundColor: "#C0E030",
      width: 500,
      height: 400,
    });
    app.stage.position.set(0, 0);

    //let render our specific cursor
    const awCursor =
      'url("http://localhost:3000/img/spriteSheet/cursor.gif"),auto';
    app.renderer.events.cursorStyles.default = awCursor;

    const mapContainer = new Container();
    mapContainer.x = 25;
    mapContainer.y = 25;
    //allows for us to use zIndex
    mapContainer.sortableChildren = true;
    app.stage.addChild(mapContainer);


    const spriteSheets: Spritesheet[] = [];
    console.log(parsedData.countries);

    parsedData.countries.forEach((country: string) => {
      const texture = BaseTexture.from(parsedData[country].meta.image);
      const sheet = new Spritesheet(texture, parsedData[country]);
      sheet.parse();
      spriteSheets.push(sheet);
    });

    if (mapData != undefined || mapData != null) {
      let tile;
      mapData.forEach((col, colIndex) => {
        mapData[colIndex].forEach((row, rowIndex) => {
          const type = row.type;
          if (row.hasOwnProperty("playerSlot")) {
            const slot: number = row.playerSlot;


            //its neutral
            if (row.playerSlot === -1) {
              tile = new Sprite(spriteSheets[2].textures[type + "-0.png"]);
              //not neutral
            } else {
              tile = new AnimatedSprite(spriteSheets[slot].animations[type]);
              tile.animationSpeed = 0.02;
              tile.play();
            }
          } else {
            if (row.hasOwnProperty("variant")) tile = new Sprite(spriteSheets[2].textures[row.type + "-" + row.variant + ".png" ]);
            else tile = new Sprite(spriteSheets[2].textures[row.type + ".png" ]);
          }
          tile.anchor.set(0.5, 1);
          //tile.zIndex = (mapData.length - colIndex) * 10;
          tile.x = (rowIndex + 1) * 16;
          tile.y = (colIndex + 1) * 16;
          mapContainer.addChild(tile);
        });
      });
    }
    console.log(mapData);
    return () => {
      app.stop();
    };
  }, [pixiCanvasRef, mapData]);









  if (!parsedData) return <h1>Loading...</h1>;
  else {
    return (
      <div className={"@m-10"}>
        <h1>Basic pixi.js dev environment </h1>
        <h2>Basic rendering</h2>
        <canvas
          style={{
            imageRendering: "pixelated",
          }}
          ref={pixiCanvasRef}
          width={800}
          height={600}
        ></canvas>
      </div>
    );
  }
};
export default Match;

/*

export const getStaticPaths: GetStaticPaths<{ slug: string }> = async () => {
  return {
    paths: [], //indicates that no page needs be created at build time
    fallback: "blocking", //indicates the type of fallback
  };
};

export async function getStaticProps() {
  const parsedD = await getJSON("orangeStarBuildings");
  const parsedData = JSON.parse(parsedD);
  return {
    props: {
      parsedData,
    },
  };
}*/
export async function getServerSideProps() {
  const parsedData = await getJSON([
    "orange-star",
    "blue-moon",
    "fake",
    "fake",
    "fake",
    "fake",
  ]);
  //console.log(parsedData);
  return { props: { parsedData } };
}
