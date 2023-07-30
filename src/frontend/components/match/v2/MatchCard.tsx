import MatchCardTop from "./MatchCardTop";
import MatchPlayer from "./MatchPlayer";
import { FrontendMatch } from "../../../../shared/types/component-data";
import { CO, coSchema } from "../../../../server/schemas/co";
import { Army, armySchema } from "../../../../server/schemas/army";
import MatchCardSetup from "./MatchCardSetup";
import React, { useState } from "react";
import { usePlayers } from "../../../context/players";
import { fi } from "@faker-js/faker";
import Link from "next/link";
import { MatchStatus } from "@prisma/client";

interface matchData {
  match: FrontendMatch;
  inMatch: boolean;
}

export default function MatchCard({ match, inMatch }: matchData) {
  const { currentPlayer, setCurrentPlayer, ownedPlayers } = usePlayers();

  let firstPlayer;
  let playerIndex;
  let secondPlayer;

  if (currentPlayer != undefined) {
    match.players.forEach((player, index) => {
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

  const [playerCO, setPlayerCO] = useState(firstPlayer.co);
  const [army, setArmy] = useState(firstPlayer.army);

  const [ready, setReady] = useState(firstPlayer.ready);

  function changeCO(newCO: CO, army: Army, status: boolean) {
    if (newCO) setPlayerCO(newCO);
    if (army) setArmy(army);
    if (status != null) setReady(status);
  }

  let twoPlayerCheck = false;
  if (secondPlayer) twoPlayerCheck = true;

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
        <MatchPlayer name={firstPlayer.playerId} co={playerCO} country={army} playerReady={ready}/>
        {twoPlayerCheck ? (
          <MatchPlayer
            name={secondPlayer.playerId}
            co={secondPlayer.co}
            country={secondPlayer.army}
            flipCO={true}
            playerReady={secondPlayer.ready}
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
            playerReady={true}
          />
        )}
      </div>
      {
        // if we are not in the match AND the match is full, we can't alter setup in anyway or form
        !inMatch && match.players.length == 2 || match.state != "setup" ? (
          ""
        ) : (
          <MatchCardSetup
            functionCO={changeCO}
            matchID={match.id}
            playerID={currentPlayer.id}
            inMatch={inMatch}
            readyStatus={ready}
          />
        )
      }

      {match.state != "setup" && match.players.length == 2 ?
        <Link href={`/match/${match.id}`}
              className="btnMenu @inline-block"
        > Enter Match
        </Link>
      : !inMatch && match.players.length == 2  ? <div>{"Match hasn't started yet."}</div> : <div></div>

      }

    </div>
  );
}
