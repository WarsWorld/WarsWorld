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
} from "pixijs";
import { useEffect, useRef, useState } from "react";
import { PlayerInMatch } from "shared/types/server-match-state";
import styles from "../styles/match.module.css";
import { trpc } from "frontend/utils/trpc-client";

BaseTexture.defaultOptions.scaleMode = SCALE_MODES.NEAREST;

const spriteURLMap: Record<string, string> = {
  pi: "pipes",
  ri: "river",
  br: "roads",
  ro: "roads",
  se: "sea",
  sh: "shoal",
  si: "silo",
};

const numberMapping: Record<string, string> = {
  0: "hq",
  1: "city",
  2: "base",
  3: "airport",
  4: "port",
  5: "comtower",
};

const getSpriteURL = (terrainImage: string) => {
  const tileCode = terrainImage.slice(0, 2);

  if (["os", "bm", "ne"].includes(tileCode)) {
    return `countries/${numberMapping[terrainImage.slice(2)]}/${terrainImage}`;
  }

  const spriteFolder = spriteURLMap[tileCode];

  if (spriteFolder === undefined) {
    return terrainImage;
  }

  return `${spriteFolder}/${terrainImage}`;
};

export const PixiMatch = () => {
  const { currentPlayer } = usePlayers();
  const [players, setPlayers] = useState<PlayerInMatch[] | null | undefined>(
    null
  );
  const [segments] = useState<Tile[][] | null | undefined>(null);
  const pixiCanvasRef = useRef<HTMLCanvasElement>(null);

  const { query } = useRouter();
  const matchId = query.matchId as string;

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

        if (!segments) {
          // setSegments(data.map.tiles);
        }
      },
    }
  );

  useEffect(() => {
    if (pixiCanvasRef.current === null || segments == null) {
      return;
    }

    const pixiApp = new Application({
      view: pixiCanvasRef.current,
      resolution: 2,
    });

    pixiApp.stage.position.set(200, 0);

    (async () => {
      for (const indexStringY in segments) {
        for (const indexStringX in segments) {
          const seg = segments[indexStringY][indexStringX];
          const indexX = Number.parseInt(indexStringX, 10);
          const indexY = Number.parseInt(indexStringY, 10);

          const texture = await Assets.load<Texture>(
            `/img/mapTiles/${getSpriteURL(seg.type)}.webp`
          );

          const forestSprite = Sprite.from(texture);

          forestSprite.x = indexX * 16;
          forestSprite.y = indexY * 16 - (forestSprite.height - 16);
          pixiApp.stage.addChild(forestSprite);
        }
      }
    })();

    return () => {
      pixiApp.stop();
    };
  }, [pixiCanvasRef, segments]);

  return (
    <div className={styles.match + " gameBox"}>
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
