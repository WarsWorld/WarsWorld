import { IngameInfo } from "frontend/components/IngameInfo";
import Image from "next/image";
import type { PlayerInMatch } from "shared/types/server-match-state";

type Props = {
  playerTurn: boolean;
  playerInMatch: PlayerInMatch | undefined;
};

const nationColorGradients: Record<string, string> = {
  blueMoon: "@bg-gradient-to-l @from-blue-400",
  orangeStar: "@bg-gradient-to-l @from-orange-400",
  greenEarth: "@bg-gradient-to-l @from-green-400",
  yellowComet: "@bg-gradient-to-l @from-yellow-400",
  neutral: "@bg-gradient-to-l @from-gray-400"
};

const kebabToCamel = (str: string) => {
  return str.replace(/-([a-z])/, function (_match, letter: string) {
    return letter.toUpperCase();
  });
};

export const PlayerBox = ({ playerTurn, playerInMatch }: Props) => {
  const army = playerInMatch?.army && kebabToCamel(playerInMatch.army);
  const playerGradient = nationColorGradients[army ?? "neutral"];
  const playerCO = playerInMatch?.co ?? "Neutral";
  const playerNation = army ?? "neutral";
  const playerId = playerInMatch?.id ?? "Awaiting player...";
  const playerUnit = army ?? "neutral";

  return (
    <div className="@relative @z-25 playerBox">
      <div className="@flex @flex-row playerCOAndNationBox">
        <div
          className={`@relative @h-[100px] @aspect-square @outline @outline-2 @outline-black ${playerGradient} playerCOBox`}
        >
          <Image
            className={`@absolute @bottom-0 @h-[120px] @w-full @aspect-square @object-none @object-left-top playerCOIcon ${
              playerTurn ? "" : "isNotPlayerTurn"
            }`}
            src={`/img/CO/${playerCO}-Full.png`}
            alt={playerCO}
          />
          <Image
            className="@absolute @h-8 @top-1 @right-1 @aspect-square @bg-slate-200"
            src={`/img/nations/${playerNation}.webp`}
            alt={playerNation}
          />
        </div>
        <div className="@text-white @w-full playerNationBox">
          <div className="playerUsernameAndIngameStats">
            <div className="@flex @items-center @bg-stone-900 @py-1 @px-3 @outline @outline-2 @outline-black playerUsername">
              {playerId}
            </div>
            <div className="@flex @items-center @justify-center @bg-stone-900 @p-1 @outline @outline-2 @outline-black playerExp">
              Placeholder for an exp bar
            </div>
            <div className="@flex @flex-row @flex-wrap @w-full playerIngameInfo">
              <IngameInfo ingameStatIconPath="" ingameStat="00:00:00" />
              <IngameInfo
                ingameStatIconPath={`/img/units/${playerUnit}/Infantry-0.png`}
                ingameStat={999}
              />
              <IngameInfo
                ingameStatIconPath="/img/mapTiles/countries/city/ne1.webp"
                ingameStat={999999}
              />
              <IngameInfo ingameStatIconPath="" ingameStat={999999} />
              <IngameInfo ingameStatIconPath="" ingameStat={999999} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
