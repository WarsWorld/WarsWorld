import MatchCardTop from "./MatchCardTop";
import MatchPlayer from "./MatchPlayer";
import { FrontendMatch } from "../../../../shared/types/component-data";
import { CO, coSchema } from "../../../../server/schemas/co";
import { Army, armySchema } from "../../../../server/schemas/army";
import MatchCardSetup from "./MatchCardSetup";
import { useState } from "react";
import { usePlayers } from "../../../context/players";
import { fi } from "@faker-js/faker";

interface matchData {
  match: FrontendMatch;
  inMatch: boolean;
}

export default function MatchCard({ match, inMatch}: matchData) {
  const { currentPlayer, setCurrentPlayer, ownedPlayers } = usePlayers();
  /*console.log(currentPlayer);
  console.log(ownedPlayers);*/

  let firstPlayer;
  let playerIndex;
  let secondPlayer;

  if (currentPlayer != undefined) {
    match.players.forEach((player, index) => {
      console.log("PLAYERRR");
      console.log(player);
      console.log(currentPlayer);
      if (player.playerId == currentPlayer.id) {
        firstPlayer = player;
        playerIndex = index;
      }
    });
  }
  if (firstPlayer === undefined) {
    firstPlayer = match.players[0];
    secondPlayer = match.players[1];
  } else {
    playerIndex === 0
      ? (secondPlayer = match.players[1])
      : (secondPlayer = match.players[0]);
  }

  console.log(firstPlayer);
  console.log(secondPlayer);
  console.log("banana");
  console.log(match.players);
  const [playerCO, setPlayerCO] = useState(firstPlayer.co);
  const [army, setArmy] = useState(firstPlayer.army);

  function changeCO(newCO: CO, army: Army) {
    if (newCO) setPlayerCO(newCO);
    if (army) setArmy(army);
  }

  let twoPlayerCheck = false;
  if (secondPlayer) twoPlayerCheck = true;

  //TODO: Match the currentPlayers id to the id of a player in the match,
  // if it matches, set them as first player,
  // otherwise, just use regular order

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
        <MatchPlayer name={firstPlayer.playerId} co={playerCO} country={army} />
        {twoPlayerCheck ? (
          <MatchPlayer
            name={secondPlayer.playerId}
            co={secondPlayer.co}
            country={secondPlayer.army}
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
      <MatchCardSetup
        functionCO={changeCO}
        matchID={match.id}
        playerID={currentPlayer.id}
        inMatch={inMatch}
      />
    </div>
  );
}
