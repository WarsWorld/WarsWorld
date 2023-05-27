import { NavItem } from "./NavItem";
import { NavMenuMatches } from "./NavMenuMatches";

interface Props {
  showLinks: boolean;
  handleBurgerMenu: () => void;
  showMatchLinks: boolean;
  handleMatchLinks: () => void;
}

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
        <NavItem text="COMPETITION" location="/" />
        <NavItem text="NEWS" location="/" />
        <NavItem text="HOW TO PLAY" location="/howtoplay" />
        <NavItem text="COMMUNITY" location="/" />
        <NavItem text="LOGIN" location="/" />
      </div>
    </>
  );
}
