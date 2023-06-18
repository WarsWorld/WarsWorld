import { Dispatch, SetStateAction } from "react";
import { NavItem } from "./NavItem";
import { NavMenuMatches } from "./NavMenuMatches";

interface Props {
  showMatchLinks: boolean;
  handleMatchLinks: () => void;
  setShowLinks: Dispatch<SetStateAction<boolean>>;
}

const navItemObject = [
  {
    text: "COMPETITION",
    location: "/",
    iconPath: "/img/layout/NeoTank_MSide-0.png",
    iconAlt: "Teal Galaxy Neo Tank",
    flip: true,
  },
  {
    text: "NEWS",
    location: "/news",
    iconPath: "/img/layout/Sub-0.png",
    iconAlt: "Yellow Comet Sub",
    flip: false,
  },
  {
    text: "HOW TO PLAY",
    location: "/howtoplay",
    iconPath: "/img/layout/APC_MSide-0.png",
    iconAlt: "Jade Sun APC",
    flip: true,
  },
  {
    text: "COMMUNITY",
    location: "/",
    iconPath: "/img/layout/Cruiser-0.png",
    iconAlt: "Blue Moon Cruiser",
    flip: false,
  },
];

export function NavGroup({ showMatchLinks, handleMatchLinks }: Props) {
  return (
    <>
      <div className="@flex @items-center @justify-center navGroup">
        <button
          onClick={handleMatchLinks}
          className="@text-white @flex @flex-col relative @justify-center @items-center @cursor-pointer matchLobbyToggle"
        >
          <div className="@flex @justify-center @items-center @gap-1">
            GAME
            <img
              className="@transform @scale-x-[-1]"
              src="/img/layout/MdTank_MSide-0.png"
              alt="Orange Star Medium Tank"
            />
          </div>
          <NavMenuMatches showMatchLinks={showMatchLinks} />
        </button>
        {navItemObject.map((item) => (
          <NavItem
            key={item.text}
            text={item.text}
            location={item.location}
            iconPath={item.iconPath}
            iconAlt={item.iconAlt}
            flip={item.flip}
          />
        ))}
      </div>
      <div className="@flex @justify-center @items-center @relative loginLink">
        <NavItem
          text="LOGIN"
          location="/"
          iconPath="/img/layout/Stealth-0.png"
          iconAlt="Pink Cosmos Stealth"
          flip={false}
        />
      </div>
    </>
  );
}
