import type { Dispatch, SetStateAction } from "react";
import { NavItem } from "./NavItem";
import { NavMenuMatches } from "./NavMenuMatches";
import NavButton from "./NavButton";
import NavLoginLogout from "./NavLoginLogout";
import PlayButton from "../layout/PlayButton";

type Props = {
  showMatchLinks: boolean;
  setShowMatchLinks: Dispatch<SetStateAction<boolean>>;
  setShowLinks: Dispatch<SetStateAction<boolean>>;
  setIsOpen: (value: boolean, callbackUrl?: string) => Promise<void>;
  isOpen: boolean;
};

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

export function NavGroup({ showMatchLinks, setShowMatchLinks, setIsOpen, isOpen }: Props) {
  return (
    <>
      <div className="@flex @items-center @justify-center @gap-10 monitor:@gap-16 @h-full @w-[70vw]">
        <button
          onMouseEnter={() => setShowMatchLinks(true)}
          onMouseLeave={() => setShowMatchLinks(false)}
          className="@text-white @flex @flex-col relative @justify-center @items-center @cursor-pointer matchLobbyToggle @h-full"
        >
          <NavButton key="GAME" hasArrow isOpen={showMatchLinks}>
            GAME
          </NavButton>
          <div className="@flex @justify-center @relative @w-full ">
            <NavMenuMatches showMatchLinks={showMatchLinks} />
          </div>
        </button>
        {navItemObject.map((item) => (
          <NavItem key={item.text} text={item.text} location={item.location} />
        ))}
      </div>
      <div className="@flex @h-12 @w-[15%] @justify-end @items-center @relative">
        <NavLoginLogout isOpen={isOpen} setIsOpen={setIsOpen} />
      </div>
    </>
  );
}
