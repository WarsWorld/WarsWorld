import React from "react";
import { CO } from "../../../../server/schemas/co";
import { Army } from "../../../../server/schemas/army";

interface matchData {
  name: string;
  co: CO;
  country: Army;
  flipCO?: boolean;
  opponent?: boolean;
}

export default function MatchPlayer({
  name,
  co,
  country,
  flipCO,
  opponent,
}: matchData) {


  //it might be an opponent or TBD player
  if (flipCO)
    return (
      <div className={"@truncate @text-right"}>
        <div
          style={{
            backgroundImage: `url("/img/CO/smoothFull/Awds-${co}.webp")`,
          }}
          className={
            "@h-[200px] @bg-cover " + (opponent ? "@brightness-[0.1]" : "")
          }
        ></div>
        <div
          className={`@flex @flex-row-reverse
      ${opponent ? "@bg-gray-600" : `@bg-${country}`}`}
        >
          <img
            src={opponent ? `/img/nations/black-hole.gif` : `/img/nations/${country}.gif`}
            className="@h-8 [image-rendering:pixelated]"
            alt="opponent chosen CO"
          />
          <p className="@truncate @px-0.5">{name}</p>
        </div>
      </div>
    );
  //it is a regular player
  else
    return (
      <div className={"@truncate @text-left"}>
        <div
          style={{
            backgroundImage: `url("/img/CO/smoothFull/Awds-${co}.webp")`,
          }}
          className={"@h-[200px] @bg-cover @scale-x-[-1]"}
        ></div>
        <div className={`@flex @bg-${country}`}>
          <img
            src={`/img/nations/${country}.gif`}
            className="@h-8 [image-rendering:pixelated]"
            alt="opponent chosen CO"
          />
          <p className="@truncate @px-0.5">{name}</p>
        </div>
      </div>
    );
}
