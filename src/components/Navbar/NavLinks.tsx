import { NavItem } from './NavItem';
import { NavLinksMatches } from './NavLinksMatches';

interface Props {
  showMatchLinks: boolean;
  handleMatchLinks: () => void;
}

export function NavLinks({ showMatchLinks, handleMatchLinks }: Props) {
  return (
    <>
      <div className="@grid @gap-8 @text-center @mx-3 navLinks">
        <button
          onClick={handleMatchLinks}
          className="@relative @flex @flex-col @justify-center @items-center matchLobbyBtn"
        >
          Match Lobby
          <NavLinksMatches showMatchLinks={showMatchLinks} />
        </button>
        <NavItem text="How to play" location="/howtoplay" />
      </div>
      <div className="@text-center @relative @px-3 loginLink">
        <NavItem text="Login" location="/" />
      </div>
    </>
  );
}
