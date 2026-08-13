import type { QueuedAction } from "frontend/utils/action-queue";
import type { BoardPosition } from "./match-view";
import { samePosition, toMutablePath } from "./match-view";

/**
 * On-board visualisation of the optimistic action buffer (see `src/frontend/CLAUDE.md`). Pure
 * geometry derived from the buffered actions — no engine, no rules — so the pixi layer can draw a
 * movement arrow per buffered move and render the affected units as translucent "phantoms" (intent
 * the BE hasn't confirmed yet). Everything here is dropped the moment the action confirms and leaves
 * the buffer, so a phantom hardens into the real unit seamlessly.
 */

/** A buffered move's path, tagged by kind so the arrow can be coloured (attack red, capture green…). */
export type IntentArrow = { path: BoardPosition[]; kind: QueuedAction["kind"] };

/** One arrow per buffered move-like action that actually travels (its start and end tiles differ). */
export const intentArrows = (actions: QueuedAction[]): IntentArrow[] => {
  const arrows: IntentArrow[] = [];

  for (const { action, kind } of actions) {
    if (action.type !== "move" || action.path.length < 2) {
      continue;
    }

    const path = toMutablePath(action.path);

    // An in-place action (capture/ability while standing still) doesn't travel — no arrow.
    if (!samePosition(path[0], path[path.length - 1])) {
      arrows.push({ path, kind });
    }
  }

  return arrows;
};

/**
 * Board tiles whose sprite represents buffered (unconfirmed) intent — a moved unit's destination or
 * a just-built unit's tile. The renderer draws units on these tiles as phantoms. Deduped so a tile
 * targeted by two buffered actions isn't listed twice.
 */
export const phantomPositions = (actions: QueuedAction[]): BoardPosition[] => {
  const positions: BoardPosition[] = [];

  const add = (position: BoardPosition) => {
    if (!positions.some((existing) => samePosition(existing, position))) {
      positions.push(position);
    }
  };

  for (const { action } of actions) {
    if (action.type === "move") {
      const destination = action.path[action.path.length - 1];
      add([destination[0], destination[1]]);
    } else if (action.type === "build") {
      add([action.position[0], action.position[1]]);
    }
  }

  return positions;
};
