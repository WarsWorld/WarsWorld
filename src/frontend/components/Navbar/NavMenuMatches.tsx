import { NavItem } from "./NavItem";

interface Props {
  showMatchLinks: boolean;
  handleBurgerMenu?: () => void;
}

const navItemObject = [
  { text: "YOUR GAMES", location: "/your-matches" },
  { text: "CURRENT GAMES", location: "/your-matches#currentGames" },
  { text: "COMPLETED GAMES", location: "/your-matches#completedGames" },
  { text: "SAMPLE MATCHES", location: "/sample-matches" },
];

export function NavMenuMatches({ showMatchLinks, handleBurgerMenu }: Props) {
  return (
    <div
      onClick={handleBurgerMenu}
      className={`@grid @bg-gray-800 @h-0 @px-2 matchMenuLinks ${
        showMatchLinks ? "showMatchMenuLinks" : ""
      }`}
    >
      {navItemObject.map((item) => (
        <NavItem text={item.text} location={item.location} key={item.text} />
      ))}
    </div>
  );
}
