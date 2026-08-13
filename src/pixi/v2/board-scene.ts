import { mapBorder, renderedTileSize } from "frontend/components/match/render-constants";
import { intentArrows, phantomPositions } from "frontend/components/match/buffered-intent";
import type { BoardPosition, MatchView } from "frontend/components/match/match-view";
import type { TurnSnapshot, UnloadDrop } from "frontend/components/match/turn-snapshot-view";
import {
  optimisticActions,
  type ActionQueueEvent,
  type ActionQueueState,
} from "frontend/utils/action-queue";
import type { LoadedSpriteSheet } from "pixi/load-spritesheet";
import type { Application } from "pixi.js";
import { Container } from "pixi.js";
import type { Dispatch, MutableRefObject } from "react";
import { createBoardController } from "./board-controller";
import {
  renderHighlightTiles,
  renderInteractiveTilesFromView,
  renderMapFromView,
  renderUnitsFromView,
} from "./render-from-view";
import { renderBufferedArrows, renderPathArrow, shimmerBufferedArrows } from "./render-path-arrow";

const REACHABLE_COLOR = "#43d9e4";
const ATTACK_COLOR = "#be1919";
const UNLOAD_COLOR = "#3fb950";

/** Every ref the scene reads/writes, owned by `MatchBoardV2` and passed in so state survives re-renders. */
export type BoardSceneRefs = {
  reachableHighlightRef: MutableRefObject<Container | null>;
  attackHighlightRef: MutableRefObject<Container | null>;
  unloadHighlightRef: MutableRefObject<Container | null>;
  pathArrowRef: MutableRefObject<Container | null>;
  plannedPathRef: MutableRefObject<BoardPosition[]>;
  shimmerRef: MutableRefObject<((delta: number) => void) | null>;
  selectionRef: MutableRefObject<BoardPosition | null>;
  stagedDestRef: MutableRefObject<BoardPosition | null>;
  attackTargetsRef: MutableRefObject<BoardPosition[]>;
  unloadDropsRef: MutableRefObject<UnloadDrop[]>;
  missileArmRef: MutableRefObject<{ path: readonly BoardPosition[] } | null>;
  resetInteractionRef: MutableRefObject<() => void>;
  matchRef: MutableRefObject<MatchView | null>;
  snapshotRef: MutableRefObject<TurnSnapshot | null>;
  priceTableRef: MutableRefObject<TurnSnapshot["production"]["priceTable"]>;
  queueRef: MutableRefObject<ActionQueueState>;
};

/** The drawing surface `board-controller` uses to reflect interaction state onto the board. */
export type BoardRenderer = {
  drawHighlights: (
    reachable: readonly BoardPosition[],
    attack: readonly BoardPosition[],
    unload?: readonly BoardPosition[],
  ) => void;
  drawPathArrow: () => void;
  showMenu: (menu: Container) => void;
  closeMenu: () => void;
};

export type MountBoardSceneParams = {
  app: Application;
  view: MatchView;
  spriteSheets: LoadedSpriteSheet;
  playerId: string;
  queue: ActionQueueState;
  dispatchQueue: Dispatch<ActionQueueEvent>;
  refs: BoardSceneRefs;
};

/**
 * (Re)builds the pixi stage content for the v2 snapshot board — the imperative render layer
 * extracted from `MatchBoardV2`'s render effect. Pure "data in, events out": takes the current
 * view/snapshot/queue and the refs the component owns, builds a `BoardRenderer` and hands it to
 * `board-controller` for the click/hover handlers and menus, then appends everything to
 * `app.stage`. See `MatchBoardV2` for the effect that calls this.
 */
