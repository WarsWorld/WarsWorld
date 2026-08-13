"use client";
import { useQuery } from "@tanstack/react-query";
import type { SpritesheetDataByArmy } from "frontend/components/match/getSpritesheetData";
import type { BoardPosition, MatchView } from "frontend/components/match/match-view";
import {
  getCurrentTurnPlayer,
  getPlayerById,
  getTileAt,
  getUnitAt,
  samePosition,
} from "frontend/components/match/match-view";
import type { SnapshotUnit, TurnSnapshot } from "frontend/components/match/turn-snapshot-view";
import { reconstructPath, snapshotUnitAt } from "frontend/components/match/turn-snapshot-view";
import { trpc } from "frontend/utils/trpc-client";
import { loadSpritesFromSpriteMap } from "pixi/load-spritesheet";
import type { Container } from "pixi.js";
import { Application } from "pixi.js";
import { useEffect, useRef, useState } from "react";
import { renderMultiplier, renderedTileSize } from "./MatchRenderer";
import {
  renderHighlightTiles,
  renderInteractiveTilesFromView,
  renderMapFromView,
  renderUnitsFromView,
} from "../../pixi/v2/render-from-view";

type Props = {
  matchId: string;
  playerId: string;
  spritesheetDataByArmy: SpritesheetDataByArmy;
};

const REACHABLE_COLOR = "#43d9e4";
const ATTACK_COLOR = "#be1919";

const toMutable = (path: readonly BoardPosition[]): [number, number][] =>
  path.map((p) => [p[0], p[1]]);

const inList = (list: readonly BoardPosition[], pos: BoardPosition): boolean =>
  list.some((p) => samePosition(p, pos));

/**
 * Snapshot-driven board (Phase C). Renders from the plain `match.full` data and drives actions off
 * the BE turn snapshot + preview endpoints — NO client engine, NO `MatchWrapper`, NO rules geometry.
 * Selection is a plain position; reachable tiles and the move path come from the snapshot, attack
 * targets from the `attackTargets` endpoint. The backend stays authoritative (any event -> refetch),
 * so the client can't desync. Behind `?v2`.
 *
 * Move / move-and-capture / attack / move-and-attack: select a unit, then either attack an in-range
 * enemy (red), or click a reachable tile (blue). If actions are possible from that tile it "stages"
 * there (red targets + Wait/Capture buttons); otherwise it just moves. Attacks are BE-resolved.
 * Optimistic buffering isn't wired yet — everything is BE-authoritative.
 */
