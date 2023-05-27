import { NavItem } from "./NavItem";
import { NavMenuMatches } from "./NavMenuMatches";

interface Props {
  showMatchLinks: boolean;
  handleMatchLinks: () => void;
  handleBurgerMenu: () => void;
}

export function NavGroup({
  showMatchLinks,
  handleMatchLinks,
  handleBurgerMenu,
}: Props) {
  return (
    <>
      <div className="@flex @items-center @justify-center @gap-8 navGroup">
        <button
          onClick={handleMatchLinks}
          className="@flex @flex-col relative @justify-center @items-center @cursor-pointer matchLobbyToggle"
        >
          GAMES
          <NavMenuMatches
            showMatchLinks={showMatchLinks}
            handleBurgerMenu={handleBurgerMenu}
          />
        </button>
        <NavItem text="COMPETITION" location="/" />
        <NavItem text="NEWS" location="/" />
        <NavItem text="HOW TO PLAY" location="/howtoplay" />
        <NavItem text="COMMUNITY" location="/" />
      </div>
      <div className="@flex @justify-center @items-center @relative loginLink">
        <NavItem text="LOGIN" location="/" />
      </div>
    </>
  );
}
