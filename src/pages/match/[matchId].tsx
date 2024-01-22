import { usePlayers } from "frontend/context/players";
import { useRouter } from "next/router";
import {
  Application, BaseTexture, SCALE_MODES
} from "pixi.js";
import { useEffect, useRef, useState } from "react";
import type { Tile } from "shared/schemas/tile";
import type { PlayerInMatch } from "shared/types/server-match-state";
import MatchPlayer from "frontend/components/match/MatchPlayer";
import type { LoadedSpriteSheet } from "frontend/pixi/load-spritesheet";
import { loadSpritesheets } from "frontend/pixi/load-spritesheet";
import { trpc } from "frontend/utils/trpc-client";
import getSpriteSheets from "gameFunction/get-sprite-sheets";
import type { SpriteMap } from "gameFunction/get-sprite-sheets";
import type { GetServerSideProps } from "next";
import { MatchWrapper } from "shared/wrappers/match";
import { mapRender } from "../../interactiveMatchRenders/map-render";
import Calculator from "../../frontend/components/calculator/Calculator";
import type { UnitType } from "shared/schemas/unit";

BaseTexture.defaultOptions.scaleMode = SCALE_MODES.NEAREST;

type Props = { spriteData: SpriteMap };


const Match = ({ spriteData }: Props) => {

  //This loads the textures once
  const [spriteSheets, setSpriteSheets] = useState<LoadedSpriteSheet | undefined>(undefined);
  useEffect(() => {
    const fetchData = async () => {
        setSpriteSheets(await loadSpritesheets(spriteData));
    };

    void fetchData();
  }, [setSpriteSheets, spriteData]);

  const { currentPlayer } = usePlayers();

  const [players, setPlayers] = useState<PlayerInMatch[] | null | undefined>(
    null
  );

  const [mapData, setMapData] = useState<Tile[][] | null | undefined>(null);

  const { query } = useRouter();

  const matchId = query.matchId as string;

  const { data, refetch } = trpc.match.full.useQuery(
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

    void refetch().then((result) => {
      if (!result.isSuccess) {
        throw new Error("Loading of match failed: " + result.failureReason?.message);
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


  }, [currentPlayerId, refetch]);

  // const { data } = trpc.match.full.useQuery({ matchId, playerId: currentPlayer?.id ?? "" });

  if (data) {
    if (data.status !== "playing") {
      throw new Error(`This match hasn't started yet. make sure to ready up!`);
    }

    if (!players) {
      setPlayers(data.players);
    }

    if (!mapData) {
      setMapData(data.map.tiles);
    }
  }

  const actionMutation = trpc.action.send.useMutation();

  const [scale, setScale] = useState<number>(2);

  //Global variable that determines the size of tiles
  const tileSize = 16;

  const pixiCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!mapData || !spriteSheets|| !currentPlayer || !players ||!match) {
      return;
    }

    console.log("MAP RENDERED------");
    console.log(spriteSheets);

    const mapScale = scale * tileSize;
    const mapMargin = scale * tileSize;
    const mapWidth = mapData[0].length * mapScale + mapMargin;
    const mapHeight = mapData.length * mapScale + mapMargin;

    const app = new Application({
      view: pixiCanvasRef.current ?? undefined,
      autoDensity: true,
      resolution: window.devicePixelRatio,
      backgroundColor: "#000b2c",
      width: mapWidth,
      height: mapHeight
    });

    app.stage.position.set(0, 0);
    app.stage.sortableChildren = true;
    app.stage.scale.set(scale, scale);

    //let render our game cursor
    //TODO: Cursor stops working on second screen on google chrome (works on firefox).
    app.renderer.events.cursorStyles.default = {
      animation: "gameCursor 1200ms infinite"
    } as CSSStyleDeclaration;

    const actionMutateAsync = (input: {
      unitType: UnitType,
      position: [number, number],
      playerId: string,
      matchId: string
    }) => {
      const type = "build"
      void actionMutation.mutateAsync({type, ...input})
    }

    //lets create a mapContainer
    const mapContainer = mapRender({
      spriteSheets,
      mapData,
      tileSize,
      mapWidth,
      mapHeight,
      mutation: actionMutateAsync,
      currentPlayer,
      players,
      match: match
    });

    app.stage.addChild(mapContainer);

    return () => {
      app.stop();
    };
  }, [mapData, spriteSheets, scale, actionMutation, currentPlayer, players, match]);



  //TODO: This is more or less what we would do to handle events
  // right now it doesnt seem to be working...
  // const eventStuff = trpc.action.onEvent.useSubscription( { matchId: "clrf2h6qv000111deih12dxi0", playerId: "clrbbcyzd000214l310lzd92q" },{
  //   onData(data) {
  //     console.log("eventStuff-----");
  //     console.log(data);
  //   }
  // });
  //console.log(eventStuff);


  if (!mapData || !players) {
    return <></>;
  } else {
    return (<div className="@grid @grid-cols-12 @text-center @my-20 @mx-2">
      <div className="@col-span-12">
        <Calculator/>
      </div>
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
          Funds: {players[0].funds}
          <br />
          HasTurn: {String(players[0].hasCurrentTurn)}

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
          Funds: {players[1].funds}
          <br />
          HasTurn: {String(players[1].hasCurrentTurn)}
        </div>
      </div>);
  }
};
export default Match;

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  //TODO: Should we call all the spritesheets or just the ones the players will need?
  // Unsure how we would know which players are playing what before even loading the match
  // (which right now we do this call before the tRPC call that gets the match data...)
  const spriteData = await getSpriteSheets(["yellow-comet", "green-earth", "black-hole", "orange-star", "blue-moon"]);

  return { props: { spriteData } };
};
