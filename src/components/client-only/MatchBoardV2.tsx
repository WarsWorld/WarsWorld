"use client";
import { useQuery } from "@tanstack/react-query";
import type { SpritesheetDataByArmy } from "frontend/components/match/getSpritesheetData";
import type { BoardPosition, MatchView } from "frontend/components/match/match-view";
import { getPlayerById } from "frontend/components/match/match-view";
import { PingIndicator } from "frontend/components/match/PingIndicator";
import { PowerBar } from "frontend/components/match/PowerBar";
import type { TurnSnapshot } from "frontend/components/match/turn-snapshot-view";
import type { UnloadDrop } from "frontend/components/match/turn-snapshot-view";
import { useMatchBoard } from "frontend/components/match/useMatchBoard";
import { hasUnresolvedActions, makeClientId } from "frontend/utils/action-queue";
import { BufferIndicator } from "frontend/components/match/BufferIndicator";
import { loadSpritesFromSpriteMap } from "pixi/load-spritesheet";
import { mountBoardScene } from "../../pixi/v2/board-scene";
import type { Container } from "pixi.js";
import { Application, Assets } from "pixi.js";
import { useEffect, useRef } from "react";
import { renderMultiplier } from "frontend/components/match/render-constants";

type Props = {
  matchId: string;
  playerId: string;
  spritesheetDataByArmy: SpritesheetDataByArmy;
};

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

  const spriteSheetQuery = useQuery({
    queryKey: ["spritesheets"],
    queryFn: async () => {
      // The bitmap font the in-board menus render with ("awFont" is declared in this .fnt).
      await Assets.load("/aw2Font.fnt");
      return loadSpritesFromSpriteMap(spritesheetDataByArmy);
    },
  });
  const spriteSheets = spriteSheetQuery.data;

  const {
    matchQuery,
    optimisticView,
    snapshot,
    isMyTurn,
    queue,
    dispatchQueue,
    queueRef,
    priceTableRef,
    actionMutation,
    onActionError,
  } = useMatchBoard({ matchId, playerId });

  // Interaction handlers read the OPTIMISTIC view (what's on screen), not the raw authoritative one,
  // so a just-moved unit is looked up at its new tile and can't be re-selected. Assign in an effect
  // rather than the render body (mutating a ref during render is a StrictMode/concurrent hazard) —
  // the handlers only read these lazily on a click/hover, well after the effect has committed.
  useEffect(() => {
    matchRef.current = optimisticView ?? null;
    snapshotRef.current = snapshot;
  }, [optimisticView, snapshot]);

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
    // Right-click is our universal "cancel current interaction" gesture, so suppress the browser
    // context menu over the board (handled per-tile via onTileRightClick below).
    const suppressContextMenu = (event: Event) => event.preventDefault();
    canvas.addEventListener("contextmenu", suppressContextMenu);
    containerRef.current.appendChild(canvas);
    appRef.current = app;

    return () => {
      canvas.removeEventListener("contextmenu", suppressContextMenu);
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

    mountBoardScene({
      app,
      view,
      spriteSheets,
      playerId,
      queue,
      dispatchQueue,
      refs: {
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
        matchRef,
        snapshotRef,
        priceTableRef,
        queueRef,
      },
    });
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
                clientId: makeClientId(),
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
