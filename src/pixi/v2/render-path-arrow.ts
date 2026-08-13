import { baseTileSize } from "frontend/components/match/render-constants";
import type { IntentArrow } from "frontend/components/match/buffered-intent";
import type { BoardPosition } from "frontend/components/match/match-view";
import { Container, Sprite } from "pixi.js";
import type { LoadedSpriteSheet } from "../load-spritesheet";

/**
 * Renders the AW movement arrow for a traced path using the `arrow` spritesheet — each node gets the
 * sprite for its shape (straight run, corner, or head) from its neighbours. Ported from the v1 board's
 * `show-pathing`, but fed a plain position path (no engine). Shared by the live planning arrow (full
 * opacity) and the buffered-intent arrows (phantom opacity + an animated shimmer).
 */

/** Buffered arrows render dimmed, matching the phantom units, since they're unconfirmed intent. */
export const BUFFERED_ARROW_ALPHA = 0.45;

// path a -> b -> c; returns the arrow sprite name for the middle node b. (Ported verbatim from v1.)
const getSpriteName = (a: BoardPosition, b: BoardPosition, c: BoardPosition): string => {
  const difx = Math.abs(a[0] - c[0]);
  const dify = Math.abs(a[1] - c[1]);

  if (dify + difx === 2) {
    // straight or corner (neither start nor end)
    if (difx === 2) {
      return "ew";
    }

    if (dify === 2) {
      return "ns";
    }

    let ans = a[1] > b[1] || c[1] > b[1] ? "s" : "n";
    ans += a[0] > b[0] || c[0] > b[0] ? "e" : "w";

    return ans;
  }

  if (a[0] === b[0] && a[1] === b[1]) {
    // starting node
    if (c[0] === b[0] && c[1] === b[1]) {
      return "od";
    }

    if (c[0] < b[0]) {
      return "ow";
    }

    if (c[0] > b[0]) {
      return "oe";
    }

    return c[1] > b[1] ? "os" : "on";
  }

  // ending node (arrowhead)
  if (a[0] < b[0]) {
    return "wd";
  }

  if (a[0] > b[0]) {
    return "ed";
  }

  return a[1] < b[1] ? "nd" : "sd";
};

/** The positioned arrow-segment sprites for a path (empty for a single-tile, non-travelling path). */
const arrowSegmentSprites = (
  spriteSheets: LoadedSpriteSheet,
  path: readonly BoardPosition[],
  alpha: number,
): Sprite[] => {
  if (path.length < 2) {
    return [];
  }

  const padded = [...path, path[path.length - 1]]; // duplicate the last node to detect the head
  const sprites: Sprite[] = [];

  for (let i = 1; i < path.length; i++) {
    const spriteName = getSpriteName(padded[i - 1], padded[i], padded[i + 1]);
    const sprite = new Sprite(spriteSheets.arrow?.textures[`${spriteName}.png`]);
    sprite.anchor.set(1, 1);
    sprite.x = (path[i][0] + 1) * baseTileSize;
    sprite.y = (path[i][1] + 1) * baseTileSize;
    sprite.alpha = alpha;
    sprites.push(sprite);
  }

  return sprites;
};

/** The live planning arrow: full-opacity AW arrow for the route the cursor is currently tracing. */
export const renderPathArrow = (
  spriteSheets: LoadedSpriteSheet,
  path: readonly BoardPosition[],
): Container => {
  const container = new Container();
  container.name = "v2-path-arrow";
  container.zIndex = 1100; // above map tiles / fog / highlights, below the units container
  container.eventMode = "none"; // never eat a tile click

  for (const sprite of arrowSegmentSprites(spriteSheets, path, 1)) {
    container.addChild(sprite);
  }

  return container;
};

/**
 * Buffered (committed but unconfirmed) move arrows: the same AW arrows at phantom opacity. Returns
 * the container AND the per-arrow sprite groups so the caller can run a travelling-light shimmer
 * along each one (see `shimmerBufferedArrows`).
 */
export const renderBufferedArrows = (
  spriteSheets: LoadedSpriteSheet,
  arrows: IntentArrow[],
): { container: Container; groups: Sprite[][] } => {
  const container = new Container();
  container.name = "v2-buffered-arrows";
  container.zIndex = 1050; // above the map, below the live planning arrow (1100) and units
  container.eventMode = "none";

  const groups: Sprite[][] = [];

  for (const { path } of arrows) {
    const sprites = arrowSegmentSprites(spriteSheets, path, BUFFERED_ARROW_ALPHA);

    for (const sprite of sprites) {
      container.addChild(sprite);
    }

    if (sprites.length > 0) {
      groups.push(sprites);
    }
  }

  return { container, groups };
};

/** How many segments the shimmer's bright tail spans. */
const SHIMMER_TAIL = 2.5;

/**
 * Advance the travelling-light shimmer by `time` (accumulated ticker delta). A bright band runs head
 * -> tail along each arrow and cycles, boosting each segment's alpha from the phantom base up toward
 * full as the band passes over it. Pure function of `time`, so it's safe to call every frame.
 */
export const shimmerBufferedArrows = (groups: Sprite[][], time: number): void => {
  for (const segments of groups) {
    const period = segments.length + SHIMMER_TAIL;
    const head = time % period;

    segments.forEach((sprite, index) => {
      const behind = (((head - index) % period) + period) % period;
      const glow = behind < SHIMMER_TAIL ? 1 - behind / SHIMMER_TAIL : 0;
      sprite.alpha = BUFFERED_ARROW_ALPHA + glow * (1 - BUFFERED_ARROW_ALPHA);
    });
  }
};
