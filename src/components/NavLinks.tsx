import { NavItem } from './NavItem';

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
          <div
            className={`@grid @fixed @justify-center @items-center @bg-gray-800/90 @h-0 matchMenuLinks ${
              showMatchLinks ? 'showMatchMenuLinks' : ''
            }`}
          >
            <NavItem text="Current Games" location="/match#current-games" />
            <NavItem text="Completed Games" location="/match#completed-games" />
          </div>
        </button>
        <NavItem text="How to play" location="/howtoplay" />
      </div>
      <div className="@text-center @relative @px-3 loginLink">
        <NavItem text="Login" location="/" />
      </div>
    </>
  );
}
