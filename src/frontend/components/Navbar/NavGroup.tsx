import { NavItem } from "./NavItem";
import { NavMenuMatches } from "./NavMenuMatches";

interface Props {
  showMatchLinks: boolean;
  handleMatchLinks: () => void;
}

export function NavGroup({ showMatchLinks, handleMatchLinks }: Props) {
  return (
    <>
      <div className="@flex @items-center @justify-center @gap-8 navLinks">
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
      </div>
      <div className="@flex @justify-center @items-center @relative loginLink">
        <NavItem text="LOGIN" location="/" />
      </div>
    </>
  );
}
