import type { Army } from "shared/schemas/army";
import type { CO } from "shared/schemas/co";

type matchData = {
  name: string;
  co: CO;
  country: Army;
  flipCO?: boolean;
  opponent?: boolean;
  playerReady?: boolean;
};

export default function MatchPlayer({
  name,
  co,
  country,
  flipCO,
  opponent,
  playerReady
}: matchData) {
  //it might be the other player AND an unpicked spot (a greyed out opponent)
  if (flipCO !== undefined) {
    return (
      <div className={"@truncate @text-right"}>
        <div
          style={{
            backgroundImage: `url("/img/CO/pixelated/${co}-full.png")`
          }}
          className={`@h-[200px] [image-rendering:pixelated] @bg-cover 
             ${opponent !== undefined ? "@brightness-[0.1]" : ""} 
             ${playerReady !== undefined ? "@contrast-[1]" : "@contrast-[0.5]"}`}
        ></div>
        <div
          className={`@flex @flex-row-reverse
      ${opponent !== undefined ? "@bg-gray-600" : `@bg-${country}`}`}
        >
          <img
            src={
              opponent !== undefined
                ? `/img/nations/black-hole.gif`
                : `/img/nations/${country}.gif`
            }
            className="@h-7 [image-rendering:pixelated]"
            alt="opponent chosen CO"
          />
          <p className="@truncate @px-0.5 @text-sm">{name}</p>
        </div>
      </div>
    );
  }
  //it is a regular player
  else {
    return (
      <div className={"@truncate @text-left"}>
        <div
          style={{
            backgroundImage: `url("/img/CO/pixelated/${co}-full.png")`
          }}
          className={`@h-[200px] [image-rendering:pixelated] @bg-cover @scale-x-[-1] ${
            playerReady !== undefined ? "@contrast-[1]" : "@contrast-[0.5]"
          }`}
        ></div>
        <div className={`@flex @bg-${country}`}>
          <img
            src={`/img/nations/${country}.gif`}
            className="@h-7 [image-rendering:pixelated]"
            alt="opponent chosen CO"
          />
          <p className="@truncate @px-0.5 @text-sm">{name}</p>
        </div>
      </div>
    );
  }
}
