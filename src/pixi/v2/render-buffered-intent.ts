import { baseTileSize, mapBorder } from "components/client-only/MatchRenderer";
import type { IntentArrow } from "frontend/components/match/buffered-intent";
import type { QueuedAction } from "frontend/utils/action-queue";
import { Container, Graphics } from "pixi.js";

/**
 * Draws a movement arrow per buffered action onto its own layer (offset like the map so tile
 * coordinates line up). Colour signals the kind of intent — cyan move, green capture, red attack,
 * etc. Purely presentational: it renders the geometry `buffered-intent` derives, nothing else.
 */

const ARROW_COLOR: Record<QueuedAction["kind"], number> = {
  move: 0x43d9e4,
  capture: 0x3fb950,
  attack: 0xbe1919,
  ability: 0xd9a441,
  launch: 0xbe1919,
  repair: 0x3fb950,
  production: 0x43d9e4,
  coPower: 0xffffff,
  delete: 0x888888,
};

// Centre of a tile within a container that carries the map's mapBorder offset.
const center = (n: number): number => n * baseTileSize + baseTileSize / 2;

const drawArrowhead = (
  graphics: Graphics,
  from: readonly [number, number],
  to: readonly [number, number],
  color: number,
): void => {
  const toX = center(to[0]);
  const toY = center(to[1]);
  const angle = Math.atan2(center(to[1]) - center(from[1]), center(to[0]) - center(from[0]));
  const size = baseTileSize / 3;

  graphics.lineStyle(2, color, 0.9);

  for (const spread of [-Math.PI / 6, Math.PI / 6]) {
    graphics.moveTo(toX, toY);
    graphics.lineTo(toX - size * Math.cos(angle - spread), toY - size * Math.sin(angle - spread));
  }
};

export const renderBufferedIntent = (arrows: IntentArrow[]): Container => {
  const container = new Container();
  container.x = mapBorder;
  container.y = mapBorder;
  container.zIndex = 1500; // above units, below the menu layer

  for (const { path, kind } of arrows) {
    const color = ARROW_COLOR[kind] ?? 0x43d9e4;
    const graphics = new Graphics();

    graphics.lineStyle(2, color, 0.9);
    graphics.moveTo(center(path[0][0]), center(path[0][1]));

    for (let i = 1; i < path.length; i++) {
      graphics.lineTo(center(path[i][0]), center(path[i][1]));
    }

    drawArrowhead(graphics, path[path.length - 2], path[path.length - 1], color);
    container.addChild(graphics);
  }

  return container;
};
