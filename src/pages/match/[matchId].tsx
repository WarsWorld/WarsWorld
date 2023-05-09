import { Layout } from "components/layout";
import Head from "next/head";
import { useState } from "react";
// Might keep useMediaQuery hook for conditional rendering of playerBox layout
import { IngameInfo } from "components/IngameInfo";
import { useMediaQuery } from "frontend/utils/useMediaQuery";

interface Props {
  playerTurn: boolean;
  playerInMatch: any;
}

const nationColorGradients: Record<string, string> = {
  blue: "@bg-gradient-to-l @from-blue-400",
  orange: "@bg-gradient-to-l @from-orange-400",
  green: "@bg-gradient-to-l @from-green-400",
  yellow: "@bg-gradient-to-l @from-yellow-400",
};

const PlayerBox = ({ playerTurn, playerInMatch: playerInMatch }: Props) => {
  const time = new Date(0);
  time.setSeconds(playerInMatch.timePlayed ?? 1);

  return (
    <div className="@relative @z-25 playerBox">
      <div className="@flex @flex-row playerCOAndNationBox">
        <div
          className={`@relative @h-[100px] @aspect-square @outline @outline-2 @outline-black ${
            nationColorGradients[playerInMatch.color]
          } playerCOBox`}
        >
          <img
            className={`@absolute @bottom-0 @h-[120px] @w-full @aspect-square @object-none @object-left-top playerCOIcon ${
              playerTurn ? "" : "isNotPlayerTurn"
            }`}
            src={`/img/CO/${playerInMatch.co}-Full.png`}
          />
          <img
            className="@absolute @h-8 @top-1 @right-1 @bg-slate-200"
            src={`/img/nations/${playerInMatch.nation}.webp`}
          />
        </div>
        <div className="@text-white @w-full playerNationBox">
          <div className="playerUsernameAndIngameStats">
            <div className="@flex @items-center @bg-stone-900 @py-1 @px-3 @outline @outline-2 @outline-black playerUsername">
              {playerInMatch.username}
            </div>
            <div className="@flex @items-center @justify-center @bg-stone-900 @p-1 @outline @outline-2 @outline-black playerExp">
              Placeholder for an exp bar
            </div>
            <div className="@flex @flex-row @flex-wrap @w-full playerIngameInfo">
              <IngameInfo
                ingameStatIconPath=""
                ingameStat={time.toISOString().substring(11, 19)}
              />
              <IngameInfo
                ingameStatIconPath={`/img/units/${playerInMatch.nation}/Infantry-0.png`}
                ingameStat={999}
              />
              <IngameInfo
                ingameStatIconPath="/img/mapTiles/countries/city/ne1.webp"
                ingameStat={999999}
              />
              <IngameInfo ingameStatIconPath="" ingameStat={999999} />
              <IngameInfo ingameStatIconPath="" ingameStat={999999} />
              {/* <IngameInfo
                statsIconPath="Time"
                ingameStat={time.toISOString().substring(11, 19)}
              />
              <IngameInfo statsIconPath="Units" ingameStat={playerInMatch.unitCount} />
              <IngameInfo statsIconPath="Income" ingameStat={playerInMatch.properties} />
              <IngameInfo statsIconPath="Gold" ingameStat={playerInMatch.gold} />
              <IngameInfo
                statsIconPath="Army-Value"
                ingameStat={playerInMatch.properties * 1000}
              /> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Match() {
  const [players] = useState<any | null | undefined>(null);
  const [segments] = useState<unknown[] | null | undefined>(null);
  // Might keep useMediaQuery hook for conditional rendering of playerBox layout
  const notSmallScreen = useMediaQuery("(min-width: 768px)");

  // Original functionality for turn
  // const turn = 2;

  // const isTurn = (army: Army) => {
  //   switch (army) {
  //     case 'orangeStar':
  //       return turn % 2 === 0;
  //     case 'blueMoon':
  //       return turn % 2 === 1;
  //     case null:
  //       return false;
  //   }
  // };

  const [turn, setTurn] = useState(true);

  const passTurn = () => {
    // mock function for testing css transition
    setTurn(!turn);
  };

  if (players == null || segments == null) {
    return "Loading..";
  }

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Layout>
        <div className="@flex @flex-col @items-center @justify-center @h-full @w-full @gap-0 gameBoxContainer">
          <div className="@flex @flex-col @items-center @justify-center @gap-1 @w-full gameBox">
            {/* <h1>Match #{matchId}</h1> */}
            {notSmallScreen ? (
              <PlayerBox playerTurn={turn} playerInMatch={players.orangeStar} />
            ) : (
              <div className="@w-full">
                <PlayerBox
                  playerTurn={turn}
                  playerInMatch={players.orangeStar}
                />
                <PlayerBox
                  playerTurn={!turn}
                  playerInMatch={players.blueMoon}
                />
              </div>
            )}
            <div className="@flex @flex-col @items-center @justify-center @gap-1 gameInnerBox">
              <div className="gridSize18 mapGrid"></div>
            </div>
            {notSmallScreen && (
              <PlayerBox playerTurn={!turn} playerInMatch={players.blueMoon} />
            )}
          </div>
          <div className="@flex @items-center @justify-center gameTime">
            <p className="@py-2">00:00:00</p>
            <button
              className="@text-black @rounded-lg @bg-stone-200"
              onClick={passTurn}
            >
              Pass turn
            </button>
          </div>
        </div>
      </Layout>
    </>
  );
}
