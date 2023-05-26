import { NavItem } from "./NavItem";

interface Props {
  showMatchLinks: boolean;
}

export function NavMenuMatches({ showMatchLinks }: Props) {
  return (
    <div
      className={`@grid @bg-gray-800/90 @w-[200px] @h-0 matchMenuLinks ${
        showMatchLinks ? "showMatchMenuLinks" : ""
      }`}
    >
      <NavItem text="YOUR GAMES" location="/your-matches" />
      <NavItem text="CURRENT GAMES" location="/your-matches#currentGames" />
      <NavItem text="COMPLETED GAMES" location="/your-matches#completedGames" />
    </div>
  );
}
