import { NavItem } from './NavItem';
import { NavLinksMatches } from './NavLinksMatches';

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
        <NavLinksMatches showMatchLinks={showMatchLinks} />
        <NavItem text="How to play" location="/howtoplay" />
        <NavItem text="Login" location="/" />
      </div>
    </>
  );
}