export function mountBoardScene(params: MountBoardSceneParams): void {
  const { app, view, spriteSheets, playerId, queue, dispatchQueue, refs } = params;
  const {
    reachableHighlightRef,
    attackHighlightRef,
    unloadHighlightRef,
    pathArrowRef,
    plannedPathRef,
    shimmerRef,
    selectionRef,
    stagedDestRef,
    attackTargetsRef,
    unloadDropsRef,
    missileArmRef,
    resetInteractionRef,
  } = refs;

  app.renderer.resize(
    view.map.tiles[0].length * renderedTileSize + renderedTileSize,
    view.map.tiles.length * renderedTileSize + renderedTileSize,
  );

  // Drop the previous shimmer animation before rebuilding the stage (its sprites are about to be
  // destroyed); a fresh one is registered below for this render's buffered arrows.
  if (shimmerRef.current !== null) {
    app.ticker.remove(shimmerRef.current);
    shimmerRef.current = null;
  }

  for (const child of app.stage.removeChildren()) {
    child.destroy({ children: true });
  }

  const mapSize = {
    width: view.map.tiles[0].length,
    height: view.map.tiles.length,
  };

  // The map renderer draws the fog per-tile (interleaved by depth) so a visible property's tall top
  // isn't dimmed by fog on the tile above it. Vision is BE-authoritative (from match.full).
  const mapContainer = renderMapFromView(view, spriteSheets);
  // Menus live on their own layer above the units, sharing the map's offset so tile coordinates
  // line up. Only turn management stays in the top bar; every other action is a board menu.
  const menuLayer = new Container();
  menuLayer.x = mapBorder;
  menuLayer.y = mapBorder;
  menuLayer.sortableChildren = true;

  reachableHighlightRef.current = null;
  attackHighlightRef.current = null;
  pathArrowRef.current = null; // destroyed with the stage on re-render; drop the dangling ref
  plannedPathRef.current = [];
  selectionRef.current = null;
  stagedDestRef.current = null;
  attackTargetsRef.current = [];
  // Also drop the armed-missile / staged-unload interaction: their overlays are destroyed with the
  // stage on this rebuild, so leaving the refs set would make the next click fire a missile / unload
  // at a stale target with no visible cue.
  missileArmRef.current = null;
  unloadDropsRef.current = [];

  let openMenu: Container | null = null;

  const closeMenu = () => {
    openMenu?.destroy({ children: true });
    openMenu = null;
  };

  const drawHighlights = (
    reachable: readonly BoardPosition[],
    attack: readonly BoardPosition[],
    unload: readonly BoardPosition[] = [],
  ) => {
    reachableHighlightRef.current?.destroy();
    attackHighlightRef.current?.destroy();
    unloadHighlightRef.current?.destroy();
    const blue = renderHighlightTiles(reachable, REACHABLE_COLOR);
    const red = renderHighlightTiles(attack, ATTACK_COLOR);
    const green = renderHighlightTiles(unload, UNLOAD_COLOR);
    mapContainer.addChild(blue, red, green);
    reachableHighlightRef.current = blue;
    attackHighlightRef.current = red;
    unloadHighlightRef.current = green;
  };

  // Redraw the AW movement arrow for the currently-traced route (plannedPathRef), into the map
  // container so it shares the map offset. Non-interactive, so it never eats a tile click.
  const drawPathArrow = () => {
    pathArrowRef.current?.destroy({ children: true });
    pathArrowRef.current = null;

    if (spriteSheets === undefined || plannedPathRef.current.length < 2) {
      return;
    }

    const arrow = renderPathArrow(spriteSheets, plannedPathRef.current);
    mapContainer.addChild(arrow);
    pathArrowRef.current = arrow;
  };

  const renderer: BoardRenderer = {
    drawHighlights,
    drawPathArrow,
    showMenu: (menu) => {
      closeMenu();
      menuLayer.addChild(menu);
      openMenu = menu;
    },
    closeMenu,
  };

  const controller = createBoardController({
    view,
    spriteSheets,
    playerId,
    queue,
    dispatchQueue,
    mapSize,
    refs,
    renderer,
  });
  resetInteractionRef.current = controller.resetInteraction;

  // Buffered (unconfirmed) intent: an AW arrow per buffered move at phantom opacity, plus the units
  // it targets rendered as translucent phantoms, so pending actions read directly on the board.
  const buffered = optimisticActions(queue);
  const bufferedArrows = renderBufferedArrows(spriteSheets, intentArrows(buffered));
  // Live in the map container (shares the mapBorder offset, so the arrows line up with the tile
  // grid; its zIndex 1050 keeps them above tiles/highlights but below the units drawn on the stage).
  mapContainer.addChild(bufferedArrows.container);

  // A travelling light cycles along each buffered arrow so pending moves feel alive.
  if (bufferedArrows.groups.length > 0) {
    let shimmerTime = 0;

    const shimmer = (delta: number) => {
      shimmerTime += delta * 0.08;
      shimmerBufferedArrows(bufferedArrows.groups, shimmerTime);
    };

    app.ticker.add(shimmer);
    shimmerRef.current = shimmer;
  }

  app.stage.addChild(
    mapContainer,
    renderUnitsFromView(view, spriteSheets, phantomPositions(buffered)),
    renderInteractiveTilesFromView(
      view,
      controller.onTileClick,
      controller.onTileHover,
      controller.onTileRightClick,
    ),
    menuLayer,
  );
}
