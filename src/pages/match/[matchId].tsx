import { usePlayers } from "frontend/context/players";
import { useRouter } from "next/router";
import type { ISpritesheetData } from "pixi.js";
import {
  AnimatedSprite,
  Application,
  BaseTexture,
  Container,
  SCALE_MODES,
  Sprite,
  Texture
} from "pixi.js";
import { useEffect, useRef, useState } from "react";
import type { Tile } from "shared/schemas/tile";
import type { PlayerInMatch } from "shared/types/server-match-state";

import MatchPlayer from "frontend/components/match/MatchPlayer";
import { loadSpritesheets } from "frontend/pixi/load-spritesheet";
import { trpc } from "frontend/utils/trpc-client";
import { demoUnits } from "gameFunction/demoUnitList";
import getSpriteSheets from "gameFunction/get-sprite-sheets";
import showMenu from "gameFunction/showMenu";
import { showUnits } from "gameFunction/showUnit";
import { spriteConstructor } from "gameFunction/spriteConstructor";
import type { GetServerSideProps } from "next";
import { MatchWrapper } from "shared/wrappers/match";

BaseTexture.defaultOptions.scaleMode = SCALE_MODES.NEAREST;

type Props = { spriteData: ISpritesheetData[] };

const Match = ({ spriteData }: Props) => {
  console.log("spriteData", spriteData);
  const mutation = trpc.action.send.useMutation();
  const { currentPlayer } = usePlayers();
  const [players, setPlayers] = useState<PlayerInMatch[] | null | undefined>(
    null
  );
  const [mapData, setMapData] = useState<Tile[][] | null | undefined>(null);
  const pixiCanvasRef = useRef<HTMLCanvasElement>(null);

  const { query } = useRouter();
  const matchId = query.matchId as string;

  const matchQuery = trpc.match.full.useQuery(
    { matchId, playerId: currentPlayer?.id ?? "" },
    {
      enabled: false // no autoload
    }
  );

  // put into a variable for proper type-gating
  const currentPlayerId = currentPlayer?.id;

  const [match, setMatch] = useState<MatchWrapper | null>(null);

  useEffect(() => {
    if (currentPlayerId === undefined) {
      return;
    }

    void matchQuery.refetch().then((result) => {
      if (!result.isSuccess) {
        throw new Error(
          "Loading of match failed: " + result.failureReason?.message
        );
      }

      const rawMatch = result.data;

      setMatch(
        new MatchWrapper(
          rawMatch.id,
          rawMatch.leagueType,
          rawMatch.changeableTiles,
          rawMatch.rules,
          rawMatch.status,
          rawMatch.map,
          rawMatch.players,
          rawMatch.units,
          rawMatch.turn
        )
      );
    });
  }, [currentPlayerId]);

  trpc.match.full.useQuery(
    { matchId, playerId: currentPlayer?.id ?? "" },
    {
      enabled: currentPlayer !== undefined,
      onSuccess(data) {
        if (data === null) {
          throw new Error(`Match ${matchId} not found!`);
        }

        if (data.status !== "playing") {
          throw new Error(
            `This match hasn't started yet. make sure to ready up!`
          );
        }

        if (!players) {
          setPlayers(data.players);
        }

        if (!mapData) {
          setMapData(data.map.tiles);
        }
      }
    }
  );

  //Important useEffect to make sure Pixi
  // only gets updated when pixiCanvasRef or mapData changes
  // we dont want it to be refreshed in react everytime something changes.
  const [scale, setScale] = useState<number>(2);

  useEffect(() => {
    if (!mapData) {
      return;
    }

    const mapScale = scale * 16;
    const mapMargin = scale * 32;
    const app = new Application({
      view: pixiCanvasRef.current ?? undefined,
      autoDensity: true,
      resolution: window.devicePixelRatio,
      backgroundColor: "#061838",
      width: mapData[0].length * mapScale + mapMargin,
      height: mapData.length * mapScale + mapMargin
    });
    app.stage.position.set(0, 0);
    app.stage.sortableChildren = true;

    //let render our specific cursor
    //TODO: Cursor stops working on half screen on google chrome (works on firefox).
    app.renderer.events.cursorStyles.default = {
      animation: "gameCursor 1200ms infinite"
    } as CSSStyleDeclaration;

    //the container that holds the map
    const mapContainer = new Container();
    mapContainer.x = 16;
    mapContainer.y = 16;

    //allows for us to use zIndex on the children of mapContainer
    mapContainer.sortableChildren = true;
    app.stage.scale.set(scale, scale);
    app.stage.addChild(mapContainer);

    void loadSpritesheets(spriteData).then((spriteSheets) => {
      //Lets render our map!
      let tile;

      for (let rowIndex = 0; rowIndex < mapData.length; rowIndex++) {
        const trueRow = mapData[rowIndex];

        for (let colIndex = 0; colIndex < trueRow.length; colIndex++) {
          const tileSource = trueRow[colIndex];
          const { type } = tileSource;

          //ITS A PROPERTY
          if ("playerSlot" in tileSource) {
            const slot = tileSource.playerSlot;

            //NEUTRAL
            if (slot === -1) {
              tile = new Sprite(spriteSheets[2].textures[type + "-0.png"]);
              //NOT NEUTRAL
            } else {
              console.log("type", type, spriteSheets[slot]);
              tile = new AnimatedSprite(spriteSheets[slot].animations[type]);

              //if our building is able to produce units, it has a menu!
              if (type !== "hq" && type !== "lab" && type !== "city") {
                tile.eventMode = "static";
                //Lets make menu appear
                tile.on("pointerdown", () => {
                  void (async () => {
                    const menu = await showMenu(
                      spriteSheets[slot],
                      type,
                      slot,
                      rowIndex,
                      colIndex,
                      mapData.length - 1,
                      mapData[0].length - 1,
                      (input) => {
                        void mutation.mutateAsync(input);
                      }
                    );

                    //if there is a menu already out, lets remove it
                    const menuContainer = mapContainer.getChildByName("menu");

                    if (menuContainer !== null) {
                      mapContainer.removeChild(menuContainer);
                    }

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

                    emptyScreen.on("pointerdown", () => {
                      mapContainer.removeChild(menu);
                      mapContainer.removeChild(emptyScreen);
                    });

                    mapContainer.addChild(menu);
                    mapContainer.addChild(emptyScreen);
                  })();
                });
              }

              //TODO: Seems like properties/buildings have different animation speeds...
              // gotta figure out how to make sure all buildings are animated properly
              // or at least AWBW seems to have different speeds/frames than Daemon's replayer
              tile.animationSpeed = 0.04;
              tile.play();
            }

            //NOT A PROPERTY
          } else if ("variant" in tileSource) {
            tile = new Sprite(
              spriteSheets[2].textures[
                tileSource.type + "-" + tileSource.variant + ".png"
              ]
            );
          } else {
            tile = new Sprite(
              spriteSheets[2].textures[tileSource.type + ".png"]
            );
          }

          //makes our sprites render at the bottom, not from the top.
          tile.anchor.set(1, 1);
          tile.x = (rowIndex + 1) * 16;
          tile.y = (colIndex + 1) * 16;
          mapContainer.addChild(tile);
        }
      }

      //Lets display units!
      const units = showUnits(spriteSheets, mapData, demoUnits);
      mapContainer.addChild(units);
    });

    return () => {
      app.stop();
    };
  }, [pixiCanvasRef, mapData, spriteData, scale]);

  return (
    <div className="@grid @grid-cols-12 @text-center @my-20 @mx-2">
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
      <div className="@mx-4 @w-48 @col-span-2 [image-rendering:pixelated]">
        {players ? (
          <MatchPlayer
            name={players[0].name}
            co={players[0].coId.name}
            country={players[0].army}
            playerReady={true}
          />
        ) : (
          "loading"
        )}
      </div>
      <div className="@col-span-8">
        <canvas
          className="@inline"
          style={{
            imageRendering: "pixelated"
          }}
          ref={pixiCanvasRef}
        ></canvas>
      </div>
      <div className="@mx-4 @w-48 @col-span-2 [image-rendering:pixelated]">
        {players ? (
          <MatchPlayer
            name={players[1].name}
            co={players[1].coId.name}
            country={players[1].army}
            playerReady={true}
            flipCO={true}
          />
        ) : (
          "loading"
        )}
      </div>
    </div>
  );
};
export default Match;

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  //TODO: Should we call all the spritesheets or just the ones the players will need?
  // Unsure how we would know which players are playing what before even loading the match
  // (which right now we do this call before the tRPC call that gets the match data...)
  const spriteData = await getSpriteSheets(["orange-star", "blue-moon"]);
  return { props: { spriteData } };
};
