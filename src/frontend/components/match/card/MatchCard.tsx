import { usePlayers } from "frontend/context/players";
import Link from "next/link";
import { useEffect, useState } from "react";
import { armySchema } from "shared/schemas/army";
import { coSchema } from "shared/schemas/co";
import type { FrontendMatch } from "shared/types/component-data";
import type { PlayerInMatch } from "shared/types/server-match-state";
import MatchStatusBadge from "../lobby/MatchStatusBadge";
import type { MatchActionVariant } from "../lobby/match-status";
import { STATUS_META, deriveLobbyStatus, matchAction, openSlots } from "../lobby/match-status";
import MatchCardSetup from "./MatchCardSetup";
import MatchCardTop from "./MatchCardTop";
import MatchPlayer from "./MatchPlayer";

type matchData = {
  match: FrontendMatch;
  inMatch: boolean;
};

const ACTION_VARIANTS: Record<MatchActionVariant, string> = {
  turn: "@bg-amber-400 @text-black hover:@bg-amber-300",
  primary: "@bg-primary @text-black hover:@bg-primary-light",
  ghost: "@bg-bg-tertiary @text-white hover:@bg-primary-light hover:@text-black",
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

  const status = deriveLobbyStatus(match, currentPlayer?.id);
  const action = matchAction(status);
  // Setup / open cards drive their action through the join / ready / leave controls below.
  const showSetup = (inMatch || openSlots(match) > 0) && match.state == "setup";

  return (
    <div className="@relative @grid @overflow-hidden @rounded-lg @bg-bg-primary @outline @outline-2 @outline-black">
      <div
        className={`@absolute @left-0 @top-0 @bottom-0 @z-20 @w-1 ${STATUS_META[status].stripe}`}
      />

      <MatchCardTop
        mapName={match.map.name}
        day={match.turn}
        state={match.state}
        favorites={0}
        spectators={0}
        time={0.15}
        statusBadge={<MatchStatusBadge kind={status} />}
      />
      <div className="@grid @grid-cols-2 @gap-3 @p-2">
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

      {showSetup && (
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
      )}

      {action !== null && (
        <div className="@flex @items-center @justify-end @gap-2 @px-3 @py-2">
          <Link
            href={`/match2/${match.id}`}
            className={`@inline-block @rounded @px-3 @py-1 @text-sm @font-semibold @transition ${ACTION_VARIANTS[action.variant]}`}
          >
            {action.label}
          </Link>
        </div>
      )}
    </div>
  );
}
