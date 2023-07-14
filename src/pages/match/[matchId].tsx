//TODO: Fix TS type issues
// - spriteData props needs a more defiend Type, it's set to any for now because the type is pretty complex
//      and probably the data type will grow in complexity with every feature added.
//      That data Type could be made with zod, idk...
// - mapData of type Type[][] needs a check for row.playerSlot and row.variant to cry.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { usePlayers } from "frontend/context/players";
import { Tile } from "server/schemas/tile";
import { useRouter } from "next/router";
import {
  AnimatedSprite,
  Application,
  BaseTexture,
  Container,
  SCALE_MODES,
  Sprite,
  Spritesheet,
  Texture,
} from "pixi.js";
import { useEffect, useRef, useState } from "react";
import { PlayerInMatch } from "shared/types/server-match-state";

import { trpc } from "frontend/utils/trpc-client";
import { showUnits } from "../../gameFunction/showUnit";
import { demoUnits } from "../../gameFunction/demoUnitList";
import getJSON from "../../gameFunction/getJSON";
import showMenu from "../../gameFunction/showMenu";
import { spriteConstructor } from "../../gameFunction/spriteConstructor";

BaseTexture.defaultOptions.scaleMode = SCALE_MODES.NEAREST;

interface SpriteData {
  spriteData: any;
}

const Match = ({ spriteData }: SpriteData) => {
  console.log("Here is the spriteData: ");
  console.log(spriteData);
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
  const [scale, setScale] = useState<number>(2);

  useEffect(() => {
    if (mapData) {
      const mapScale = scale * 16;
      const mapMargin = scale * 32;
      const app = new Application({
        view:
          pixiCanvasRef.current === null ? undefined : pixiCanvasRef.current,
        autoDensity: true,
        resolution: window.devicePixelRatio,
        backgroundColor: "#061838",
        width: mapData[0].length * mapScale + mapMargin,
        height: mapData.length * mapScale + mapMargin,
      });
      app.stage.position.set(0, 0);
      app.stage.sortableChildren = true;

      //let render our specific cursor
      //TODO: Cursor stops working on half screen on google chrome (works on firefox).
      app.renderer.events.cursorStyles.default = {
        animation: "gameCursor 1200ms infinite",
      } as CSSStyleDeclaration;

      //the container that holds the map
      const mapContainer = new Container();
      mapContainer.x = 16;
      mapContainer.y = 16;

      //allows for us to use zIndex on the children of mapContainer
      mapContainer.sortableChildren = true;
      app.stage.scale.set(scale, scale);
      app.stage.addChild(mapContainer);

      //Lets create our spritesheets/map the image with the json!
      const spriteSheets: Spritesheet[] = [];
      spriteData.countries.forEach((country: string) => {
        const texture = BaseTexture.from(spriteData[country].meta.image);
        const sheet = new Spritesheet(texture, spriteData[country]);
        sheet.parse();
        spriteSheets.push(sheet);
      });

      //Lets render our map!
      if (mapData != undefined) {
        let tile;
        mapData.forEach((col, colIndex) => {
          mapData[colIndex].forEach((row, rowIndex) => {
            const type = row.type;
            //ITS A PROPERTY
            if (row.hasOwnProperty("playerSlot")) {
              const slot: number = row.playerSlot;

              //NEUTRAL
              if (row.playerSlot === -1) {
                tile = new Sprite(spriteSheets[2].textures[type + "-0.png"]);
                //NOT NEUTRAL
              } else {
                tile = new AnimatedSprite(spriteSheets[slot].animations[type]);
                //if our building is able to produce units, it has a menu!
                if (type !== "hq" && type !== "lab" && type !== "city") {
                  tile.eventMode = "static";
                  //Lets make menu appear
                  tile.on("pointerdown", async () => {
                    const menu = await showMenu(
                      spriteSheets[slot],
                      type,
                      slot,
                      rowIndex,
                      colIndex,
                      mapData.length - 1,
                      mapData[0].length - 1
                    );

                    //if there is a menu already out, lets remove it
                    const menuContainer = mapContainer.getChildByName("menu");
                    if (menuContainer !== null)
                      mapContainer.removeChild(menuContainer);

                    //lets create a transparent screen that covers everything.
                    // if we click on it, we will delete the menu
                    // therefore, achieving a quick way to delete menu if we click out of it
                    const emptyScreen = spriteConstructor(
                      Texture.WHITE,
                      0,
                      0,
                      app.stage.width,
                      app.stage.height,
                      "static",
                      -1
                    );
                    emptyScreen.alpha = 0;

                    emptyScreen.on("pointerdown", (event) => {
                      mapContainer.removeChild(menu);
                      mapContainer.removeChild(emptyScreen);
                    });
                    mapContainer.addChild(menu);
                    mapContainer.addChild(emptyScreen);
                  });
                }

                //TODO: Seems like properties/buildings have different animation speeds...
                // gotta figure out how to make sure all buildings are animated properly
                // or at least AWBW seems to have different speeds/frames than Daemon's replayer
                tile.animationSpeed = 0.04;
                tile.play();
              }

              //NOT A PROPERTY
            } else {
              if (row.hasOwnProperty("variant"))
                tile = new Sprite(
                  spriteSheets[2].textures[
                    row.type + "-" + row.variant + ".png"
                  ]
                );
              else
                tile = new Sprite(spriteSheets[2].textures[row.type + ".png"]);
            }
            //makes our sprites render at the bottom, not from the top.
            tile.anchor.set(1, 1);
            tile.x = (rowIndex + 1) * 16;
            tile.y = (colIndex + 1) * 16;
            mapContainer.addChild(tile);
          });
        });

        //Lets display units!
        const units = showUnits(spriteSheets, mapData, demoUnits);
        mapContainer.addChild(units);
      }
      console.log("Below is the mapData");
      console.log(mapData);
      return () => {
        app.stop();
      };
    }
  }, [pixiCanvasRef, mapData, spriteData, scale]);

  //Actual return statement for react function
  if (!spriteData) return <h1>Loading...</h1>;
  else {
    return (
      <div className="@grid @grid-cols-12  @text-center @my-20">
        <div className="@col-span-12 @p-2">
          <button
            className={"btn @inline"}
            onClick={() => {
              setScale(scale + 0.2);
            }}
          >
            +
          </button>
          <h2 className="@inline @align-middle">
            {" "}
            {Math.round(scale * 10) / 10}{" "}
          </h2>
          <button
            className={"btn"}
            onClick={() => {
              setScale(scale - 0.2);
            }}
          >
            -
          </button>
        </div>

        <div className="@col-span-12">
          <canvas
            className="@inline"
            style={{
              imageRendering: "pixelated",
            }}
            ref={pixiCanvasRef}
          ></canvas>
        </div>
      </div>
    );
  }
};
export default Match;

export async function getServerSideProps() {
  //TODO: Should we call all the spritesheets or just the ones the players will need?
  // Unsure how we would know which players are playing what before even loading the match
  // (which right now we do this call before the tRPC call that gets the match data...)
  const spriteData = await getJSON(["orange-star", "blue-moon"]);
  return { props: { spriteData } };
}
