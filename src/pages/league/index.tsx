interface LeaderBoardProps {
  title: string;
  players: string[];
}

function LeaderBoard({ title, players }: LeaderBoardProps) {
  return (
    <div className="@w-80 @bg-black/70 @rounded-md @py-2">
      <div className="@w-full @text-center">{title}</div>
      <table className="@w-full @text-left">
        <thead>
          <tr>
            <th className="@px-5 @py-2">#</th>
            <th className="@px-5 @py-2">Player</th>
            <th className="@px-5 @py-2">Rating</th>
          </tr>
        </thead>
        <tbody>
          {players.map((player, idx) => (
            <tr key={idx}>
              <td className="@px-5 @py-1">{idx + 1}</td>
              <td className="@px-5 @py-1">{player}</td>
              <td className="@px-5 @py-1">{(idx + 1) * 100}</td>
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
      <div className="@flex @justify-center @items-center @flex-col @max-w-7xl @h-full @border-red-900 @border-4">
        <div>Wars World Global League</div>

        <div>
          <h3>
            The Global League is the premier AWBW competition for players of all
            skill levels:
          </h3>

          <ul className="@list-disc @ml-8">
            <li>Ranked asynchronous 1 vs. 1 matches</li>
            <li>Game mode: Standard</li>
            <li>Automatic game creation</li>
            <li>Matchmaking based on player rating</li>
            <li>Balanced maps and settings</li>
          </ul>
        </div>

        <div className="@flex">
          <LeaderBoard title="Standard" players={demoData()} />
        </div>
      </div>
    </div>
  );
}
