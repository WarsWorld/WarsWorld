/**
 * Lobby status derivation — pure, viewer-aware, and decoupled from the engine.
 *
 * The frontend never runs game rules; it only labels a match from the current player's point of
 * view using data the backend already puts on each `FrontendMatch` (`hasCurrentTurn`, per-player
 * `status`, the derived `finished` flag). Types here are intentionally structural so this file
 * imports nothing from `shared/` or the server — see src/frontend/CLAUDE.md.
 */

export type LobbyStatusKind =
  | "your-turn"
  | "their-turn"
  | "setup"
  | "victory"
  | "defeat"
  | "draw"
  | "live"
  | "open"
  | "completed";

export type LobbyView = "needs" | "mine" | "find" | "watch" | "history";

type LobbyPlayer = {
  id: string;
  ready?: boolean;
  hasCurrentTurn?: boolean;
  status?: "alive" | "routed" | "captured";
};

export type LobbyMatch = {
  id: string;
  map: { numberOfPlayers: number };
  players: LobbyPlayer[];
  state: string;
  turn: number;
  finished?: boolean;
};

export const isFinished = (match: LobbyMatch): boolean =>
  match.finished === true || match.state === "finished";

export const viewerOf = (
  match: LobbyMatch,
  playerId: string | undefined,
): LobbyPlayer | undefined =>
  playerId === undefined ? undefined : match.players.find((player) => player.id === playerId);

export const openSlots = (match: LobbyMatch): number =>
  Math.max(0, match.map.numberOfPlayers - match.players.length);

export const isFull = (match: LobbyMatch): boolean => openSlots(match) === 0;

/** The single status a card shows, from `playerId`'s perspective. */
export function deriveLobbyStatus(
  match: LobbyMatch,
  playerId: string | undefined,
): LobbyStatusKind {
  const viewer = viewerOf(match, playerId);

  if (viewer !== undefined) {
    if (isFinished(match)) {
      // A draw is what the BE's game-over derivation reports as no winning team (winnerTeamIndex
      // null) — e.g. a simultaneous double-elimination: the match is finished with nobody still
      // "alive". Detect the same way here so the lobby doesn't mislabel a draw as a defeat.
      const anyoneAlive = match.players.some((player) => player.status === "alive");

      if (!anyoneAlive) {
        return "draw";
      }

      return viewer.status === "routed" || viewer.status === "captured" ? "defeat" : "victory";
    }

    if (match.state === "setup") {
      return "setup";
    }

    return viewer.hasCurrentTurn === true ? "your-turn" : "their-turn";
  }

  if (isFinished(match)) {
    return "completed";
  }

  if (match.state === "setup" && openSlots(match) > 0) {
    return "open";
  }

  return "live";
}

/** Split the raw match lists into the five lobby views (preserving the caller's match type). */
export function categorizeMatches<T extends LobbyMatch>(
  playerMatches: T[],
  allMatches: T[],
  playerId: string | undefined,
): Record<LobbyView, T[]> {
  const needs: T[] = [];
  const mine: T[] = [];
  const history: T[] = [];

  for (const match of playerMatches) {
    if (isFinished(match)) {
      history.push(match);
      continue;
    }

    mine.push(match);

    const viewer = viewerOf(match, playerId);
    const awaitingMove = match.state !== "setup" && viewer?.hasCurrentTurn === true;
    const awaitingReady = match.state === "setup" && viewer?.ready !== true;

    if (awaitingMove || awaitingReady) {
      needs.push(match);
    }
  }

  const ownIds = new Set(playerMatches.map((match) => match.id));
  const find: T[] = [];
  const watch: T[] = [];

  for (const match of allMatches) {
    if (ownIds.has(match.id) || isFinished(match)) {
      continue;
    }

    if (match.state === "setup" && openSlots(match) > 0) {
      find.push(match);
    } else if (isFull(match)) {
      watch.push(match);
    }
  }

  return { needs, mine, find, watch, history };
}

/**
 * Presentation for each status: a headline pill and the matching left stripe. Classes are spelled
 * literally so Tailwind's JIT keeps them (the `@` prefix is this project's Tailwind prefix).
 */
export const STATUS_META: Record<
  LobbyStatusKind,
  { label: string; pill: string; stripe: string; pulse?: boolean }
> = {
  "your-turn": {
    label: "Your turn",
    pill: "@bg-amber-400 @text-black",
    stripe: "@bg-amber-400",
    pulse: true,
  },
  "their-turn": {
    label: "Their turn",
    pill: "@bg-bg-tertiary @text-slate-200",
    stripe: "@bg-slate-500",
  },
  setup: { label: "Setup", pill: "@bg-yellow-500 @text-black", stripe: "@bg-yellow-500" },
  victory: {
    label: "Victory",
    pill: "@bg-emerald-600 @text-emerald-50",
    stripe: "@bg-emerald-500",
  },
  defeat: { label: "Defeat", pill: "@bg-red-800 @text-red-100", stripe: "@bg-red-600" },
  draw: { label: "Draw", pill: "@bg-slate-500 @text-slate-100", stripe: "@bg-slate-400" },
  live: {
    label: "Live",
    pill: "@bg-bg-match-live @text-red-100",
    stripe: "@bg-match-live-dot",
    pulse: true,
  },
  open: { label: "Open slot", pill: "@bg-primary @text-black", stripe: "@bg-primary" },
  completed: { label: "Completed", pill: "@bg-slate-600 @text-slate-100", stripe: "@bg-slate-500" },
};

/** In-view filter chips. Each chip keeps only the matches whose derived status it accepts. */
export type LobbyFilter = {
  key: string;
  label: string;
  accepts: (kind: LobbyStatusKind) => boolean;
};

export const VIEW_FILTERS: Partial<Record<LobbyView, LobbyFilter[]>> = {
  mine: [
    { key: "all", label: "All", accepts: () => true },
    { key: "your-turn", label: "Your turn", accepts: (kind) => kind === "your-turn" },
    { key: "waiting", label: "Waiting", accepts: (kind) => kind === "their-turn" },
    { key: "setup", label: "Setup", accepts: (kind) => kind === "setup" },
  ],
  history: [
    { key: "all", label: "All", accepts: () => true },
    { key: "wins", label: "Wins", accepts: (kind) => kind === "victory" },
    { key: "losses", label: "Losses", accepts: (kind) => kind === "defeat" },
  ],
};

export type MatchActionVariant = "turn" | "primary" | "ghost";

/**
 * The single next step for a card's footer, or `null` when there's no board to open — either the
 * card's own setup controls (join / ready / leave) provide the action, or the match is finished.
 *
 * Finished matches are archived out of the live match store, so the board (`/match2/{id}`) returns
 * NOT_FOUND for them: no link until replay/archived viewing exists. Live matches are spectatable by
 * anyone (the match middleware has no membership gate).
 */
export function matchAction(
  kind: LobbyStatusKind,
): { label: string; variant: MatchActionVariant } | null {
  switch (kind) {
    case "your-turn":
      return { label: "Play turn", variant: "turn" };
    case "their-turn":
      return { label: "Enter match", variant: "ghost" };
    case "live":
      return { label: "Spectate", variant: "ghost" };
    default:
      // setup / open → handled by setup controls; victory / defeat / draw / completed → not openable yet.
      return null;
  }
}
