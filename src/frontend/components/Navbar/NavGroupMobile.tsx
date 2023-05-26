import { NavItem } from "./NavItem";
import { NavMenuMatches } from "./NavMenuMatches";

interface Props {
  showLinks: boolean;
  showMatchLinks: boolean;
  handleMatchLinks: () => void;
}

export function NavGroupMobile({
  showLinks,
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
        <div
          onClick={handleMatchLinks}
          className="@relative @flex @flex-col @justify-center @items-center @cursor-pointer matchLobbyToggle"
        >
          GAMES
          <NavMenuMatches showMatchLinks={showMatchLinks} />
        </div>
        <NavItem text="COMPETITION" location="/howtoplay" />
        <NavItem text="NEWS" location="/howtoplay" />
        <NavItem text="HOW TO PLAY" location="/howtoplay" />
        <NavItem text="COMMUNITY" location="/" />
        <NavItem text="LOGIN" location="/" />
      </div>
    </>
  );
}
