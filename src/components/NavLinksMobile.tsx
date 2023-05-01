import { NavItem } from './NavItem';

interface Props {
  showLinks: boolean;
  showMatchLinks: boolean;
  handleMatchLinks: () => void;
}

export function NavLinksMobile({
  showLinks,
  showMatchLinks,
  handleMatchLinks,
}: Props) {
  return (
    <>
      <div
        className={`@grid @fixed @justify-center @items-center @bg-gray-800/90 @right-0 @w-[160px] @h-0 burgerMenuLinks ${
          showLinks ? 'showBurgerMenuLinks' : ''
        }`}
      >
        <button onClick={handleMatchLinks} className="matchLobbyBtn">
          Match Lobby
        </button>
        <div
          className={`@grid @fixed @justify-center @items-center @bg-gray-800/90 @h-0 matchMenuLinks ${
            showMatchLinks ? 'showMatchMenuLinks' : ''
          }`}
        >
          <NavItem text="Current Games" location="/match#current-games" />
          <NavItem text="Completed Games" location="/match#completed-games" />
        </div>
        <NavItem text="How to play" location="/howtoplay" />
        <NavItem text="Login" location="/" />
      </div>
    </>
  );
}
