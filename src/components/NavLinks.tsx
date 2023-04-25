import { NavItem } from './NavItem';

export function NavLinks() {
  return (
    <>
      <div className="@grid @grid-cols-3 @gap-10 @text-center @mx-3">
        <NavItem text="Current Games" location="/match" />
        <NavItem text="Start a game" location="/match" />
        <NavItem text="How to play" location="/howtoplay" />
      </div>
      <div className="@text-center @relative @px-3">
        <NavItem text="Login" location="/" />
      </div>
    </>
  );
}
