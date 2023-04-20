import { Match } from '@prisma/client';
import Link from 'next/link';
import { trpc } from 'utils/trpc';

const MatchRow = ({ match }: { match: Match }) => {
  return (
    <div
      style={{
        padding: '0.2rem',
        border: '2px solid black',
      }}
    >
      <Link href={`/match-pixi/${match.id}`}>Match: {match.id}</Link>
    </div>
  );
};

export default function Games() {
  const { data, refetch } = trpc.match.getAll.useQuery();
  const createMutation = trpc.match.create.useMutation();

  return (
    <div>
      <h1>Current games</h1>
      <button
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
      {data === undefined
        ? 'Loading...'
        : data.map((match) => <MatchRow key={match.id} match={match} />)}
    </div>
  );
}
