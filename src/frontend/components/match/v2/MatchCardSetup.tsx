import React, { useState } from "react";
import { CO, coSchema } from "../../../../server/schemas/co";
import { Army } from "../../../../server/schemas/army";
import { trpc } from "../../../utils/trpc-client";

interface matchData {
  playerID: string;
  matchID: string;
  functionCO: any;
}

export default function MatchCardSetup({ playerID, matchID, functionCO }: matchData) {

  const switchCO = trpc.match.switchCO.useMutation();
  const [showCO, setShowCO] = useState(false);

  return (
    <div className="@grid @grid-cols-12 @py-4  ">
      <div className="@col-span-5">
        <button className="btn" onClick={() => setShowCO(!showCO)}>
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
                    functionCO(co);


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
    </div>
  );
}
