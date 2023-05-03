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
import { MapTile } from "server/tools/map-parser";
import { trpc } from "utils/trpc-client";
import styles from "../../styles/match.module.css";

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

export type Segment = {
  tile: MapTile;
  squareHighlight: JSX.Element | null;
  menu: JSX.Element | null;
};

export const PixiMatch = () => {
  const [players, setPlayers] = useState<PlayerState | null | undefined>(null);
  const [segments, setSegments] = useState<Segment[] | null | undefined>(null);
  const pixiCanvasRef = useRef<HTMLCanvasElement>(null);

  const { query } = useRouter();
  const matchId = query.matchId as string;

  trpc.match.full.useQuery(
    { matchId, playerId },
    {
      onSuccess(data) {
        if (data === null) {
          throw new Error(`Match ${matchId} not found!`);
        }

        if (!players) {
          setPlayers(data.players);
        }

        if (!segments) {
          setSegments(
            data.map.tiles.map((tile) => ({
              tile,
              menu: null,
              squareHighlight: null,
            })),
          );
        }
      },
    },
  );

  useEffect(() => {
    if (pixiCanvasRef.current === null || segments == null) {
      return;
    }

    BaseTexture.defaultOptions.scaleMode = SCALE_MODES.NEAREST;

    const pixiApp = new Application({
      view: pixiCanvasRef.current,
      resolution: 2,
    });

    pixiApp.stage.position.set(200, 0);

    (async () => {
      for (const indexString in segments) {
        const seg = segments[indexString];
        const index = Number.parseInt(indexString, 10);

        const texture = await Assets.load<Texture>(
          `/img/mapTiles/${getSpriteURL(seg.tile.terrainImage)}.webp`,
        );

        const forestSprite = Sprite.from(texture);

        forestSprite.x = (index % 18) * 16;
        forestSprite.y =
          Math.floor(index / 18) * 16 - (forestSprite.height - 16);
        pixiApp.stage.addChild(forestSprite);
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
