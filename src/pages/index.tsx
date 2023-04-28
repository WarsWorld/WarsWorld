import { MatchRow } from "components/match/MatchRow";
import Link from "next/link";
import { trpc } from "utils/trpc-client";

export default function Index() {
  const { data } = trpc.match.getAll.useQuery();

  return (
    <>
      <h1>WarsWorld</h1>
      <Link href="/your-matches">Your matches</Link>
      <h2>All current games</h2>
      <div>
        {data?.map((match) => (
          <MatchRow key={match.id} match={match} />
        ))}
      </div>
    </>
  );
}
