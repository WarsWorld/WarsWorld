//TODO: Fix TS type issues, TS is getting angry at very complex types
// Im not going to bother going on rabbit holes to please the TS gods
// and their confusing requests

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
import getJSON from "../../spriteSheet/getJSON";
import showMenu from "../../spriteSheet/showMenu";

BaseTexture.defaultOptions.scaleMode = SCALE_MODES.NEAREST;

const Match = ({ spriteData }) => {
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
      view: pixiCanvasRef.current,
      autoDensity: true,
      resolution: window.devicePixelRatio,
      backgroundColor: "#061838",
      //TODO: I'd like our app to be the size of the map, not bigger or smaller.
      // The width needs to be = mapData[0].length * 16 + 16, but it seems it errors out if mapData isnt loaded well.
      // However, mapData?.length seems to work well for the height.
      width: window.outerWidth * 0.975,
      height: window.outerHeight * 0.975,
      resizeTo: undefined,
    });

    //TODO: Button with + and - to change the scale of our stage, also needs
    // to have app.resize() working so we can resize the size of our app.
    app.stage.scale.set(2.6, 2.6);
    app.stage.position.set(0, 30);

    //let render our specific cursor
    //TODO: Cursor stops working on half screen?
    app.renderer.events.cursorStyles.default = {
      animation: "gameCursor 1200ms infinite",
    };
    //the container that holds everything
    const mapContainer = new Container();
    mapContainer.x = 8;
    mapContainer.y = 16;
    //allows for us to use zIndex on the children of mapContainer
    mapContainer.sortableChildren = true;
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
                  );

                  //if there is a menu already out, lets rempove it
                  mapContainer.removeChild(mapContainer.getChildByName("menu"));

                  //lets create a transparent screen that covers everything.
                  // if we click on it, we will delete the menu
                  // therefore, achieving a quick way to delete menu if we click out of it
                  const emptyScreen = new Sprite(Texture.WHITE);
                  emptyScreen.x = 0;
                  emptyScreen.y = 0;
                  emptyScreen.alpha = 0;
                  emptyScreen.width = app.stage.width;
                  emptyScreen.height = app.stage.height;
                  emptyScreen.zIndex = -1;
                  emptyScreen.eventMode = "static";
                  emptyScreen.on("click", (event) => {
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
                spriteSheets[2].textures[row.type + "-" + row.variant + ".png"]
              );
            else tile = new Sprite(spriteSheets[2].textures[row.type + ".png"]);
          }
          //makes our sprites render at the bottom, not from the top.
          tile.anchor.set(0.5, 1);
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
  }, [pixiCanvasRef, mapData, spriteData]);

  //Actual return statement for react function
  if (!spriteData) return <h1>Loading...</h1>;
  else {
    return (
      <div>
        <canvas
          style={{
            imageRendering: "pixelated",
          }}
          ref={pixiCanvasRef}
        ></canvas>
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
