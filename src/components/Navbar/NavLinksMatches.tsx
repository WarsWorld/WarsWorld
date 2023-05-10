import { NavItem } from "./NavItem";

interface Props {
  showMatchLinks: boolean;
}

export function NavLinksMatches({ showMatchLinks }: Props) {
  return (
    <div
      className={`@grid @fixed @justify-center @items-center @bg-gray-800/90 @h-0 matchMenuLinks ${
        showMatchLinks ? "showMatchMenuLinks" : ""
      }`}
    >
      <NavItem text="Current Games" location="/match#currentGames" />
      <NavItem text="Completed Games" location="/match#completedGames" />
    </div>
  );
}
