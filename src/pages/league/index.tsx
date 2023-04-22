interface LeaderBoardProps {
  title: string;
  players: string[];
}

function LeaderBoard({ title, players }: LeaderBoardProps) {
  return (
    <div className="@w-80 @border-blue-900 @border-4">
      <div>{title}</div>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Player</th>
            <th>Rating</th>
          </tr>
        </thead>
        <tbody>
          {players.map((player, idx) => (
            <tr key={idx}>
              <td>{idx + 1}</td>
              <td>{player}</td>
              <td>{(idx + 1) * 100}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function LeaguePage() {
  // THIS IS TEMP
  const demoData = () => {
    const arr = [];
    for (let i = 1; i < 10; i++) {
      arr.push(`player ${i}`);
    }

    return arr;
  };

  return (
    <div className="@h-screen @w-full @flex @justify-center @items-center">
      <div className="@flex @justify-center @items-center @flex-col @max-w-6xl @h-full @border-red-900 @border-4">
        <div>Wars World Global League</div>

        <div className="@flex">
          <LeaderBoard title="Standard" players={demoData()} />
          <LeaderBoard title="Fog of War" players={demoData()} />
          <LeaderBoard title="High Funds" players={demoData()} />
        </div>
      </div>
    </div>
  );
}
