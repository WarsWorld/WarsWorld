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

/** A board coordinate `[x, y]`, matching the wire `Position` tuple. */
export type BoardPosition = readonly [number, number];

export const samePosition = (a: BoardPosition, b: BoardPosition): boolean =>
  a[0] === b[0] && a[1] === b[1];

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
