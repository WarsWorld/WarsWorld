import { NavItem } from './NavItem';

interface Props {
  showLinks: boolean;
}

export function NavLinksMobile({ showLinks }: Props) {
  return (
    <>
      <div className="@flex @flex-col @gap-1 burgerMenu">
        <div className="@h-1 @w-7 @rounded"></div>
        <div className="@h-1 @w-7 @rounded"></div>
        <div className="@h-1 @w-7 @rounded"></div>
      </div>
      <div
        className={`@grid @absolute @mt-2 @bg-slate-900/90 @right-0 @w-48 @h-0 burgerMenuLinks ${
          showLinks ? 'showBurgerMenuLinks' : ''
        }`}
      >
        <NavItem text="Match Lobby" location="/match" />
        <NavItem text="How to play" location="/howtoplay" />
        <NavItem text="Login" location="/" />
      </div>
    </>
  );
}
