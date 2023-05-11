import { IngameInfo } from "components/IngameInfo";
import { PlayerInMatch } from "shared/types/server-match-state";

interface Props {
  playerTurn: boolean;
  playerInMatch: PlayerInMatch | null;
}

const nationColorGradients: Record<string, string> = {
  "blue-moon": "@bg-gradient-to-l @from-blue-400",
  "orange-star": "@bg-gradient-to-l @from-orange-400",
  "green-earth": "@bg-gradient-to-l @from-green-400",
  "yellow-comet": "@bg-gradient-to-l @from-yellow-400",
  neutral: "@bg-gradient-to-l @from-gray-400",
};

export const PlayerBox = ({ playerTurn, playerInMatch }: Props) => {
  let playerGradient: string;
  let playerCO: string;
  let playerNation: string;
  let playerId: string;
  let playerUnit: string;

  if (!playerInMatch) {
    playerGradient = nationColorGradients["neutral"];
    playerCO = `/img/CO/Neutral-Full.png`;
    playerNation = "";
    playerId = "Awaiting player...";
    playerUnit = "";
  } else {
    playerGradient = nationColorGradients[playerInMatch.army];
    playerCO = `/img/CO/${playerInMatch.co}-Full.png`;
    playerNation = `/img/nations/${playerInMatch.army}.webp`;
    playerId = playerInMatch.playerId;
    playerUnit = `/img/units/${playerInMatch.army}/Infantry-0.png`;
  }

  return (
    <div className="@relative @z-25 playerBox">
      <div className="@flex @flex-row playerCOAndNationBox">
        <div
          className={`@relative @h-[100px] @aspect-square @outline @outline-2 @outline-black ${playerGradient} playerCOBox`}
        >
          <img
            className={`@absolute @bottom-0 @h-[120px] @w-full @aspect-square @object-none @object-left-top playerCOIcon ${
              playerTurn ? "" : "isNotPlayerTurn"
            }`}
            src={playerCO}
          />
          <img
            className="@absolute @h-8 @top-1 @right-1 @bg-slate-200"
            src={playerNation}
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
              <IngameInfo ingameStatIconPath="" ingameStat={"00:00:00"} />
              <IngameInfo ingameStatIconPath={playerUnit} ingameStat={999} />
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
