import MatchCardTop from "./MatchCardTop";
import MatchPlayer from "./MatchPlayer";
import { FrontendMatch } from "../../../../shared/types/component-data";
import { CO, coSchema } from "../../../../server/schemas/co";
import { armySchema } from "../../../../server/schemas/army";
import MatchCardSetup from "./MatchCardSetup";
import { useState } from "react";

interface matchData {
  match: FrontendMatch;
}

export default function MatchCard({ match }: matchData) {
  const [playerCO, setPlayerCO] = useState(match.players[0].co);

  function changeCO (newCO: CO) {
    setPlayerCO(newCO);
  }
  let twoPlayerCheck = false;
  if (match.players[1]) twoPlayerCheck = true;

  return (
    <div className="@grid @bg-bg-primary @relative">
      <MatchCardTop
        mapName={match.map.name}
        day={match.turn}
        state={match.state}
        favorites={0}
        spectators={0}
        time={0.15}
      />
      <div className="@grid @grid-cols-2 @gap-3">
        <MatchPlayer
          name={match.players[0].playerId}
          co={playerCO}
          country={match.players[0].army}
        />
        {twoPlayerCheck ? (
          <MatchPlayer
            name={match.players[1].playerId}
            co={match.players[1].co}
            country={match.players[1].army}
            flipCO={true}
          />
        ) : (
          <MatchPlayer
            name={"Opponent"}
            co={
              coSchema._def.values[
                Math.floor(Math.random() * coSchema._def.values.length)
              ]
            }
            country={
              armySchema._def.values[
                Math.floor(Math.random() * armySchema._def.values.length)
              ]
            }
            flipCO={true}
            opponent={true}
          />
        )}
      </div>
      <MatchCardSetup functionCO={changeCO} matchID={match.id} playerID={match.players[0].playerId} />
    </div>
  );
}
