import { NavItem } from "./NavItem";

interface Props {
  showMatchLinks: boolean;
  handleBurgerMenu: () => void;
}

export function NavMenuMatches({ showMatchLinks, handleBurgerMenu }: Props) {
  return (
    <div
      onClick={handleBurgerMenu}
      className={`@grid @bg-gray-800/90 @h-0 @px-2 matchMenuLinks ${
        showMatchLinks ? "showMatchMenuLinks" : ""
      }`}
    >
      <NavItem text="YOUR GAMES" location="/your-matches" />
      <NavItem text="CURRENT GAMES" location="/your-matches#currentGames" />
      <NavItem text="COMPLETED GAMES" location="/your-matches#completedGames" />
    </div>
  );
}
