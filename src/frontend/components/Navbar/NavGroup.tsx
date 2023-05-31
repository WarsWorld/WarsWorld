import { NavItem } from "./NavItem";
import { NavMenuMatches } from "./NavMenuMatches";

interface Props {
  showMatchLinks: boolean;
  handleMatchLinks: () => void;
  handleBurgerMenu: () => void;
}

const navItemObject = [
  { text: "COMPETITION", location: "/" },
  { text: "NEWS", location: "/" },
  { text: "HOW TO PLAY", location: "/howtoplay" },
  { text: "COMMUNITY", location: "/" },
];

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
          className="@text-white @flex @flex-col relative @justify-center @items-center @cursor-pointer matchLobbyToggle"
        >
          GAMES
          <NavMenuMatches
            showMatchLinks={showMatchLinks}
            handleBurgerMenu={handleBurgerMenu}
          />
        </button>
        {navItemObject.map((item) => (
          <NavItem key={item.text} text={item.text} location={item.location} />
        ))}
      </div>
      <div className="@flex @justify-center @items-center @relative loginLink">
        <NavItem text="LOGIN" location="/" />
      </div>
    </>
  );
}
