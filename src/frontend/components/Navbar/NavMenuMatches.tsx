import { NavItem } from "./NavItem";

type Props = {
  showMatchLinks: boolean;
  handleBurgerMenu?: () => void;
}

const navItemObject = [
  { text: "YOUR GAMES", location: "/your-matches" },
  { text: "CURRENT GAMES", location: "/your-matches#currentGames" },
  { text: "COMPLETED GAMES", location: "/your-matches#completedGames" },
  { text: "SAMPLE MATCHES", location: "/sample-matches" }
];

export function NavMenuMatches({ showMatchLinks, handleBurgerMenu }: Props) {
  return (
    <ul
      className={`@absolute @m-0 @p-0 @list-none @overflow-y-hidden @shadow-black @shadow-lg @w-56 monitor:@w-[18vw] @rounded @top-[calc(100%_+_1em)] laptop:@top-[calc(100%_+_2.15em)] monitor:@top-[calc(100%_+_1.9em)] large_monitor:@top-[calc(100%_+_1.75em)]
      @bg-gradient-to-r @from-bg-primary @from-30% @to-bg-secondary @z-50 @duration-[750ms]
          ${showMatchLinks ? "@max-h-96" : "@max-h-0"}`}
    >
      {navItemObject.map((option) => (
        <li key={option.text} className={`@py-3 @px-4 large_monitor:@py-4 @cursor-pointer @border-primary-dark @border-b-[1px]`}>
          <NavItem text={option.text} location={option.location} handleBurgerMenu={handleBurgerMenu} />
        </li>
      ))}
    </ul>
  );
}
