import { NavItem } from "./NavItem";
import { NavMenuMatches } from "./NavMenuMatches";

interface Props {
  showLinks: boolean;
  handleBurgerMenu: () => void;
  showMatchLinks: boolean;
  handleMatchLinks: () => void;
}

const navItemObject = [
  { text: "COMPETITION", location: "/" },
  { text: "NEWS", location: "/" },
  { text: "HOW TO PLAY", location: "/howtoplay" },
  { text: "COMMUNITY", location: "/" },
  { text: "LOGIN", location: "/" },
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
            GAMES
          </span>
          <NavMenuMatches
            showMatchLinks={showMatchLinks}
            handleBurgerMenu={handleBurgerMenu}
          />
        </button>
        {navItemObject.map((item) => (
          <NavItem key={item.text} text={item.text} location={item.location} />
        ))}
      </div>
    </>
  );
}
