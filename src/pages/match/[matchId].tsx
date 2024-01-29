import MatchPlayer from "frontend/components/match/MatchPlayer";
import { usePlayers } from "frontend/context/players";
import type { SpritesheetDataByArmy } from "frontend/pixi/getSpritesheetData";
import getSpriteSheets from "frontend/pixi/getSpritesheetData";
import { loadSpritesFromSpriteMap, type LoadedSpriteSheet } from "frontend/pixi/load-spritesheet";
import { trpc } from "frontend/utils/trpc-client";
import type { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { Application, BaseTexture, SCALE_MODES } from "pixi.js";
import { useEffect, useRef, useState } from "react";
import type { Tile } from "shared/schemas/tile";
import type { UnitType } from "shared/schemas/unit";
import type { PlayerInMatch } from "shared/types/server-match-state";
import { MatchWrapper } from "shared/wrappers/match";
import { UnitWrapper } from "shared/wrappers/unit";
import Calculator from "../../frontend/components/calculator/Calculator";
import { mapRender } from "../../interactiveMatchRenders/map-render";

BaseTexture.defaultOptions.scaleMode = SCALE_MODES.NEAREST;

type Props = { spriteData: SpritesheetDataByArmy };

const Match = ({ spriteData }: Props) => {
  // ---- TEXTURE LOADING ----
  const [spriteSheets, setSpriteSheets] = useState<LoadedSpriteSheet | undefined>(undefined);
  useEffect(() => {
    const fetchData = async () => {
      setSpriteSheets(await loadSpritesFromSpriteMap(spriteData));
    };

    void fetchData();
  }, [setSpriteSheets, spriteData]);

  // ---- DATA SETUP ----
  // We wait for usePlayers() to return the currentPlayer
  // Once we have currentPlayer, the useEffect below will run
  // and fill in the necessary data for the match.
  const { query } = useRouter();
  const { currentPlayer } = usePlayers();
  const matchId = query.matchId as string;
  const currentPlayerId = currentPlayer?.id;
  const { refetch } = trpc.match.full.useQuery(
    { matchId, playerId: currentPlayerId ?? "" },
    {
      enabled: false, // no autoload
    },
  );

  // depends on trpc.match.full.useQuery
  const [players, setPlayers] = useState<PlayerInMatch[] | null | undefined>(null);
  const [mapData, setMapData] = useState<Tile[][] | null | undefined>(null);
  const [match, setMatch] = useState<MatchWrapper | null>(null);

  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (currentPlayerId === undefined) {
      return;
    }

    // enable receiving events
    setIsSubscribed((prev) => !prev);

    void refetch().then((result) => {
      if (!result.isSuccess) {
        throw new Error("Loading of match failed: " + result.failureReason?.message);
      }

      if (result.data.status !== "playing") {
        throw new Error(`This match hasn't started yet. make sure to ready up!`);
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
          UnitWrapper,
          rawMatch.turn,
        ),
      );
      setPlayers(result.data.players);
      setMapData(result.data.map.tiles);
    });
  }, [currentPlayerId, refetch]);

  // For listening to events
  // Encompasses game events and chat messages
  trpc.action.onEvent.useSubscription(
    {
      matchId: matchId,
      playerId: currentPlayerId!,
    },
    {
      onData(data) {
        console.log("eventStuff-----");
        console.log(data);
      },
      enabled: isSubscribed,
    },
  );

  // To be removed, kept here in case we need it again
  // const { data } = trpc.match.full.useQuery({ matchId, playerId: currentPlayer?.id ?? "" });

  // ---- PIXI STUFF ----
  const actionMutation = trpc.action.send.useMutation();

  //Global variable that determines the size of tiles
  const [scale, setScale] = useState<number>(2);
  const tileSize = 16;
  const pixiCanvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!mapData || !spriteSheets || !currentPlayer || !players || !match) {
      return;
    }

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
      height: mapHeight,
    });

    app.stage.position.set(0, 0);
    app.stage.sortableChildren = true;
    app.stage.scale.set(scale, scale);

    //let render our game cursor
    //TODO: Cursor stops working on second screen on google chrome (works on firefox).
    app.renderer.events.cursorStyles.default = {
      animation: "gameCursor 1200ms infinite",
    } as CSSStyleDeclaration;

    // for type safety
    const actionMutateAsync = (input: {
      unitType: UnitType;
      position: [number, number];
      playerId: string;
      matchId: string;
    }) => {
      const type = "build";
      void actionMutation.mutateAsync({ type, ...input });
    };

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
      match: match,
    });

    app.stage.addChild(mapContainer);

    return () => {
      app.stop();
    };
  }, [mapData, spriteSheets, scale, actionMutation, currentPlayer, players, match]);

  if (!mapData || !players) {
    return <></>;
  } else {
    return (
      <div className="@grid @grid-cols-12 @text-center @my-20 @mx-2">
        <div className="@col-span-12">
          <Calculator player={players[0]} />
        </div>
        <h3 className="@col-span-12">Scale</h3>
        <div className="@col-span-12 @p-2">
          <button
            className={"btn @inline"}
            onClick={() => {
              setScale(scale + 0.2);
            }}
          >
            +
          </button>
          <h2 className="@inline @align-middle"> {Math.round(scale * 10) / 10} </h2>
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
              imageRendering: "pixelated",
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
      </div>
    );
  }
};
export default Match;

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  //TODO: Should we call all the spritesheets or just the ones the players will need?
  // Unsure how we would know which players are playing what before even loading the match
  // (which right now we do this call before the tRPC call that gets the match data...)
  const spriteData = await getSpriteSheets([
    "yellow-comet",
    "green-earth",
    "black-hole",
    "orange-star",
    "blue-moon",
  ]);

  return { props: { spriteData } };
};
