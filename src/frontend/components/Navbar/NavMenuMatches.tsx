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
      className={`@absolute @m-0 @p-0 @list-none @overflow-y-hidden @shadow-black @shadow-lg @rounded @w-[21vw] monitor:@w-[16vw] @top-[5vh] 
      @bg-gradient-to-r @from-bg-primary @from-30% @to-bg-secondary @z-50 @duration-[750ms]
          ${showMatchLinks ? "@max-h-96" : "@max-h-0"}`}
    >
      {navItemObject.map((option) => (
        <li
          key={option.text}
          className={`@py-3 @px-4 large_monitor:@py-4 @cursor-pointer`}
        >
          <NavItem text={option.text} location={option.location} />
        </li>
      ))}
    </ul>
  );
}
