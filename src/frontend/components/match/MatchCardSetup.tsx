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
  setCurrentPlayerOptions: React.Dispatch<React.SetStateAction<{
    CO: COID;
    army: Army;
    ready: boolean | undefined;
    slot: number;
  }>>,
  inMatch: boolean;
  readyStatus: boolean;
};

export default function MatchCardSetup({ playerID, matchID, setCurrentPlayerOptions, inMatch, readyStatus}: matchData) {
  const switchCO = trpc.match.switchCO.useMutation();
  const switchArmy = trpc.match.switchArmy.useMutation();
  const switchSlot = trpc.match.switchSlot.useMutation();
  const joinMatch = trpc.match.join.useMutation();
  const readyMatch = trpc.match.setReady.useMutation();
  const leaveMatch = trpc.match.leave.useMutation();
  const [showDropdown, setShowDropdown] = useState("")

  if (inMatch) {
    return (<div className="@flex">
        {/* **** CO Button and Menu **** */}
        <div>
          <button
            className="btnMenu"
            onClick={() => {
              setShowDropdown(prev => prev == "co" ? "" : "co");
            }}
            >
            Switch CO
          </button>
          {showDropdown == "co" ? (<div
              className="@overflow-visible @grid @grid-cols-4 @absolute  @z-10  @bg-bg-tertiary @outline-black @outline-2 @gap-2">
              {coSchema._def.values.map((co) => {
                return (<div
                    onClick={() => {
                      const selectedCO: COID = { name: co, version: "AW2" };
                      void switchCO
                        .mutateAsync({
                          selectedCO,
                          matchId: matchID,
                          playerId: playerID
                        })
                        .then(() => {
                          setCurrentPlayerOptions((prevState) => {return {...prevState, CO: selectedCO}})
                          setShowDropdown("");
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
                  </div>);
              })}
            </div>) : (<></>)}
        </div>

        {/* **** Army Button and Menu **** */}
        <div>
          <button
            className=" btnMenu"
            onClick={() => {
              setShowDropdown(prev => prev == "army" ? "" : "army");
            }}
            >
            Switch Army
          </button>
          {showDropdown == "army"  ? (
            <div className="@grid @grid-cols-2 @absolute  @z-10  @bg-bg-tertiary @outline-black @outline-2 @gap-2">
              {armySchema._def.values.map((army) => {
                return (<div
                    onClick={() => {
                      void switchArmy
                        .mutateAsync({
                          matchId: matchID,
                          playerId: playerID,
                          selectedArmy: army
                        })
                        .then(() => {
                          setCurrentPlayerOptions((prevState) => {return {...prevState, army: army}})
                          setShowDropdown("");
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
                  </div>);
              })}
            </div>) : (<></>)}
        </div>
        
        {/* **** Slot Button and Menu **** */}
        <div>
          <button
            className=" btnMenu"
            onClick={() => {
              setShowDropdown(prev => prev == "slot" ? "" : "slot");
            }}
            >
            Switch Slot
          </button>
          {showDropdown == "slot" ? (
            <div className="@absolute @z-10 @bg-bg-tertiary @outline-black @outline-2">
              {[0,1].map((slot) => {
                return (<div
                    onClick={() => {
                      void switchSlot
                        .mutateAsync({
                          matchId: matchID,
                          playerId: playerID,
                          selectedSlot: slot
                        })
                        .then(() => {
                          setCurrentPlayerOptions((prevState) => {return {...prevState, slot: slot}})
                          setShowDropdown("");
                        });
                    }}
                    key={slot}
                    className={`@flex @items-center @p-1 @bg-bg-primary hover:@bg-primary @cursor-pointer @duration-300`}
                  >
                    <p className="@capitalize @text-xs @px-1">{slot}</p>
                  </div>);
              })}
            </div>) : (<></>)}
        </div>

        {/* Ready Button */}
        <div>
          <button
            className=" btnMenu"
            onClick={() => {
              //TODO: Should ask player confirmation that if readying up AND other player is ready, it will start the match
              void readyMatch
                .mutateAsync({
                  matchId: matchID,
                  playerId: playerID,
                  readyState: !readyStatus
                })
                .then(() => {
                  setCurrentPlayerOptions((prevState) => {return {...prevState, ready: !readyStatus}})
                  
                  if (!readyStatus) {
                    location.reload();
                  }
                });
            }}
          >
            {readyStatus ? "Unready" : "Ready up"}
          </button>
        </div>

        {/* Leave Button */}
        <div>
          <button
            className=" btnMenu"
            onClick={() => {
              void leaveMatch
                .mutateAsync({
                  matchId: matchID,
                  playerId: playerID,
                })
                .then(() => {
                    location.reload();
                });
            }}
          >
            Leave
          </button>
        </div>

      </div>);
  }
  // Not part of the game, can't change CO or Army or Ready
  else {
    return (<div className="@flex  ">
        <div>
          <button
            className=" btnMenu"
            onClick={() => {
              void joinMatch
                .mutateAsync({
                  matchId: matchID,
                  playerId: playerID,
                  //TODO: This needs more logic for someone joining outside a 2 player match
                  playerSlot: null,
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
      </div>);
  }
}
