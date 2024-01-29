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
  setCurrentPlayerOptions: React.Dispatch<
    React.SetStateAction<{
      CO: COID;
      army: Army;
      ready: boolean | undefined;
      slot: number;
    }>
  >;
  inMatch: boolean;
  readyStatus: boolean;
  selectedOptions: {
    selectedArmies: Army[];
    selectedSlots: number[];
  };
  setSelectedOptions: React.Dispatch<
    React.SetStateAction<{
      selectedArmies: Army[];
      selectedSlots: number[];
    }>
  >;
  maxNumberOfPlayers: number;
};

export default function MatchCardSetup({
  playerID,
  matchID,
  setCurrentPlayerOptions,
  inMatch,
  readyStatus,
  selectedOptions,
  setSelectedOptions,
  maxNumberOfPlayers,
}: matchData) {
  const utils = trpc.useUtils();
  const switchOptions = trpc.match.switchOptions.useMutation();

  const joinMatch = trpc.match.join.useMutation({
    onSuccess() {
      void utils.match.invalidate();
    },
  });
  const readyMatch = trpc.match.setReady.useMutation({
    onSuccess() {
      void utils.match.invalidate();
    },
  });
  const leaveMatch = trpc.match.leave.useMutation({
    onSuccess() {
      void utils.match.invalidate();
    },
  });

  const [showDropdown, setShowDropdown] = useState("");

  if (inMatch) {
    return (
      <div className="@flex">
        {/* **** CO Button and Menu **** */}
        <div>
          <button
            className="btnMenu"
            onClick={() => {
              setShowDropdown((prev) => (prev == "co" ? "" : "co"));
            }}
          >
            Switch CO
          </button>
          {showDropdown == "co" ? (
            <div className="@overflow-visible @grid @grid-cols-4 @absolute  @z-10  @bg-bg-tertiary @outline-black @outline-2 @gap-2">
              {coSchema._def.values.map((co) => {
                return (
                  <div
                    onClick={() => {
                      const selectedCO: COID = { name: co, version: "AW2" };
                      void switchOptions
                        .mutateAsync({
                          selectedCO,
                          matchId: matchID,
                          playerId: playerID,
                        })
                        .then(() => {
                          setCurrentPlayerOptions((prevState) => {
                            return { ...prevState, CO: selectedCO };
                          });
                          setShowDropdown("");
                        });
                    }}
                    key={co}
                    className={`@flex @items-center @p-1 @bg-bg-primary hover:@bg-primary 
                    @cursor-pointer @duration-300`}
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

        {/* **** Army Button and Menu **** */}
        <div>
          <button
            className=" btnMenu"
            onClick={() => {
              setShowDropdown((prev) => (prev == "army" ? "" : "army"));
            }}
          >
            Switch Army
          </button>
          {showDropdown == "army" ? (
            <div className="@grid @grid-cols-2 @absolute  @z-10  @bg-bg-tertiary @outline-black @outline-2 @gap-2">
              {armySchema._def.values.map((army) => {
                return (
                  <div
                    onClick={() => {
                      if (!selectedOptions.selectedArmies.includes(army)) {
                        void switchOptions
                          .mutateAsync({
                            matchId: matchID,
                            playerId: playerID,
                            selectedArmy: army,
                          })
                          .then(() => {
                            let prevArmy: Army;
                            setCurrentPlayerOptions((prevState) => {
                              prevArmy = prevState.army;
                              return { ...prevState, army: army };
                            });
                            setSelectedOptions((prevState) => {
                              const selectedArmiesWithoutPrevArmy = prevState.selectedArmies.filter(
                                (army) => army != prevArmy,
                              );
                              return {
                                ...prevState,
                                selectedArmies: [...selectedArmiesWithoutPrevArmy, army],
                              };
                            });
                            setShowDropdown("");
                          });
                      }
                    }}
                    key={army}
                    className={`@flex @items-center @p-1 @bg-bg-primary 
                    ${
                      selectedOptions.selectedArmies.includes(army)
                        ? "@brightness-50"
                        : "hover:@bg-primary @cursor-pointer @duration-300"
                    }`}
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

        {/* **** Slot Button and Menu **** */}
        <div>
          <button
            className=" btnMenu"
            onClick={() => {
              setShowDropdown((prev) => (prev == "slot" ? "" : "slot"));
            }}
          >
            Switch Slot
          </button>
          {showDropdown == "slot" ? (
            <div className="@absolute @z-10 @bg-bg-tertiary @outline-black @outline-2">
              {[...Array(maxNumberOfPlayers).keys()].map((slot) => {
                return (
                  <div
                    onClick={() => {
                      if (!selectedOptions.selectedSlots.includes(slot)) {
                        void switchOptions
                          .mutateAsync({
                            matchId: matchID,
                            playerId: playerID,
                            selectedSlot: slot,
                          })
                          .then(() => {
                            let prevSlot: number;
                            setCurrentPlayerOptions((prevState) => {
                              prevSlot = prevState.slot;
                              return { ...prevState, slot: slot };
                            });
                            setSelectedOptions((prevState) => {
                              const selectedSlotsWithoutPrevSlot = prevState.selectedSlots.filter(
                                (slot) => slot != prevSlot,
                              );
                              return {
                                ...prevState,
                                selectedSlots: [...selectedSlotsWithoutPrevSlot, slot],
                              };
                            });
                            setShowDropdown("");
                          });
                      }
                    }}
                    key={slot}
                    className={`@flex @items-center @p-1 @bg-bg-primary
                      ${
                        selectedOptions.selectedSlots.includes(slot)
                          ? "@brightness-50"
                          : "hover:@bg-primary @cursor-pointer @duration-300"
                      }
                    `}
                  >
                    <p className="@capitalize @text-xs @px-1">{slot}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <></>
          )}
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
                  readyState: !readyStatus,
                })
                .then(() => {
                  setCurrentPlayerOptions((prevState) => {
                    return { ...prevState, ready: !readyStatus };
                  });
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
              void leaveMatch.mutateAsync({
                matchId: matchID,
                playerId: playerID,
              });
            }}
          >
            Leave
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
              void joinMatch.mutateAsync({
                matchId: matchID,
                playerId: playerID,
                //TODO: This needs more logic for someone joining outside a 2 player match
                playerSlot: null,
                selectedCO: { name: "sami", version: "AW2" },
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
