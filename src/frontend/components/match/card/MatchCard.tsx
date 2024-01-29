import MatchCardTop from "./MatchCardTop";
import MatchPlayer from "../MatchPlayer";
import type { FrontendMatch } from "shared/types/component-data";
import { coSchema } from "shared/schemas/co";
import { armySchema } from "shared/schemas/army";
import MatchCardSetup from "./MatchCardSetup";
import React, { useEffect, useState } from "react";
import { usePlayers } from "frontend/context/players";
import Link from "next/link";
import type { PlayerInMatch } from "shared/types/server-match-state";

type matchData = {
  match: FrontendMatch;
  inMatch: boolean;
};

export default function MatchCard({ match, inMatch }: matchData) {
  const { currentPlayer } = usePlayers();

  let firstPlayer: PlayerInMatch | undefined;
  let playerIndex;
  let secondPlayer: PlayerInMatch | undefined;

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

  //this function can change co, army or status (ready/not ready)
  // it is purely visual
  const [currentPlayerOptions, setCurrentPlayerOptions] = useState({
    CO: firstPlayer.coId,
    army: firstPlayer.army,
    ready: firstPlayer.ready,
    slot: firstPlayer.slot,
  });
  const [selectedOptions, setSelectedOptions] = useState({
    selectedArmies: match.players.map((player) => player.army),
    selectedSlots: match.players.map((player) => player.slot),
  });

  let twoPlayerCheck = false;

  if (secondPlayer !== undefined) {
    twoPlayerCheck = true;
  }

  useEffect(() => {
    if (firstPlayer) {
      setCurrentPlayerOptions({
        CO: firstPlayer.coId,
        army: firstPlayer.army,
        ready: firstPlayer.ready,
        slot: firstPlayer.slot,
      });
    }
  }, [firstPlayer]);

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
          name={firstPlayer.name}
          co={currentPlayerOptions.CO}
          country={currentPlayerOptions.army}
          playerReady={currentPlayerOptions.ready}
          slot={currentPlayerOptions.slot}
        />
        {twoPlayerCheck ? (
          <MatchPlayer
            name={secondPlayer.name}
            co={{ name: secondPlayer.coId.name, version: "AW2" }}
            country={secondPlayer.army}
            flipCO={true}
            playerReady={secondPlayer.ready}
            slot={secondPlayer.slot}
          />
        ) : (
          <MatchPlayer
            name={"Opponent"}
            co={{
              name: coSchema._def.values[Math.floor(Math.random() * coSchema._def.values.length)],
              version: "AW2",
            }}
            country={
              armySchema._def.values[Math.floor(Math.random() * armySchema._def.values.length)]
            }
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
            setCurrentPlayerOptions={setCurrentPlayerOptions}
            matchID={match.id}
            // TODO: how can we handle if a player is undefined? for now I put an empty string
            playerID={currentPlayer ? currentPlayer.id : ""}
            inMatch={inMatch}
            readyStatus={currentPlayerOptions.ready ?? false}
            selectedOptions={selectedOptions}
            setSelectedOptions={setSelectedOptions}
            maxNumberOfPlayers={match.map.numberOfPlayers}
          />
        )
      }

      {match.state != "setup" && match.players.length == 2 ? (
        <Link href={`/match2/${match.id}`} className="btnMenu @inline-block">
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
