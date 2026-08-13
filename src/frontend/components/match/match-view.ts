import type { inferTRPCOutput } from "frontend/utils/trpc-client";

/**
 * The client's view of a match — the plain, authoritative data the backend sends from
 * `match.full`, typed purely by tRPC inference (the sanctioned FE<->BE contract). The frontend
 * renders this and the BE-computed previews; it does NOT run the engine.
 *
 * These helpers are the presentation-side replacements for the handful of trivial `MatchWrapper`
 * lookups the pixi layer used to call (position/id/slot lookups, ownership, visual HP, bounds).
 * Anything that needs game rules or constants (reachable tiles, attack targets, damage, available
 * actions, unit traits) comes from the `matchPreview` queries, never from re-derivation here.
 */
export type MatchView = NonNullable<inferTRPCOutput<"match", "full">>;
export type MatchUnit = MatchView["units"][number];
export type MatchPlayer = MatchView["players"][number];

export type MatchTile = MatchView["map"]["tiles"][number][number];
export type MatchChangeableTile = MatchView["changeableTiles"][number];

/** A board coordinate `[x, y]`, matching the wire `Position` tuple. */
export type BoardPosition = readonly [number, number];

export const samePosition = (a: BoardPosition, b: BoardPosition): boolean =>
  a[0] === b[0] && a[1] === b[1];

/** The four cardinal directions a unit can drop cargo / face, matching the wire `Direction` enum. */
export type BoardDirection = "up" | "down" | "left" | "right";

/** Direction -> `[dx, dy]` offset — the one FE-side table, shared by every direction lookup. */
export const DIRECTION_OFFSET: Record<BoardDirection, BoardPosition> = {
  up: [0, -1],
  down: [0, 1],
  left: [-1, 0],
  right: [1, 0],
};

/** Stable string key for a position (`"x,y"`) — for Map/Set lookups over the board. */
export const posKey = (p: BoardPosition): string => `${p[0]},${p[1]}`;

/** Copy a readonly path into plain mutable `[number, number]` tuples, for wire/mutation call sites. */
export const toMutablePath = (path: readonly (readonly [number, number])[]): [number, number][] =>
  path.map((p) => [p[0], p[1]]);

/**
 * The tile shown at a position — a changeable tile (owned property, silo, pipe seam) wins over the
 * static map tile, mirroring the engine's `getTile`.
 */
export const getTileAt = (
  match: MatchView,
  position: BoardPosition,
): MatchTile | MatchChangeableTile =>
  match.changeableTiles.find((tile) => samePosition(tile.position, position)) ??
  match.map.tiles[position[1]][position[0]];

/** The army of the player in `slot` (for sprite selection); `undefined` for an unknown slot. */
export const getArmyForSlot = (match: MatchView, slot: number): MatchPlayer["army"] | undefined =>
  getPlayerBySlot(match, slot)?.army;

export const isOutOfBounds = (match: MatchView, [x, y]: BoardPosition): boolean =>
  x < 0 || y < 0 || y >= match.map.tiles.length || x >= match.map.tiles[0].length;

export const getUnitAt = (match: MatchView, position: BoardPosition): MatchUnit | undefined =>
  match.units.find((unit) => samePosition(unit.position, position));

export const getPlayerById = (match: MatchView, id: string): MatchPlayer | undefined =>
  match.players.find((player) => player.id === id);

export const getPlayerBySlot = (match: MatchView, slot: number): MatchPlayer | undefined =>
  match.players.find((player) => player.slot === slot);

export const getCurrentTurnPlayer = (match: MatchView): MatchPlayer | undefined =>
  match.players.find((player) => player.hasCurrentTurn === true);

export const isCurrentTurnPlayer = (match: MatchView, playerId: string): boolean =>
  getCurrentTurnPlayer(match)?.id === playerId;

/** True when `player` owns the thing at `playerSlot` (a unit or a property tile). */
export const ownsSlot = (player: MatchPlayer, playerSlot: number): boolean =>
  player.slot === playerSlot;

/**
 * Visual HP (0–10) of a unit. `undefined` for a fog-hidden unit whose stats the viewer can't see —
 * such a unit shows no HP badge.
 */
export const visualHP = (unit: MatchUnit): number | undefined =>
  unit.stats === "hidden" ? undefined : Math.ceil(unit.stats.hp / 10);