export function MatchBoardV2({ matchId, playerId, spritesheetDataByArmy }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const appRef = useRef<Application | null>(null);
  const reachableHighlightRef = useRef<Container | null>(null);
  const attackHighlightRef = useRef<Container | null>(null);
  // Selection: the unit's origin tile. Staged destination: where a move is being composed (null =
  // acting from the origin). Attack targets: the currently clickable red tiles. All read by the
  // imperative pixi click handler, so they live in refs.
  const selectionRef = useRef<BoardPosition | null>(null);
  const stagedDestRef = useRef<BoardPosition | null>(null);
  const attackTargetsRef = useRef<BoardPosition[]>([]);
  const resetInteractionRef = useRef<() => void>(() => undefined);

  // Mirrored into React state so the action buttons can react to it.
  const [selectedUnit, setSelectedUnit] = useState<SnapshotUnit | null>(null);
  const [staged, setStaged] = useState<{ dest: BoardPosition; canCapture: boolean } | null>(null);

  const matchRef = useRef<MatchView | null>(null);
  const snapshotRef = useRef<TurnSnapshot | null>(null);

  const spriteSheetQuery = useQuery({
    queryKey: ["spritesheets"],
    queryFn: () => loadSpritesFromSpriteMap(spritesheetDataByArmy),
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

  matchRef.current = match ?? null;
  snapshotRef.current = isMyTurn ? (snapshotQuery.data ?? null) : null;

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

  // Enemies attackable from `fromPosition` this turn (empty on error / no snapshot).
  const fetchAttackTargets = async (
    unitPosition: BoardPosition,
    fromPosition: BoardPosition,
  ): Promise<BoardPosition[]> => {
    try {
      return await utils.matchPreview.attackTargets.fetch({
        matchId,
        playerId,
        unitPosition: [unitPosition[0], unitPosition[1]],
        fromPosition: [fromPosition[0], fromPosition[1]],
      });
    } catch {
      return [];
    }
  };

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

  // (Re)render the stage content whenever the data changes. The app itself persists.
  useEffect(() => {
    const app = appRef.current;

    if (app === null || match === undefined || spriteSheets === undefined) {
      return;
    }

    app.renderer.resize(
      match.map.tiles[0].length * renderedTileSize + renderedTileSize,
      match.map.tiles.length * renderedTileSize + renderedTileSize,
    );

    for (const child of app.stage.removeChildren()) {
      child.destroy({ children: true });
    }

    const mapContainer = renderMapFromView(match, spriteSheets);
    reachableHighlightRef.current = null;
    attackHighlightRef.current = null;
    selectionRef.current = null;
    stagedDestRef.current = null;
    attackTargetsRef.current = [];

    const drawHighlights = (
      reachable: readonly BoardPosition[],
      attack: readonly BoardPosition[],
    ) => {
      reachableHighlightRef.current?.destroy();
      attackHighlightRef.current?.destroy();
      const blue = renderHighlightTiles(reachable, REACHABLE_COLOR);
      const red = renderHighlightTiles(attack, ATTACK_COLOR);
      mapContainer.addChild(blue, red);
      reachableHighlightRef.current = blue;
      attackHighlightRef.current = red;
    };

    const resetInteraction = () => {
      selectionRef.current = null;
      stagedDestRef.current = null;
      attackTargetsRef.current = [];
      drawHighlights([], []);
      setSelectedUnit(null);
      setStaged(null);
    };

    resetInteractionRef.current = resetInteraction;

    const submit = (
      label: string,
      path: readonly BoardPosition[],
      subAction:
        | { type: "wait" }
        | { type: "ability" }
        | { type: "attack"; defenderPosition: [number, number] },
    ) => {
      resetInteraction();
      actionMutation.mutate(
        { playerId, matchId, type: "move", path: toMutable(path), subAction },
        { onError: onActionError(label) },
      );
    };

    const onTileClick = (pos: BoardPosition) => {
      const currentMatch = matchRef.current;
      const snapshot = snapshotRef.current;
      const selected = selectionRef.current;

      if (currentMatch === null || snapshot === null) {
        return;
      }

      // --- With a unit selected: attack / move / stage ---
      if (selected !== null) {
        const unit = snapshotUnitAt(snapshot, selected);

        if (unit !== undefined) {
          const attackOrigin = stagedDestRef.current ?? selected;

          // Clicked a highlighted enemy -> attack from the current origin (moving there first).
          if (inList(attackTargetsRef.current, pos)) {
            const path = reconstructPath(unit, attackOrigin);

            if (path !== null) {
              submit("attack", path, { type: "attack", defenderPosition: [pos[0], pos[1]] });
            }

            return;
          }

          // Clicked a reachable tile (and not already staged there) -> move, or stage if something
          // can be done from there (attack an enemy / capture a property).
          const reachable = unit.reachableTiles.map((tile) => tile.position);
          const isStagedHere =
            stagedDestRef.current !== null && samePosition(pos, stagedDestRef.current);

          if (inList(reachable, pos) && !samePosition(pos, selected) && !isStagedHere) {
            const myPlayer = getPlayerById(currentMatch, playerId);
            const destTile = getTileAt(currentMatch, pos);
            const canCapture =
              (unit.type === "infantry" || unit.type === "mech") &&
              myPlayer !== undefined &&
              "playerSlot" in destTile &&
              destTile.playerSlot !== myPlayer.slot;

            void (async () => {
              const targets = await fetchAttackTargets(selected, pos);

              // Nothing to choose from -> just move (keeps plain moves one click).
              if (targets.length === 0 && !canCapture) {
                const path = reconstructPath(unit, pos);

                if (path !== null) {
                  submit("move", path, { type: "wait" });
                }

                return;
              }

              // Stage the move: offer the targets (red) + Wait/Capture buttons.
              stagedDestRef.current = pos;
              attackTargetsRef.current = targets;
              drawHighlights(reachable, targets);
              setStaged({ dest: pos, canCapture });
            })();

            return;
          }
        }
      }

      // --- Otherwise: (re)select an own, ready unit, or clear. ---
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
        const reachable = snapshotUnit.reachableTiles.map((tile) => tile.position);
        selectionRef.current = pos;
        stagedDestRef.current = null;
        setSelectedUnit(snapshotUnit);
        setStaged(null);
        drawHighlights(reachable, []);

        // Show enemies attackable from where the unit stands (in-place / indirect fire).
        void (async () => {
          const targets = await fetchAttackTargets(pos, pos);

          if (selectionRef.current !== null && samePosition(selectionRef.current, pos)) {
            attackTargetsRef.current = targets;
            drawHighlights(reachable, targets);
          }
        })();
      } else {
        resetInteraction();
      }
    };

    app.stage.addChild(
      mapContainer,
      renderUnitsFromView(match, spriteSheets),
      renderInteractiveTilesFromView(match, onTileClick, () => undefined),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [match, spriteSheets]);

  if (matchQuery.isError || spriteSheetQuery.isError) {
    return <p>error {":("}</p>;
  }

  const capturePosition =
    staged?.dest ?? (selectedUnit?.canCapture === true ? selectedUnit.position : null);
  const showCapture =
    staged?.canCapture === true || (staged === null && selectedUnit?.canCapture === true);

  return (
    <div className="@w-full @h-full @flex @flex-col @items-center @justify-center @py-4">
      <p>
        {match === undefined || spriteSheets === undefined
          ? "Loading v2 board…"
          : `[v2 snapshot board] Funds: ${getPlayerById(match, playerId)?.funds ?? 0} — ${
              isMyTurn ? "your turn" : "waiting for opponent"
            }${staged !== null ? " — click a red enemy to attack, or:" : ""}`}
      </p>
      <div className="@flex @gap-2">
        {staged !== null && (
          <button
            className="btn @select-none"
            disabled={actionMutation.isLoading}
            onClick={() => {
              const unit =
                selectionRef.current === null || snapshotRef.current === null
                  ? undefined
                  : snapshotUnitAt(snapshotRef.current, selectionRef.current);
              const path = unit === undefined ? null : reconstructPath(unit, staged.dest);

              if (path !== null) {
                resetInteractionRef.current();
                actionMutation.mutate(
                  {
                    type: "move",
                    path: toMutable(path),
                    subAction: { type: "wait" },
                    playerId,
                    matchId,
                  },
                  { onError: onActionError("move") },
                );
              }
            }}
          >
            Move here
          </button>
        )}
        {showCapture && capturePosition !== null && (
          <button
            className="btn @select-none"
            disabled={actionMutation.isLoading}
            onClick={() => {
              const unit =
                selectionRef.current === null || snapshotRef.current === null
                  ? undefined
                  : snapshotUnitAt(snapshotRef.current, selectionRef.current);
              const path = unit === undefined ? null : reconstructPath(unit, capturePosition);

              if (path !== null) {
                resetInteractionRef.current();
                actionMutation.mutate(
                  {
                    type: "move",
                    path: toMutable(path),
                    subAction: { type: "ability" },
                    playerId,
                    matchId,
                  },
                  { onError: onActionError("capture") },
                );
              }
            }}
          >
            Capture
          </button>
        )}
        <button
          className="btn @select-none"
          disabled={!isMyTurn || actionMutation.isLoading}
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
      {/* pixi appends its own canvas here (created once, StrictMode-safe) */}
      <div ref={containerRef} style={{ imageRendering: "pixelated" }} />
    </div>
  );
}
