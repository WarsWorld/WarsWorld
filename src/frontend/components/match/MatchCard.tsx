import MatchCardTop from "./MatchCardTop";
import MatchPlayer from "./MatchPlayer";
import type { FrontendMatch } from "shared/types/component-data";
import { coSchema } from "shared/schemas/co";
import { armySchema } from "shared/schemas/army";
import MatchCardSetup from "./MatchCardSetup";
import React, { useState } from "react";
import { usePlayers } from "frontend/context/players";
import Link from "next/link";

type matchData = {
  match: FrontendMatch;
  inMatch: boolean;
};

export default function MatchCard({ match, inMatch }: matchData) {
  const { currentPlayer } = usePlayers();

  let firstPlayer;
  let playerIndex;
  let secondPlayer;

  if (currentPlayer != undefined) {
    match.players.forEach((player, index) => {
      if (player.id == currentPlayer.id) {
        firstPlayer = player;
        playerIndex = index;
      }
    });
  }

  if (firstPlayer === undefined) {
    firstPlayer = match.players[0];
    secondPlayer = match.players[1];
  } else {
    playerIndex === 0 ? (secondPlayer = match.players[1]) : (secondPlayer = match.players[0]);
  }

  const [playerCO, setPlayerCO] = useState(firstPlayer.coId);
  const [army, setArmy] = useState(firstPlayer.army);

  const [ready, setReady] = useState(firstPlayer.ready);

  //this function can change co, army or status (ready/not ready)
  // it is purely visual
  const setupActions = {
    setPlayerCO,
    setArmy,
    setReady,
  };

  let twoPlayerCheck = false;

  if (secondPlayer !== undefined) {
    twoPlayerCheck = true;
  }

  return (
    <div className="@grid @bg-bg-primary @relative">
      <MatchCardTop mapName={match.map.name} day={match.turn} state={match.state} favorites={0} spectators={0} time={0.15} />
      <div className="@grid @grid-cols-2 @gap-3">
        <MatchPlayer
          name={firstPlayer.name}
          co={playerCO}
          country={army}
          playerReady={ready}
        />
        {twoPlayerCheck ? (
          <MatchPlayer
            name={secondPlayer.name}
            co={{ name: secondPlayer.coId.name, version: "AW2" }}
            country={secondPlayer.army}
            flipCO={true}
            playerReady={secondPlayer.ready}
          />
        ) : (
          <MatchPlayer
            name={"Opponent"}
            co={{ name: coSchema._def.values[Math.floor(Math.random() * coSchema._def.values.length)] , version: "AW2"}}
            country={armySchema._def.values[Math.floor(Math.random() * armySchema._def.values.length)]}
            flipCO={true}
            opponent={true}
            playerReady={true}
          />
        )}
      </div>
      {
        // if we are not in the match AND the match is full, we can't alter setup in anyway or form
        (!inMatch && match.players.length == 2) || match.state != "setup" ? (
          ""
        ) : (
          <MatchCardSetup
            setupActions={setupActions}
            matchID={match.id}
            // TODO: how can we handle if a player is undefined? for now I put an empty string
            playerID={currentPlayer ? currentPlayer.id : ""}
            inMatch={inMatch}
            readyStatus={ready ?? false}
          />
        )
      }

      {match.state != "setup" && match.players.length == 2 ? (
        <Link href={`/match/${match.id}`} className="btnMenu @inline-block">
          {" "}
          Enter Match
        </Link>
      ) : !inMatch && match.players.length == 2 ? (
        <div>{"Match hasn't started yet."}</div>
      ) : (
        <div></div>
      )}
    </div>
  );
}
