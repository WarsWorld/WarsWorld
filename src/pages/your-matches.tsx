import { ProtectPage } from "frontend/components/auth/ProtectPage";
import MatchCard from "frontend/components/match/card/MatchCard";
import CreateMatchModal from "frontend/components/match/lobby/CreateMatchModal";
import LobbyRail from "frontend/components/match/lobby/LobbyRail";
import MatchHistoryRow from "frontend/components/match/lobby/MatchHistoryRow";
import type { LobbyMatch, LobbyView } from "frontend/components/match/lobby/match-status";
import {
  VIEW_FILTERS,
  categorizeMatches,
  deriveLobbyStatus,
} from "frontend/components/match/lobby/match-status";
import { usePlayers } from "frontend/context/players";
import { trpc } from "frontend/utils/trpc-client";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

const VIEW_META: Record<LobbyView, { title: string; description: string; empty: string }> = {
  needs: {
    title: "Needs you",
    description: "Matches waiting on your move.",
    empty: "Nothing needs your attention right now — nice.",
  },
  mine: {
    title: "Your matches",
    description: "Everything you're playing right now.",
    empty: "You're not in any active matches. Create one to get started.",
  },
  find: {
    title: "Find a game",
    description: "Open slots waiting for a challenger.",
    empty: "No open matches right now. Create one and wait for a challenger.",
  },
  watch: {
    title: "Spectate live",
    description: "Two-player games in progress.",
    empty: "No live matches to watch at the moment.",
  },
  history: {
    title: "Match history",
    description: "Your completed games.",
    empty: "No completed games yet.",
  },
};

const VIEW_ORDER: LobbyView[] = ["needs", "mine", "find", "watch", "history"];

const isLobbyView = (value: unknown): value is LobbyView =>
  typeof value === "string" && (VIEW_ORDER as string[]).includes(value);

export default function YourMatches() {
  const router = useRouter();
  const { currentPlayer } = usePlayers();
  const [createOpen, setCreateOpen] = useState(false);

  const { data: playerMatches } = trpc.match.getPlayerMatches.useQuery(
    { playerId: currentPlayer?.id ?? "" },
    { enabled: currentPlayer !== undefined },
  );
  const { data: finishedMatches } = trpc.match.getPlayerFinishedMatches.useQuery(
    { playerId: currentPlayer?.id ?? "" },
    { enabled: currentPlayer !== undefined },
  );
  const { data: allMatches } = trpc.match.getAll.useQuery({ pageNumber: 0 });

  const categories = useMemo(
    () => categorizeMatches(playerMatches ?? [], allMatches ?? [], currentPlayer?.id),
    [playerMatches, allMatches, currentPlayer?.id],
  );

  // Finished matches are read from the DB (archived out of the live store). One that just finished
  // this session is still in the in-memory list too, so concat and dedupe by id.
  const history = useMemo(() => {
    const seen = new Set<string>();
    return [...(finishedMatches ?? []), ...categories.history].filter((match) => {
      if (seen.has(match.id)) {
        return false;
      }

      seen.add(match.id);
      return true;
    });
  }, [finishedMatches, categories.history]);

  const counts: Record<LobbyView, number> = {
    needs: categories.needs.length,
    mine: categories.mine.length,
    find: categories.find.length,
    watch: categories.watch.length,
    history: history.length,
  };

  const view: LobbyView = isLobbyView(router.query.view) ? router.query.view : "needs";

  const setView = (next: LobbyView) => {
    void router.push({ query: { ...router.query, view: next } }, undefined, { shallow: true });
  };

  // In-view filter chips (reset whenever the active view changes).
  const filters = VIEW_FILTERS[view];
  const [filterKey, setFilterKey] = useState("all");
  useEffect(() => setFilterKey("all"), [view]);
  const activeFilter = filters?.find((filter) => filter.key === filterKey) ?? filters?.[0];

  const meta = VIEW_META[view];
  const inMatch = view === "needs" || view === "mine";

  function applyFilter<T extends LobbyMatch>(list: T[]): T[] {
    if (activeFilter === undefined) {
      return list;
    }

    const filter = activeFilter;
    return list.filter((match) => filter.accepts(deriveLobbyStatus(match, currentPlayer?.id)));
  }

  const activeMatches = applyFilter(categories[view]);
  const historyMatches = applyFilter(history);

  return (
    <ProtectPage>
      <Head>
        <title>Game Lobby | Wars World</title>
      </Head>

      <div className="@mx-auto @grid @max-w-[1360px] @gap-6 @px-4 @pt-8 @pb-16 laptop:@grid-cols-[248px_1fr]">
        <LobbyRail
          active={view}
          counts={counts}
          onSelect={setView}
          onCreate={() => setCreateOpen(true)}
          playerName={currentPlayer?.name}
        />

        <main className="@min-w-0">
          <header className="@mb-5 @flex @flex-wrap @items-end @justify-between @gap-3 @border-b @border-bg-tertiary @pb-3">
            <div>
              <h1 className="@py-0 @text-3xl @font-semibold @uppercase @tracking-wide">
                {meta.title}
              </h1>
              <p className="@py-0 @text-slate-400">{meta.description}</p>
            </div>
            {filters !== undefined && (
              <div className="@flex @gap-1.5">
                {filters.map((filter) => (
                  <button
                    key={filter.key}
                    onClick={() => setFilterKey(filter.key)}
                    className={`@rounded-lg @border @px-3 @py-1.5 @text-xs @font-semibold @uppercase @tracking-wide @transition ${
                      activeFilter?.key === filter.key
                        ? "@border-primary @bg-bg-secondary @text-white"
                        : "@border-bg-tertiary @text-slate-400 hover:@text-white"
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            )}
          </header>

          {view === "history" ? (
            historyMatches.length === 0 ? (
              <div className="@rounded-lg @border @border-dashed @border-bg-tertiary @p-8 @text-center @text-slate-500">
                {history.length > 0 ? "No matches for this filter." : meta.empty}
              </div>
            ) : (
              <div className="@flex @flex-col @gap-2">
                {historyMatches.map((match) => (
                  <MatchHistoryRow key={match.id} match={match} playerId={currentPlayer?.id} />
                ))}
              </div>
            )
          ) : activeMatches.length === 0 ? (
            <div className="@rounded-lg @border @border-dashed @border-bg-tertiary @p-8 @text-center @text-slate-500">
              {categories[view].length > 0 ? "No matches for this filter." : meta.empty}
            </div>
          ) : (
            <div className="@grid @gap-4 laptop:@grid-cols-2 monitor:@grid-cols-3">
              {activeMatches.map((match) => (
                <MatchCard key={match.id} match={match} inMatch={inMatch} />
              ))}
            </div>
          )}
        </main>
      </div>

      <CreateMatchModal isOpen={createOpen} onClose={() => setCreateOpen(false)} />
    </ProtectPage>
  );
}
