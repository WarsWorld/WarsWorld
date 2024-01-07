import { usePlayers } from "frontend/context/players";
import { useRouter } from "next/router";
import type { ISpritesheetData, Spritesheet } from "pixi.js";
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
import { mapRender } from "../../interactiveMatchRenders/map-render";

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
  }, [spriteData]);


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


  const [scale, setScale] = useState<number>(2);

  //Global variable that determines the size of tiles
  const tileSize = 16

//Important useEffect to make sure Pixi
  // only gets updated when pixiCanvasRef or mapData changes
  // we dont want it to be refreshed in react everytime something changes.
  useEffect(() => {
    if (!mapData || spriteSheets === undefined) {
      return;
    }

    const mapScale = scale * tileSize;
    const mapMargin = scale * tileSize * 2;
    const mapWidth = mapData[0].length * mapScale + mapMargin
    const mapHeight = mapData.length * mapScale + mapMargin;

    const app = new Application({
      view: pixiCanvasRef.current ?? undefined,
      autoDensity: true,
      resolution: window.devicePixelRatio,
      backgroundColor: "#061838",
      width: mapWidth,
      height: mapHeight
    });
    app.stage.position.set(0, 0);
    app.stage.sortableChildren = true;
    app.stage.scale.set(scale, scale);
    //let render our specific cursor
    //TODO: Cursor stops working on half screen on google chrome (works on firefox).
    app.renderer.events.cursorStyles.default = {
      animation: "gameCursor 1200ms infinite"
    } as CSSStyleDeclaration;


    //the container that holds the map
    const mapContainer = new Container();
    mapContainer.x = tileSize;
    mapContainer.y = tileSize;

    //allows for us to use zIndex on the children of mapContainer
    mapContainer.sortableChildren = true;

    //this creates our map
    app.stage.addChild(mapRender(spriteSheets, mapData, tileSize, mapWidth, mapHeight, mutation));

    return () => {
      app.stop();
    };
  }, [pixiCanvasRef, mapData, spriteSheets, scale, mutation, spriteData]);

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
