import type { Match, Player } from "@prisma/client";
import { trpc } from "frontend/utils/trpc-client";
import { useState } from "react";
import type { Army } from "shared/schemas/army";
import { armySchema } from "shared/schemas/army";
import type { COID } from "shared/schemas/co";
import { coSchema } from "shared/schemas/co";

type matchData = {
  playerID: Player["id"];
  matchID: Match["id"];
  setupActions: {
    setPlayerCO: (newCO: COID) => void;
    setArmy: (army: Army) => void;
    setReady: (status: boolean) => void;
  };
  inMatch: boolean;
  readyStatus: boolean;
};

export default function MatchCardSetup({
  playerID,
  matchID,
  setupActions,
  inMatch,
  readyStatus
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
                    onClick={() => {
                      const selectedCO: COID = { name: co, version: "AW2" };
                      void switchCO
                        .mutateAsync({
                          selectedCO,
                          matchId: matchID,
                          playerId: playerID
                        })
                        .then(() => {
                          setupActions.setPlayerCO(selectedCO);
                          setShowCO(false);
                        });
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
                    onClick={() => {
                      void switchArmy
                        .mutateAsync({
                          matchId: matchID,
                          playerId: playerID,
                          selectedArmy: army
                        })
                        .then(() => {
                          setupActions.setArmy(army);
                          setShowArmy(false);
                        });
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
            onClick={() => {
              void readyMatch
                .mutateAsync({
                  matchId: matchID,
                  playerId: playerID,
                  readyState: !readyStatus
                })
                .then(() => {
                  setupActions.setReady(!readyStatus);

                });
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
            onClick={() => {
              void joinMatch
                .mutateAsync({
                  matchId: matchID,
                  playerId: playerID,
                  //TODO: This needs more logic for someone joining outside a 2 player match
                  playerSlot: 1,
                  selectedCO: {name: "sami", version: "AW2" }
                })
                .then(() => {
                  //lets reload the page
                  location.reload();
                });
            }}
          >
            Join Game
          </button>
        </div>
      </div>
    );
  }
}
