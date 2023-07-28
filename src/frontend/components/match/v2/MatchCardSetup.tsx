import React, { useState } from "react";
import { CO, coSchema } from "../../../../server/schemas/co";
import { Army, armySchema } from "../../../../server/schemas/army";
import { trpc } from "../../../utils/trpc-client";

interface matchData {
  playerID: string;
  matchID: string;
  functionCO: any;
  inMatch: boolean;
}

export default function MatchCardSetup({
  playerID,
  matchID,
  functionCO,
  inMatch,
}: matchData) {
  const switchCO = trpc.match.switchCO.useMutation();
  const switchArmy = trpc.match.switchArmy.useMutation();
  const joinMatch = trpc.match.join.useMutation();
  const [showCO, setShowCO] = useState(false);
  const [showArmy, setShowArmy] = useState(false);

  if (inMatch)
    return (
      <div className="@flex  ">
        <div className="@col-span-5">
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
              {coSchema._def.values.map((co, index) => {
                return (
                  <div
                    onClick={async () => {
                      await switchCO.mutateAsync({
                        selectedCO: co,
                        matchId: matchID,
                        playerId: playerID,
                      });
                      functionCO(co, null);
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

        <div className="@col-span-5">
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
              {armySchema._def.values.map((army, index) => {
                return (
                  <div
                    onClick={async () => {
                      await switchArmy.mutateAsync({
                        matchId: matchID,
                        playerId: playerID,
                        selectedArmy: army,
                      });
                      functionCO(null, army);
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
      </div>
    );
  else
    return (
      <div className="@flex  ">
        <div className="@col-span-5">
          <button
            className=" btnMenu"
            onClick={async () => {
              await joinMatch.mutateAsync({
                matchId: matchID,
                playerId: playerID,
                selectedCO: "sami",
              });
            }}
          >
            Join Game
          </button>
        </div>
      </div>
    );
}
