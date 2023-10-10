import { NavItem } from "./NavItem";

interface Props {
  showMatchLinks: boolean;
  handleBurgerMenu?: () => void;
}

const navItemObject = [
  { text: "YOUR GAMES", location: "/your-matches" },
  { text: "CURRENT GAMES", location: "/your-matches#currentGames" },
  { text: "COMPLETED GAMES", location: "/your-matches#completedGames" },
  { text: "SAMPLE MATCHES", location: "/sample-matches" },
];

export function NavMenuMatches({ showMatchLinks, handleBurgerMenu }: Props) {
  return (
    <ul
      className={`@absolute @m-0 @p-0 @list-none @overflow-y-hidden @shadow-black @shadow-lg @w-[100vw] @rounded laptop:@w-[21vw] monitor:@w-[16vw] large_monitor:@w-[18vw] @top-[calc(100%_+_1em)] laptop:@top-[calc(100%_+_1.7em)] large_monitor:@top-[calc(100%_+_2.5em)]
      @bg-gradient-to-r @from-bg-primary @from-30% @to-bg-secondary @z-50 @duration-[750ms]
          ${showMatchLinks ? "@max-h-96" : "@max-h-0"}`}
    >
      {navItemObject.map((option) => (
        <li
          key={option.text}
          className={`@py-3 @px-4 large_monitor:@py-4 @cursor-pointer @border-primary @border-y-[1px]`}
        >
          <NavItem
            text={option.text}
            location={option.location}
            handleBurgerMenu={handleBurgerMenu}
          />
        </li>
      ))}
    </ul>
  );
}
