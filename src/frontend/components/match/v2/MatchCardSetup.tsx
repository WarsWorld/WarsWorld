import { useState } from "react";
import { armySchema } from "shared/schemas/army";
import { coSchema } from "shared/schemas/co";
import { trpc } from "frontend/utils/trpc-client";
import type { Match, Player } from "@prisma/client";

interface matchData {
  playerID: Player["id"];
  matchID: Match["id"];
  functionCO: any;
  inMatch: boolean;
  readyStatus: boolean;
}

export default function MatchCardSetup({
  playerID,
  matchID,
  functionCO,
  inMatch,
  readyStatus,
}: matchData) {
  const switchCO = trpc.match.switchCO.useMutation();
  const switchArmy = trpc.match.switchArmy.useMutation();
  const joinMatch = trpc.match.join.useMutation();
  const readyMatch = trpc.match.setReady.useMutation();
  const [showCO, setShowCO] = useState(false);
  const [showArmy, setShowArmy] = useState(false);

  if (inMatch) {
    return (
      <div className="@flex  ">
        <div>
          <button
            className="btnMenu"
            onClick={() => {
              setShowArmy(false);
              setShowCO(!showCO);
            }}
          >
            Switch CO
          </button>
          {showCO ? (
            <div className="@grid @grid-cols-4 @absolute  @z-10  @bg-bg-tertiary @outline-black @outline-2 @gap-2">
              {coSchema._def.values.map((co) => {
                return (
                  <div
                    onClick={async () => {
                      await switchCO.mutateAsync({
                        selectedCO: co,
                        matchId: matchID,
                        playerId: playerID,
                      });
                      functionCO(co);
                      setShowCO(false);
                    }}
                    key={co}
                    className={`@flex @items-center @p-1 @bg-bg-primary hover:@bg-primary @cursor-pointer @duration-300`}
                  >
                    <img
                      src={`/img/CO/pixelated/${co}-small.png`}
                      className="[image-rendering:pixelated]"
                      alt=""
                    />
                    <p className="@capitalize @text-xs @px-1">{co}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <></>
          )}
        </div>

        <div>
          <button
            className=" btnMenu"
            onClick={() => {
              setShowCO(false);
              setShowArmy(!showArmy);
            }}
          >
            Switch Army
          </button>
          {showArmy ? (
            <div className="@grid @grid-cols-2 @absolute  @z-10  @bg-bg-tertiary @outline-black @outline-2 @gap-2">
              {armySchema._def.values.map((army) => {
                return (
                  <div
                    onClick={async () => {
                      await switchArmy.mutateAsync({
                        matchId: matchID,
                        playerId: playerID,
                        selectedArmy: army,
                      });
                      functionCO(null, army);
                      setShowArmy(false);
                    }}
                    key={army}
                    className={`@flex @items-center @p-1 @bg-bg-primary hover:@bg-primary @cursor-pointer @duration-300`}
                  >
                    <img
                      src={`/img/nations/${army}.gif`}
                      className="[image-rendering:pixelated]"
                      alt=""
                    />
                    <p className="@capitalize @text-xs @px-1">{army}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <></>
          )}
        </div>
        <div>
          <button
            className=" btnMenu"
            onClick={async () => {
              await readyMatch.mutateAsync({
                matchId: matchID,
                playerId: playerID,
                readyState: !readyStatus,
              });
              functionCO(null, null, !readyStatus);
              location.href = location.href;
            }}
          >
            {readyStatus ? "Unready" : "Ready up"}
          </button>
        </div>
      </div>
    );
  }
  // Not part of the game, can't change CO or Army or Ready
  else {
    return (
      <div className="@flex  ">
        <div>
          <button
            className=" btnMenu"
            onClick={async () => {
              await joinMatch.mutateAsync({
                matchId: matchID,
                playerId: playerID,
                selectedCO: "sami",
              });
              //lets reload the page
              location.href = location.href;
            }}
          >
            Join Game
          </button>
        </div>
      </div>
    );
  }
}
