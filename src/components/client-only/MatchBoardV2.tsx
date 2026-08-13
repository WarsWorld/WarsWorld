"use client";
import { useQuery } from "@tanstack/react-query";
import type { SpritesheetDataByArmy } from "frontend/components/match/getSpritesheetData";
import type { BoardPosition, MatchView } from "frontend/components/match/match-view";
import {
  getArmyForSlot,
  getCurrentTurnPlayer,
  getPlayerById,
  getTileAt,
  getUnitAt,
  isOutOfBounds,
  samePosition,
} from "frontend/components/match/match-view";
import { applyBufferedActions } from "frontend/components/match/optimistic-view";
import { PingIndicator } from "frontend/components/match/PingIndicator";
import { PowerBar } from "frontend/components/match/PowerBar";
import type { SnapshotUnit, TurnSnapshot } from "frontend/components/match/turn-snapshot-view";
import {
  attackTargetsFrom,
  canLaunchFrom,
  isLoadableTile,
  reconstructPath,
  repairTargetsAt,
  snapshotUnitAt,
  unloadDropsAt,
  type RepairTarget,
  type UnloadDrop,
} from "frontend/components/match/turn-snapshot-view";
import {
  actionQueueReducer,
  canBufferAttack,
  hasUnresolvedActions,
  initialActionQueueState,
  nextPendingAction,
  optimisticActions,
  type ActionKind,
} from "frontend/utils/action-queue";
import { BufferIndicator } from "frontend/components/match/BufferIndicator";
import { trpc } from "frontend/utils/trpc-client";
import { loadSpritesFromSpriteMap } from "pixi/load-spritesheet";
import { Application, Assets, Container } from "pixi.js";
import { useEffect, useMemo, useReducer, useRef } from "react";
import type { MainAction } from "shared/schemas/action";
import { baseTileSize, mapBorder, renderMultiplier, renderedTileSize } from "./MatchRenderer";
import {
  createActionMenuElement,
  createBoardMenu,
  createUnitMenuElement,
} from "../../pixi/v2/board-menu";
import {
  renderHighlightTiles,
  renderInteractiveTilesFromView,
  renderMapFromView,
  renderUnitsFromView,
} from "../../pixi/v2/render-from-view";
import {
  renderBufferedArrows,
  renderPathArrow,
  shimmerBufferedArrows,
} from "../../pixi/v2/render-path-arrow";
import { intentArrows, phantomPositions } from "frontend/components/match/buffered-intent";
import { updateTracedPath } from "frontend/components/match/path-planning";

type Props = {
  matchId: string;
  playerId: string;
  spritesheetDataByArmy: SpritesheetDataByArmy;
};

const REACHABLE_COLOR = "#43d9e4";
const ATTACK_COLOR = "#be1919";
const UNLOAD_COLOR = "#3fb950";

const DROP_DIRECTIONS: { direction: UnloadDrop["direction"]; dx: number; dy: number }[] = [
  { direction: "up", dx: 0, dy: -1 },
  { direction: "down", dx: 0, dy: 1 },
  { direction: "left", dx: -1, dy: 0 },
  { direction: "right", dx: 1, dy: 0 },
];

const toMutable = (path: readonly BoardPosition[]): [number, number][] =>
  path.map((p) => [p[0], p[1]]);

const inList = (list: readonly BoardPosition[], pos: BoardPosition): boolean =>
  list.some((p) => samePosition(p, pos));

/**
 * Snapshot-driven board (Phase C). Renders from the plain `match.full` data and drives actions off
 * the BE turn snapshot + preview endpoints — NO client engine, NO `MatchWrapper`, NO rules geometry.
 * Selection is a plain position; reachable tiles and the move path come from the snapshot, attack
 * targets from the `attackTargets` endpoint. The backend stays authoritative (any event -> refetch),
 * so the client can't desync. This is now the DEFAULT board; the old engine-on-client board is the
 * `?v1` fallback during the cutover.
 *
 * Interaction: select a unit (blue reachable tiles), click a reachable tile to stage a move there,
 * then pick from an in-board contextual menu (ATTACK / CAPTURE / WAIT). ATTACK reveals red enemies
 * to click; a facility opens a build menu of its affordable units. Only turn management lives in the
 * top bar — every other action is a pixi menu anchored at the tile (matching the v1 look).
 *
 * Actions are buffered optimistically (see `applyBufferedActions` + `action-queue`): move/capture/
 * production show instantly as presentation deltas while the queue drains one action at a time and
 * reconciles against the BE's authoritative refetch. Attacks are BE-resolved and serialize on each
 * other (an unresolved attack blocks the next). Combat is never previewed on the client.
 */
