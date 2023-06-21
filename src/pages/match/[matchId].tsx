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
} from "pixijs";
import { useEffect, useRef, useState } from "react";
import { PlayerInMatch } from "shared/types/server-match-state";

import { trpc } from "frontend/utils/trpc-client";
import getJSON from "../api/spriteSheet/getJSON";



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
  /*

THE PROBLEM:

We have multiple sprite sheets, we need to be able to pick the sprite sheets depending on the user

solution: get data of match, pick sprite sheets based on that.




 */
  //Important useEffect to make sure Pixi
  // only gets updated when pixiCanvasRef or mapData changes
  // we dont want it to be refreshed in react everytime something changes.
  useEffect(() => {
    //logging our mapData just in case you need to see it in the console.
    console.log(mapData);
    console.log(players);
    const app = new Application({
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      view: pixiCanvasRef.current,
      resolution: window.devicePixelRatio || 1,
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

    app.stage.addChild(mapContainer);

    const texture = BaseTexture.from(parsedData.meta.image);
    const spritesheet = new Spritesheet(texture, parsedData);
    spritesheet.parse();
    const buildings = [
      "Airport",
      "Base",
      "City",
      "ComTower",
      "HQ",
      "Lab",
      "Port",
    ];
    buildings.forEach((building, index) => {
      const tile = new AnimatedSprite(spritesheet.animations[building]);
      tile.x = index * 32;
      tile.y = 16;
      tile.animationSpeed = 0.02;
      tile.play();
      mapContainer.addChild(tile);
    });

    return () => {
      app.stop();
    };
  }, [pixiCanvasRef, mapData]);

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
  console.log(process.cwd);
  //lets get orangeStar buildings
  const res = await getJSON("orangeStarBuildings");

  const parsedData = JSON.parse(res)

  return {props: {parsedData}};
}