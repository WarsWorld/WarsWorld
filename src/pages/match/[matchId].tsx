//TODO: Fix TS type issues, TS is getting angry at very complex types
// Im not going to bother going on rabbit holes to please the TS gods.

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
      //TODO: Make resolution more responsive (become 1 on mobile, 2 on medium, 3 on big)
      // also make resolution changeable? as in the press of a button
      resolution: 2,
      backgroundColor: "#3a4817",
      //TODO: The width needs to be = mapData[0].length * 16 + 16, but it seems it errors out if mapData isnt loaded well.
      // However, mapData?.length seems to work well for the height.
      width: 16 * 50 + 16,
      height: 32 * mapData?.length + 16,
    });
    //8 is half of 16, currently our border half a tile. Needed so mountains and cities display fully at the top.
    app.stage.position.set(0, 8);

    //let render our specific cursor
    //TODO: Unsure why does the cursor.gif isnt working as intended... in the IDE it looks static but on windows photos it animates correctly.
    //TODO: Cursor is pretty big, wish we could make it a bit smaller
    app.renderer.events.cursorStyles.default =
      'url("http://localhost:3000/img/spriteSheet/cursor.gif"),auto';

    const mapContainer = new Container();

    //allows for us to use zIndex
    mapContainer.sortableChildren = true;
    app.stage.addChild(mapContainer);

    const spriteSheets: Spritesheet[] = [];
    console.log(spriteData.countries);

    //Lets create our spritesheets/map the image with the json!
    spriteData.countries.forEach((country: string) => {
      const texture = BaseTexture.from(spriteData[country].meta.image);
      const sheet = new Spritesheet(texture, spriteData[country]);
      sheet.parse();
      spriteSheets.push(sheet);
    });

    if (mapData != undefined || mapData != null) {
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
                    colIndex
                  );
                  //lets make menu dissapear on hover out

                  menu.on("pointerout", () => {
                    const length = mapContainer.children.length;
                    setTimeout(()=> {
                      mapContainer.removeChild(mapContainer.children[length - 1]);
                    },1000)
                  });
                  mapContainer.addChild(menu);
                });
              }


              //TODO: Seems like properties/buildings have different animation speeds...
              // gotta figure out how to make sure all buildings are animated properly
              tile.animationSpeed = 0.03;
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
  }, [pixiCanvasRef, mapData, spriteData]);

  if (!spriteData) return <h1>Loading...</h1>;
  else {
    return (
      <div className={"@m-10"}>
        <h1>Basic pixi.js dev environment </h1>
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
  //TODO: Should we call all the spritesheets or just the ones the players will need? Unsure how we would know which players are playing what before even loading the match (which right now we do this call before the tRPC call that gets the match data...)
  const spriteData = await getJSON(["orange-star", "blue-moon"]);
  return { props: { spriteData } };
}
