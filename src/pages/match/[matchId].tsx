import { usePlayers } from "frontend/context/players";
import { useRouter } from "next/router";
import { ICanvas, ISpritesheetData, Spritesheet, Texture } from "pixi.js";
import {
  Application,
  BaseTexture,
  Container,
  SCALE_MODES,
} from "pixi.js";
import { useEffect, useRef, useState } from "react";
import type { Tile } from "shared/schemas/tile";
import type { PlayerInMatch } from "shared/types/server-match-state";

import MatchPlayer from "frontend/components/match/MatchPlayer";
import { loadSpritesheets } from "frontend/pixi/load-spritesheet";
import { trpc } from "frontend/utils/trpc-client";
import getSpriteSheets from "gameFunction/get-sprite-sheets";
import type { GetServerSideProps } from "next";
import { MatchWrapper } from "shared/wrappers/match";
import { mapRender } from "../../interactiveMatchRenders/map-render";
import { spriteConstructor } from "../../interactiveMatchRenders/sprite-constructor";

BaseTexture.defaultOptions.scaleMode = SCALE_MODES.NEAREST;

type Props = { spriteData: ISpritesheetData[] };

const Match = ({ spriteData }: Props) => {

  //This loads the textures once
  const [spriteSheets, setSpriteSheets] = useState<Spritesheet[] | undefined>(undefined);
  useEffect(() => {
    const fetchData = async () => {
        setSpriteSheets(await loadSpritesheets(spriteData));
    };
     fetchData();
  }, []);


  const actionMutation = trpc.action.send.useMutation();

  const { currentPlayer } = usePlayers();

  const [players, setPlayers] = useState<PlayerInMatch[] | null | undefined>(
    null
  );

  const [mapData, setMapData] = useState<Tile[][] | null | undefined>(null);



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

  const {data} = trpc.match.full.useQuery({ matchId, playerId: currentPlayer?.id ?? "" })

  if (data) {
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

  const [scale, setScale] = useState<number>(2);

  //Global variable that determines the size of tiles
  const tileSize = 16


  //This references are here so we can just say "mapContainer.current" somewhere else
  // and modify our mapContainer or something else without using useState
  const pixiCanvasRef = useRef<HTMLCanvasElement>(null);
  const pixiApp = useRef<Application | null>(null);
  const mapContainer = useRef<Container | null>(null);

  useEffect(() => {
    if (!mapData || spriteSheets === undefined) {
      return;
    }

    const mapScale = scale * tileSize;
    const mapMargin = scale * tileSize * 2;
    const mapWidth = mapData[0].length * mapScale + mapMargin;
    const mapHeight = mapData.length * mapScale + mapMargin;

    pixiApp.current = new Application({
      view: pixiCanvasRef.current ?? undefined,
      autoDensity: true,
      resolution: window.devicePixelRatio,
      backgroundColor: "#061838",
      width: mapWidth,
      height: mapHeight
    });

    pixiApp.current.stage.position.set(0, 0);
    pixiApp.current.stage.sortableChildren = true;
    pixiApp.current.stage.scale.set(scale, scale);

    //let render our game cursor
    //TODO: Cursor stops working on second screen on google chrome (works on firefox).
    pixiApp.current.renderer.events.cursorStyles.default = {
      animation: "gameCursor 1200ms infinite"
    } as CSSStyleDeclaration;

    //lets create a mapContainer
    mapContainer.current = mapRender(spriteSheets, mapData, tileSize, mapWidth, mapHeight, actionMutation);

    pixiApp.current.stage.addChild(mapContainer.current);

    //this is just a test for now...
    const whiteChild = spriteConstructor(
      Texture.WHITE,
      32,
      0,
      16,
      16,
      "static"
    );
    mapContainer.current.removeChildAt(2);
    mapContainer.current.addChildAt(whiteChild, 2)

    return () => {
      pixiApp.current.stop();
    };
  }, [mapData, spriteSheets, scale, actionMutation]);


    if (mapContainer.current) {
      console.log("mapContainer ref");
      console.log(mapContainer.current);
    }

   if (!mapData || !players) {
     return <></>
   } else {
     return (
       <div className="@grid @grid-cols-12 @text-center @my-20 @mx-2">
         <h3 className="@col-span-12">Scale</h3>
         <div className="@col-span-12 @p-2">
           <button className={"btn @inline"} onClick={() => {
             setScale(scale + 0.2);
           }}>+
           </button>
           <h2 className="@inline @align-middle">
             {" "}
             {Math.round(scale * 10) / 10}{" "}
           </h2>
           <button className={"btn"} onClick={() => {
             setScale(scale - 0.2);
           }}>-
           </button>
         </div>
         <div className="@mx-4 @w-48 @col-span-2 [image-rendering:pixelated]">
             <MatchPlayer
               name={players[0].name}
               co={players[0].coId}
               country={players[0].army}
               playerReady={true}
             />

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
             <MatchPlayer
               name={players[1].name}
               co={players[1].coId}
               country={players[1].army}
               playerReady={true}
               flipCO={true}
             />
         </div>
       </div>
     );
   }
};
export default Match;

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  //TODO: Should we call all the spritesheets or just the ones the players will need?
  // Unsure how we would know which players are playing what before even loading the match
  // (which right now we do this call before the tRPC call that gets the match data...)
  const spriteData = await getSpriteSheets(["orange-star", "blue-moon"]);
  return { props: { spriteData } };
};
