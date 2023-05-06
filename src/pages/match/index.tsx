import { Match } from '@prisma/client';
import { Layout } from 'components/layout';
import Link from 'next/link';
import { trpc } from 'utils/trpc';

const MatchRow = ({ match }: { match: Match }) => {
  // FIXME: fix the matchState type
  const { mapMetaData, mapTiles } = match.matchState as any;

  return (
    <div className="@grid @grid-rows-[1fr_3fr] @p-2 @mb-10 matchRowGrid @outline @outline-black @outline-2">
      <ul className="@flex @flex-col @justify-center @text-center">
        <li className="matchInfo">Created by: {mapMetaData.author}</li>
        <li className="matchInfo">Date created: {mapMetaData.published}</li>
        <li className="matchInfo">Map name: {mapMetaData.mapName}</li>
        <li className="matchInfo">Number of players: {mapMetaData.players}</li>
        <li className="matchInfo">Player 1 vs. Player 2</li>
      </ul>
      <div className="@flex @flex-col @items-center @justify-center">
        <Link
          className="@bg-gray-800 @p-2 @rounded-lg"
          href={`/match/${match.id}`}
        >
          {' '}
          Enter the Match
        </Link>
        <div className="@h-[70vw] @max-h-[350px] @m-3 @bg-green-700 @aspect-square @outline @outline-black @outline-2">
          Placeholder
        </div>
      </div>
    </div>
  );
};

export default function Games() {
  const { data, refetch } = trpc.match.getAll.useQuery();
  const createMutation = trpc.match.create.useMutation();

  return (
    <Layout>
      <div className="@h-full @w-full @max-w-[1200px] @p-5 @grid @grid-rows-[1fr_1fr] @gap-10 allGames">
        <div id="currentGames" className="currentGames">
          <div className="@flex @flex-col @items-center @justify-center @mb-10 @gap-2">
            <h1>Current games</h1>
            <button
              className="@flex @items-center @justify-center @h-6 @p-2 @font-bold @bg-slate-300 @rounded @text-gray-700 createGameBtn"
              onClick={async () => {
                await createMutation.mutateAsync({
                  playerName: 'function',
                  selectedCO: 'sami',
                });
                refetch();
              }}
            >
              Create game
            </button>
          </div>
          {data === undefined
            ? 'Loading...'
            : data.map((match) => {
                return (
                  match.status === 'playing' && (
                    <MatchRow key={match.id} match={match} />
                  )
                );
              })}
        </div>
        <div id="completedGames" className="completedGames">
          <h1 className="@text-center">Completed games</h1>
          {data === undefined
            ? 'Loading...'
            : data.map((match) => {
                return (
                  match.status !== 'playing' && (
                    <MatchRow key={match.id} match={match} />
                  )
                );
              })}
        </div>
      </div>
    </Layout>
  );
}
