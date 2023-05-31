import { NavItem } from "./NavItem";
import { NavMenuMatches } from "./NavMenuMatches";

interface Props {
  showLinks: boolean;
  handleBurgerMenu: () => void;
  showMatchLinks: boolean;
  handleMatchLinks: () => void;
}

const navItemObject = [
  {
    text: "COMPETITION",
    location: "/",
    iconPath: "/img/units/tealGalaxy/NeoTank_MSide-0.png",
    iconAlt: "Teal Galaxy Neo Tank",
    flip: true,
  },
  {
    text: "NEWS",
    location: "/",
    iconPath: "/img/units/yellowComet/Sub-0.png",
    iconAlt: "Yellow Comet Sub",
    flip: false,
  },
  {
    text: "HOW TO PLAY",
    location: "/howtoplay",
    iconPath: "/img/units/jadeSun/APC_MSide-0.png",
    iconAlt: "Jade Sun APC",
    flip: true,
  },
  {
    text: "COMMUNITY",
    location: "/",
    iconPath: "/img/units/blueMoon/Cruiser-0.png",
    iconAlt: "Blue Moon Cruiser",
    flip: false,
  },
  {
    text: "LOGIN",
    location: "/",
    iconPath: "/img/units/pinkCosmos/Stealth-0.png",
    iconAlt: "Pink Cosmos Stealth",
    flip: false,
  },
];

export function NavGroupMobile({
  showLinks,
  handleBurgerMenu,
  showMatchLinks,
  handleMatchLinks,
}: Props) {
  return (
    <>
      <div
        className={`@grid @fixed @justify-center @items-center @bg-gray-800 @right-0 @w-full @h-0 burgerMenuLinks ${
          showLinks ? "showBurgerMenuLinks" : ""
        }`}
      >
        <button
          onClick={handleMatchLinks}
          className="@flex @flex-col @relative @items-center matchLobbyToggle"
        >
          <span
            className={`@text-base-button ${showMatchLinks ? "@mb-4" : ""}`}
          >
            <div className="@flex @justify-center @items-center @gap-2">
              GAME
              <img
                className="@transform @scale-x-[-1]"
                src="/img/units/orangeStar/MdTank_MSide-0.png"
                alt="Orange Star Medium Tank"
              />
            </div>
          </span>
          <NavMenuMatches
            showMatchLinks={showMatchLinks}
            handleBurgerMenu={handleBurgerMenu}
          />
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
    </>
  );
}
