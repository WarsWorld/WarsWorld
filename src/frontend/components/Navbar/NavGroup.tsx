import { Dispatch, SetStateAction } from "react";
import { NavItem } from "./NavItem";
import { NavMenuMatches } from "./NavMenuMatches";
import NavButton from "./NavButton";
import LoginSignupModal from "../modals/LoginSignupModal";
import SquareButton from "../layout/SquareButton";

interface Props {
  showMatchLinks: boolean;
  handleMatchLinks: () => void;
  setShowLinks: Dispatch<SetStateAction<boolean>>;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  isOpen: boolean;
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

export function NavGroup({
  showMatchLinks,
  handleMatchLinks,
  setIsOpen,
  isOpen,
}: Props) {
  return (
    <>
      <div className="@flex @items-center @justify-center @gap-10 monitor:@gap-16 @h-full">
        <button
          onMouseEnter={handleMatchLinks}
          onMouseLeave={handleMatchLinks}
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
      <div className="@flex @h-full @justify-center @items-center @relative @pr-6">
        <div className="@flex @justify-center @items-center @text-2xl @w-32 @h-12 hover:@scale-[1.025] @cursor-pointer">
          <SquareButton onClick={() => setIsOpen(true)}>LOGIN</SquareButton>
        </div>
      </div>
      <LoginSignupModal isOpen={isOpen} setIsOpen={setIsOpen} />
    </>
  );
}