export function MatchBoardV2({ matchId, playerId, spritesheetDataByArmy }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const appRef = useRef<Application | null>(null);
  const reachableHighlightRef = useRef<Container | null>(null);
  const attackHighlightRef = useRef<Container | null>(null);
  const unloadHighlightRef = useRef<Container | null>(null);
  // The move-path arrow shown while hovering a reachable tile with a unit selected. Matters most in
  // fog: the exact route decides which tiles the unit crosses (and whether it hits a hidden unit).
  const pathArrowRef = useRef<Container | null>(null);
  // The AW-style traced route the cursor is drawing (origin -> ... -> hovered tile). This is the path
  // that gets committed — not necessarily the shortest one — so the player controls the exact route.
  const plannedPathRef = useRef<BoardPosition[]>([]);
  // The pixi ticker callback animating the shimmer along buffered arrows; removed on each re-render.
  const shimmerRef = useRef<((delta: number) => void) | null>(null);
  // Selection: the unit's origin tile. Staged destination: where a move is being composed (null =
  // acting from the origin). Attack targets: the currently clickable red tiles. Unload drops: the
  // clickable green drop tiles once UNLOAD is chosen. All read by the imperative pixi click handler.
  const selectionRef = useRef<BoardPosition | null>(null);
  const stagedDestRef = useRef<BoardPosition | null>(null);
  const attackTargetsRef = useRef<BoardPosition[]>([]);
  const unloadDropsRef = useRef<UnloadDrop[]>([]);
  // While arming a missile: the move path onto the silo. The next board click is the strike target.
  const missileArmRef = useRef<{ path: readonly BoardPosition[] } | null>(null);
  const resetInteractionRef = useRef<() => void>(() => undefined);

  const matchRef = useRef<MatchView | null>(null);
  const snapshotRef = useRef<TurnSnapshot | null>(null);
  // The unit price table is static within a turn (production doesn't change prices), so latch the
  // last one the BE sent and keep building from it — no round-trip on each producer, and it survives
  // the per-action snapshot refetch. Only the very first turn of the match waits for it once.
  const priceTableRef = useRef<TurnSnapshot["production"]["priceTable"]>([]);

  // Optimistic action buffer (locked design in src/frontend/CLAUDE.md). The board renders
  // `authoritative match + pending intent`; the queue drains one action at a time and reconciles
  // against the BE's authoritative refetch, so it can't desync.
  const [queue, dispatchQueue] = useReducer(actionQueueReducer, initialActionQueueState);
  const queueRef = useRef(queue);
  queueRef.current = queue;
  // clientIds whose submit the BE accepted — dropped from the buffer once the authoritative state
  // that includes them lands (avoids a flicker/double-apply between success and refetch).
  const acknowledgedRef = useRef<Set<string>>(new Set());
  // clientIds currently in flight, so a re-run of the drain effect can't submit the same one twice.
  const inFlightRef = useRef<Set<string>>(new Set());

  const spriteSheetQuery = useQuery({
    queryKey: ["spritesheets"],
    queryFn: async () => {
      // The bitmap font the in-board menus render with ("awFont" is declared in this .fnt).
      await Assets.load("/aw2Font.fnt");
      return loadSpritesFromSpriteMap(spritesheetDataByArmy);
    },
  });

  const matchQuery = trpc.match.full.useQuery({ matchId, playerId });
  const match = matchQuery.data;
  const spriteSheets = spriteSheetQuery.data;

  const isMyTurn = match !== undefined && getCurrentTurnPlayer(match)?.id === playerId;

  const snapshotQuery = trpc.matchPreview.turnSnapshot.useQuery(
    { matchId, playerId },
    { enabled: isMyTurn },
  );

  const utils = trpc.useUtils();
  const actionMutation = trpc.action.send.useMutation();

  const snapshot = isMyTurn ? (snapshotQuery.data ?? null) : null;

  if (snapshot !== null && snapshot.production.priceTable.length > 0) {
    priceTableRef.current = snapshot.production.priceTable;
  }

  // The board's rendered truth: authoritative state with the buffered intent applied on top.
  const optimisticView = useMemo(
    () =>
      match === undefined
        ? undefined
        : applyBufferedActions(match, playerId, snapshot, optimisticActions(queue)),
    [match, snapshot, queue, playerId],
  );

  // Interaction handlers read the OPTIMISTIC view (what's on screen), not the raw authoritative one,
  // so a just-moved unit is looked up at its new tile and can't be re-selected.
  matchRef.current = optimisticView ?? null;
  snapshotRef.current = snapshot;

  trpc.action.onEvent.useSubscription(
    { playerId, matchId },
    {
      onData() {
        void utils.match.full.invalidate({ matchId, playerId });
        void utils.matchPreview.turnSnapshot.invalidate({ matchId, playerId });
      },
    },
  );

  const onActionError = (label: string) => (error: { message: string }) =>
    console.error(`[v2] ${label} rejected by BE:`, error.message);

  // Drain the buffer: submit the earliest pending action, one in flight at a time.
  useEffect(() => {
    const pending = nextPendingAction(queue);

    if (pending === undefined || inFlightRef.current.has(pending.clientId)) {
      return;
    }

    inFlightRef.current.add(pending.clientId);
    dispatchQueue({ type: "sent", clientId: pending.clientId });

    // The buffer stores the pure action; the transport adds the match/player envelope on submit.
    actionMutation.mutate(
      { ...pending.action, playerId, matchId },
      {
        onSuccess() {
          // Keep the optimistic delta until the authoritative refetch lands, then drop it (below).
          acknowledgedRef.current.add(pending.clientId);
          // Force a refetch AFTER acknowledging, so the [match] reconcile effect is guaranteed to run
          // with this id present. Without it, a subscription-driven refetch that landed BEFORE this
          // callback would leave the action stuck at "sent" (no further match change to confirm it).
          void utils.match.full.invalidate({ matchId, playerId });
          void utils.matchPreview.turnSnapshot.invalidate({ matchId, playerId });
        },
        onError(error) {
          onActionError(pending.kind)(error);
          // Reject only THIS action. Each unit acts once per turn, so buffered actions are
          // independent; the rest keep draining and are re-validated by the BE, so a genuinely
          // dependent one (e.g. moving onto a tile a failed move was meant to vacate) fails there
          // on its own. We don't pre-cancel unrelated moves.
          dispatchQueue({ type: "rejected", clientId: pending.clientId });
        },
        onSettled() {
          inFlightRef.current.delete(pending.clientId);
        },
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queue]);

  // Reconcile: when fresh authoritative state arrives it already includes every accepted action, so
  // drop those from the buffer (seamless hand-off from optimistic delta to BE truth).
  useEffect(() => {
    if (match === undefined || acknowledgedRef.current.size === 0) {
      return;
    }

    for (const clientId of acknowledgedRef.current) {
      dispatchQueue({ type: "confirmed", clientId });
    }

    acknowledgedRef.current.clear();
  }, [match]);

  // Turn boundary (ours ends / opponent's begins) -> discard the buffer, the BE wins. Structured so
  // a per-turn timer could later drive this same cutover (not implemented yet).
  useEffect(() => {
    dispatchQueue({ type: "reset" });
    acknowledgedRef.current.clear();
    inFlightRef.current.clear();
  }, [match?.turn]);

  // Create the pixi app once, with its own canvas. Destroy only on unmount.
  useEffect(() => {
    if (containerRef.current === null) {
      return;
    }

    const app = new Application({
      autoDensity: true,
      resolution: window.devicePixelRatio,
      backgroundColor: "#000b2c",
    });
    app.stage.sortableChildren = true;
    app.stage.scale.set(renderMultiplier, renderMultiplier);
    const canvas = app.view as unknown as HTMLCanvasElement;
    canvas.style.imageRendering = "pixelated";
    containerRef.current.appendChild(canvas);
    appRef.current = app;

    return () => {
      app.destroy(true, { children: true });
      appRef.current = null;
    };
  }, []);

  // (Re)render the stage content whenever the rendered (optimistic) view changes. The app persists.
  useEffect(() => {
    const app = appRef.current;
    const view = optimisticView;

    if (app === null || view === undefined || spriteSheets === undefined) {
      return;
    }

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

    const resetInteraction = () => {
      selectionRef.current = null;
      stagedDestRef.current = null;
      attackTargetsRef.current = [];
      unloadDropsRef.current = [];
      missileArmRef.current = null;
      plannedPathRef.current = [];
      closeMenu();
      drawHighlights([], []);
      drawPathArrow();
    };

    // The route to commit for a move to `dest`: the cursor-traced path when it ends there, otherwise
    // the snapshot's shortest path. So a hovered/drawn route is honoured; a direct click uses shortest.
    const commitPath = (unit: SnapshotUnit, dest: BoardPosition): BoardPosition[] | null => {
      const traced = plannedPathRef.current;

      if (traced.length >= 1 && samePosition(traced[traced.length - 1], dest)) {
        return traced;
      }

      return reconstructPath(unit, dest);
    };

    resetInteractionRef.current = resetInteraction;

    // Buffer an action optimistically and close the interaction; the drain effect submits it and
    // reconciles against the BE. This is the ONLY submit path for board actions now.
    const enqueue = (kind: ActionKind, action: MainAction) => {
      resetInteraction();
      dispatchQueue({ type: "enqueue", clientId: crypto.randomUUID(), kind, action });
    };

    const enqueueMove = (
      kind: ActionKind,
      path: readonly BoardPosition[],
      subAction:
        | { type: "wait" }
        | { type: "ability" }
        | { type: "attack"; defenderPosition: [number, number] },
    ) => enqueue(kind, { type: "move", path: toMutable(path), subAction });

    // A unit's reachable tiles minus those a BUFFERED move now occupies (a tile another unit has
    // been moved onto isn't a valid plain-move destination — we'd stack two units). Its own tile and
    // valid load targets stay. Vacated tiles are already free in the optimistic view. We don't
    // re-path around new blockers — the BE reconciles that (per the locked design).
    const movableTiles = (unit: SnapshotUnit): BoardPosition[] =>
      unit.reachableTiles
        .map((tile) => tile.position)
        .filter(
          (pos) =>
            samePosition(pos, unit.position) ||
            getUnitAt(view, pos) === undefined ||
            isLoadableTile(unit, pos),
        );

    // Fallback unload drops for cargo the turn-start snapshot doesn't know about (a load buffered
    // THIS turn): the adjacent in-bounds, empty tiles around `dest`, one set per loaded slot. Terrain
    // isn't checked here — the BE validates it and rejects a bad drop, so it can't desync.
    const optimisticUnloadDrops = (unit: SnapshotUnit, dest: BoardPosition): UnloadDrop[] => {
      const transport = getUnitAt(view, unit.position) as
        | { loadedUnit?: unknown; loadedUnit2?: unknown }
        | undefined;

      if (transport === undefined) {
        return [];
      }

      const slots: boolean[] = [];

      if ("loadedUnit" in transport && transport.loadedUnit != null) {
        slots.push(false);
      }

      if ("loadedUnit2" in transport && transport.loadedUnit2 != null) {
        slots.push(true);
      }

      const drops: UnloadDrop[] = [];

      for (const isSecondUnit of slots) {
        for (const { direction, dx, dy } of DROP_DIRECTIONS) {
          const position: [number, number] = [dest[0] + dx, dest[1] + dy];

          if (!isOutOfBounds(view, position) && getUnitAt(view, position) === undefined) {
            drops.push({ isSecondUnit, direction, position });
          }
        }
      }

      return drops;
    };

    // Open a contextual action menu (WAIT / CAPTURE / ATTACK) anchored at `dest`.
    const openActionMenu = (
      dest: BoardPosition,
      options: { label: string; onSelect: () => void }[],
    ) => {
      closeMenu();
      const unitSize = baseTileSize / 2;
      const elements = options.map((option, index) => {
        const element = createActionMenuElement(option.label, index);
        element.on("pointerdown", option.onSelect);
        return element;
      });
      const menu = createBoardMenu(mapSize, dest, options.length * unitSize * 2, 3, elements);
      menuLayer.addChild(menu);
      openMenu = menu;
    };

    // After UNLOAD is chosen: if the transport carries two units, first pick which one; then light
    // up that unit's valid drop tiles (green) for the player to click.
    const showUnloadDrops = (unit: SnapshotUnit, dest: BoardPosition, drops: UnloadDrop[]) => {
      const transport = getUnitAt(view, unit.position) as
        | { loadedUnit?: { type: string } | null; loadedUnit2?: { type: string } | null }
        | undefined;

      const slotLabel = (isSecond: boolean): string => {
        const cargo = isSecond ? transport?.loadedUnit2 : transport?.loadedUnit;
        return cargo ? cargo.type.toUpperCase() : "UNIT";
      };

      const lightUpSlot = (isSecond: boolean) => {
        const slotDrops = drops.filter((drop) => drop.isSecondUnit === isSecond);
        unloadDropsRef.current = slotDrops;
        closeMenu();
        drawHighlights(
          [],
          [],
          slotDrops.map((drop) => drop.position),
        );
      };

      const slots = Array.from(new Set(drops.map((drop) => drop.isSecondUnit)));

      if (slots.length === 1) {
        lightUpSlot(slots[0]);

        return;
      }

      openActionMenu(
        dest,
        slots.map((isSecond) => ({
          label: slotLabel(isSecond),
          onSelect: () => lightUpSlot(isSecond),
        })),
      );
    };

    // After REPAIR is chosen: pick which adjacent friendly to repair (its direction), then buffer the
    // move+repair. A single target repairs immediately; multiple offer a small submenu.
    const chooseRepair = (unit: SnapshotUnit, dest: BoardPosition, targets: RepairTarget[]) => {
      const bufferRepair = (target: RepairTarget) => {
        const path = commitPath(unit, dest);

        if (path !== null) {
          enqueue("repair", {
            type: "move",
            path: toMutable(path),
            subAction: { type: "repair", direction: target.direction },
          });
        }
      };

      if (targets.length === 1) {
        bufferRepair(targets[0]);

        return;
      }

      openActionMenu(
        dest,
        targets.map((target) => ({
          label: `REPAIR ${(getUnitAt(view, target.position)?.type ?? "unit").toUpperCase()}`,
          onSelect: () => bufferRepair(target),
        })),
      );
    };

    // After LAUNCH is chosen: arm the missile (light the whole board red) and let the next click pick
    // the strike tile. The path onto the silo is captured now; the target is chosen on the board.
    const armMissile = (unit: SnapshotUnit, dest: BoardPosition) => {
      const path = commitPath(unit, dest);

      if (path === null) {
        return;
      }

      closeMenu();
      missileArmRef.current = { path };
      attackTargetsRef.current = [];
      unloadDropsRef.current = [];

      const everyTile: BoardPosition[] = [];

      for (let y = 0; y < view.map.tiles.length; y++) {
        for (let x = 0; x < view.map.tiles[y].length; x++) {
          everyTile.push([x, y]);
        }
      }

      drawHighlights(movableTiles(unit), everyTile); // red = pick any tile as the missile target
    };

    // Stage a move at `dest` and offer the actions available from there. Fully synchronous (load
    // validity, attack targets and unload drops all come from the snapshot, not the network) so
    // staging works instantly even offline / throttled — the whole point of buffering.
    const stageMove = (unit: SnapshotUnit, dest: BoardPosition) => {
      // Lock the traced route to end at `dest` (the drawn path if the cursor reached it, else the
      // shortest), then draw it — every action from here commits along this exact path.
      plannedPathRef.current = updateTracedPath(unit, plannedPathRef.current, dest);
      drawPathArrow();

      const reachable = movableTiles(unit);
      const myPlayer = getPlayerById(view, playerId);
      const destTile = getTileAt(view, dest);
      const occupant = getUnitAt(view, dest);

      // --- Onto a friendly unit: a LOAD or JOIN, but only when the engine says it's valid. ---
      if (occupant !== undefined && !samePosition(dest, unit.position)) {
        if (!isLoadableTile(unit, dest)) {
          return; // occupied by a friendly the BE won't let us load/join into — no action here
        }

        stagedDestRef.current = dest;
        attackTargetsRef.current = [];
        unloadDropsRef.current = [];
        drawHighlights(reachable, []);

        openActionMenu(dest, [
          {
            label: occupant.type === unit.type ? "JOIN" : "LOAD",
            onSelect: () => {
              const path = commitPath(unit, dest);

              if (path !== null) {
                enqueueMove("move", path, { type: "wait" });
              }
            },
          },
        ]);

        return;
      }

      // --- Onto an empty tile: wait / capture / attack / unload. ---
      const canCapture =
        (unit.type === "infantry" || unit.type === "mech") &&
        myPlayer !== undefined &&
        "playerSlot" in destTile &&
        destTile.playerSlot !== myPlayer.slot;

      const targets = attackTargetsFrom(unit, dest);
      // An attack can only be offered if no earlier attack is still unresolved (they serialize).
      const canAttack = targets.length > 0 && canBufferAttack(queueRef.current);

      // Unload drops from the snapshot; if the snapshot has no unload data for this transport at all
      // (a load buffered this turn it doesn't know about) but the optimistic view shows cargo, fall
      // back to adjacent empty tiles so the player can unload right away without waiting for confirm.
      let drops = unloadDropsAt(unit, dest);

      if (drops.length === 0 && unit.unloadsByTile.length === 0) {
        drops = optimisticUnloadDrops(unit, dest);
      }

      stagedDestRef.current = dest;
      attackTargetsRef.current = canAttack ? targets : [];
      unloadDropsRef.current = [];
      drawHighlights(reachable, []); // red targets appear only once ATTACK is chosen

      const options: { label: string; onSelect: () => void }[] = [];

      if (canAttack) {
        options.push({
          label: "ATTACK",
          onSelect: () => {
            closeMenu();
            drawHighlights(reachable, targets); // now pick a red enemy on the board
          },
        });
      }

      if (canCapture) {
        options.push({
          label: "CAPTURE",
          onSelect: () => {
            const path = commitPath(unit, dest);

            if (path !== null) {
              enqueueMove("capture", path, { type: "ability" });
            }
          },
        });
      }

      if (drops.length > 0) {
        options.push({
          label: "UNLOAD",
          onSelect: () => showUnloadDrops(unit, dest, drops),
        });
      }

      // Ability: APC supply, or a sub/stealth toggle. The snapshot gives the neutral direction
      // (hide/reveal); a sub DIVE/SURFACEs while an aircraft (stealth) HIDE/APPEARs.
      if (unit.ability !== null) {
        const conceal = unit.type === "sub" ? "DIVE" : "HIDE";
        const reveal = unit.type === "sub" ? "SURFACE" : "APPEAR";
        const abilityLabel = { supply: "SUPPLY", hide: conceal, reveal }[unit.ability.kind];

        options.push({
          label: abilityLabel,
          onSelect: () => {
            const path = commitPath(unit, dest);

            if (path !== null) {
              enqueueMove("ability", path, { type: "ability" });
            }
          },
        });
      }

      // Launch missile: an infantry/mech ending on an unfired silo can fire (target picked next).
      if (canLaunchFrom(unit, dest)) {
        options.push({ label: "LAUNCH", onSelect: () => armMissile(unit, dest) });
      }

      // Black-boat repair: heal/resupply an adjacent friendly.
      const repairTargets = repairTargetsAt(unit, dest);

      if (repairTargets.length > 0) {
        options.push({
          label: "REPAIR",
          onSelect: () => chooseRepair(unit, dest, repairTargets),
        });
      }

      // Delete (self-destruct) is an in-place main action — only offered on the unit's own tile.
      if (samePosition(dest, unit.position)) {
        options.push({
          label: "DELETE",
          onSelect: () =>
            enqueue("delete", { type: "delete", position: [unit.position[0], unit.position[1]] }),
        });
      }

      options.push({
        label: "WAIT",
        onSelect: () => {
          const path = commitPath(unit, dest);

          if (path !== null) {
            enqueueMove("move", path, { type: "wait" });
          }
        },
      });

      openActionMenu(dest, options);
    };

    // Open the build menu for an owned, empty production facility. Uses the LATCHED price table (no
    // round-trip) and OPTIMISTIC funds (already-buffered builds subtracted), so producing never
    // waits on the BE after the round-start list is known.
    const openBuildMenu = (position: BoardPosition, facility: string) => {
      const myPlayer = getPlayerById(view, playerId);
      const army = myPlayer === undefined ? undefined : getArmyForSlot(view, myPlayer.slot);
      const priceTable = priceTableRef.current;

      if (myPlayer === undefined || army === undefined || priceTable.length === 0) {
        return;
      }

      const sheet = spriteSheets[army];
      const availableFunds = myPlayer.funds;
      const buildableUnits = priceTable
        .filter((entry) => entry.facility === facility)
        .sort((a, b) => a.cost - b.cost);

      const unitSize = baseTileSize / 2;
      const elements = buildableUnits.map((entry, index) => {
        const selectable = entry.cost <= availableFunds;
        const element = createUnitMenuElement(
          sheet,
          { unitType: entry.type, cost: entry.cost, selectable },
          index,
        );

        if (selectable) {
          element.on("pointerdown", () => {
            enqueue("production", {
              type: "build",
              unitType: entry.type,
              position: [position[0], position[1]],
            });
          });
        }

        return element;
      });

      closeMenu();
      const menu = createBoardMenu(
        mapSize,
        position,
        buildableUnits.length * unitSize * 2,
        6,
        elements,
      );
      menuLayer.addChild(menu);
      openMenu = menu;
    };

    const onTileClick = (pos: BoardPosition) => {
      const currentMatch = matchRef.current;
      const snapshot = snapshotRef.current;
      const selected = selectionRef.current;

      if (currentMatch === null || currentMatch.gameOver !== null) {
        return; // the match is decided — the board is read-only
      }

      // --- Arming a missile: the next in-bounds click is the strike target. ---
      const arm = missileArmRef.current;

      if (arm !== null) {
        if (!isOutOfBounds(currentMatch, pos)) {
          enqueue("launch", {
            type: "move",
            path: toMutable(arm.path),
            subAction: { type: "launchMissile", targetPosition: [pos[0], pos[1]] },
          });
        } else {
          resetInteraction();
        }

        return;
      }

      // --- With a unit selected: attack a red enemy, or stage a move at a reachable tile ---
      if (selected !== null && snapshot !== null) {
        const unit = snapshotUnitAt(snapshot, selected);

        if (unit !== undefined) {
          // Clicked a green unload drop tile -> unload that cargo unit onto it.
          const drop = unloadDropsRef.current.find((entry) => samePosition(entry.position, pos));

          if (drop !== undefined) {
            const path = commitPath(unit, stagedDestRef.current ?? selected);

            if (path !== null) {
              enqueue("move", {
                type: "move",
                path: toMutable(path),
                subAction: {
                  type: "unloadWait",
                  unloads: [{ isSecondUnit: drop.isSecondUnit, direction: drop.direction }],
                },
              });
            }

            return;
          }

          // Clicked a highlighted enemy -> attack from the staged origin (moving there first).
          if (inList(attackTargetsRef.current, pos)) {
            const path = commitPath(unit, stagedDestRef.current ?? selected);

            if (path !== null && canBufferAttack(queueRef.current)) {
              enqueueMove("attack", path, { type: "attack", defenderPosition: [pos[0], pos[1]] });
            }

            return;
          }

          // Clicked a reachable tile (its own tile included) -> stage there and open its menu.
          if (inList(movableTiles(unit), pos)) {
            stageMove(unit, pos);

            return;
          }
        }
      }

      // --- Click an owned, empty production facility -> open its build menu. ---
      // Derived from the (optimistic) view + latched price table, so it needs no snapshot round-trip.
      const tile = getTileAt(currentMatch, pos);
      const facility =
        tile.type === "base" || tile.type === "airport" || tile.type === "port" ? tile.type : null;
      const buildPlayer = getPlayerById(currentMatch, playerId);

      if (
        facility !== null &&
        buildPlayer !== undefined &&
        "playerSlot" in tile &&
        tile.playerSlot === buildPlayer.slot &&
        getUnitAt(currentMatch, pos) === undefined
      ) {
        resetInteraction();
        openBuildMenu(pos, facility);

        return;
      }

      // --- Otherwise: (re)select an own, ready unit, or clear. Needs the snapshot for reachability.
      if (snapshot === null) {
        resetInteraction();

        return;
      }

      const myPlayer = getPlayerById(currentMatch, playerId);
      const unitHere = getUnitAt(currentMatch, pos);
      const snapshotUnit = snapshotUnitAt(snapshot, pos);

      if (
        myPlayer !== undefined &&
        unitHere !== undefined &&
        unitHere.playerSlot === myPlayer.slot &&
        snapshotUnit !== undefined &&
        snapshotUnit.reachableTiles.length > 0
      ) {
        resetInteraction();
        selectionRef.current = pos;
        plannedPathRef.current = [pos]; // start the traced route at the unit's tile
        drawHighlights(movableTiles(snapshotUnit), []);
      } else {
        resetInteraction();
      }
    };

    // Hovering a reachable tile (with a unit selected, before a destination is staged) extends the
    // cursor-drawn route toward that tile and redraws the AW arrow. The exact route is what gets
    // committed, so the player controls which tiles the unit crosses — critical in fog.
    const onTileHover = (pos: BoardPosition) => {
      const snapshot = snapshotRef.current;
      const selected = selectionRef.current;

      // Only trace while still choosing a destination — not once a move is staged (menu open / picking
      // an attack target or unload tile) and not while arming a missile.
      if (
        snapshot === null ||
        selected === null ||
        stagedDestRef.current !== null ||
        missileArmRef.current !== null
      ) {
        return;
      }

      const unit = snapshotUnitAt(snapshot, selected);

      if (unit === undefined) {
        return;
      }

      plannedPathRef.current = updateTracedPath(unit, plannedPathRef.current, pos);
      drawPathArrow();
    };

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
      renderInteractiveTilesFromView(view, onTileClick, onTileHover),
      menuLayer,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [optimisticView, spriteSheets]);

  if (matchQuery.isError || spriteSheetQuery.isError) {
    return <p>error {":("}</p>;
  }

  // Match outcome (derived by the BE from player elimination); non-null => banner + no more actions.
  const gameOver = optimisticView?.gameOver ?? null;

  return (
    <div className="@w-full @h-full @flex @flex-col @items-center @justify-center @py-4">
      <PingIndicator />
      <p>
        {optimisticView === undefined || spriteSheets === undefined
          ? "Loading v2 board…"
          : `[v2 snapshot board] Funds: ${getPlayerById(optimisticView, playerId)?.funds ?? 0} — ${
              isMyTurn ? "your turn — pick a unit or facility on the board" : "waiting for opponent"
            }`}
      </p>
      {/* Turn management + CO power live in the bar (a power isn't tied to a board tile); every
          other action is a menu on the board. */}
      <div className="@flex @items-center @gap-3">
        {isMyTurn && snapshot !== null && (
          <PowerBar
            power={snapshot.power}
            pending={queue.actions.some(
              (action) => action.kind === "coPower" && action.status !== "rejected",
            )}
            onActivate={(isSuper) => {
              resetInteractionRef.current();
              dispatchQueue({
                type: "enqueue",
                clientId: crypto.randomUUID(),
                kind: "coPower",
                action: { type: "coPower", isSuper },
              });
            }}
          />
        )}
        <BufferIndicator queue={queue} />
        <button
          className="btn @select-none"
          // Can't end the turn on UNRESOLVED intent — wait for pending/in-flight actions to drain.
          // Rejected actions linger for visibility but must not block the turn (that was a bug).
          disabled={!isMyTurn || gameOver !== null || hasUnresolvedActions(queue)}
          onClick={() => {
            resetInteractionRef.current();
            actionMutation.mutate(
              { type: "passTurn", playerId, matchId },
              { onError: onActionError("pass turn") },
            );
          }}
        >
          {isMyTurn ? "Pass Turn" : "Not your turn"}
        </button>
      </div>
      {/* pixi appends its own canvas here (created once, StrictMode-safe); the game-over banner
          overlays it once the match is decided. */}
      <div className="@relative" style={{ imageRendering: "pixelated" }}>
        <div ref={containerRef} />
        {gameOver !== null && (
          <div className="@absolute @inset-0 @flex @flex-col @items-center @justify-center @gap-1 @bg-black/60 @text-white">
            <p
              className={`@text-5xl @font-extrabold @drop-shadow ${
                gameOver.viewerWon
                  ? "@text-emerald-400"
                  : gameOver.winnerTeamIndex === null
                    ? "@text-slate-200"
                    : "@text-red-400"
              }`}
            >
              {gameOver.viewerWon
                ? "Victory!"
                : gameOver.winnerTeamIndex === null
                  ? "Draw"
                  : "Defeat"}
            </p>
            <p className="@opacity-80 @text-sm">Game over</p>
          </div>
        )}
      </div>
    </div>
  );
}
