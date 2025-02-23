import { NavItem } from "./NavItem";

type Props = {
  showMatchLinks: boolean;
  handleBurgerMenu?: () => void;
};

const navItemObject = [
  { text: "YOUR GAMES", location: "/your-matches" },
  { text: "CURRENT GAMES", location: "/your-matches#currentGames" },
  { text: "COMPLETED GAMES", location: "/your-matches#completedGames" },
];

export function NavMenuMatches({ showMatchLinks, handleBurgerMenu }: Props) {
  return (
    <div
      className={`@absolute @list-none @overflow-y-hidden @m-0 @p-0 @z-50 @duration-[750ms] @w-56 monitor:@w-72 @top-[calc(100%_+_1em)] laptop:@top-[calc(100%_+_0.6em)] ${
        showMatchLinks ? "@max-h-96" : "@max-h-0"
      }`}
    >
      <ul
        className={`@py-1 @shadow-black @shadow-lg @rounded
      @bg-gradient-to-r @from-bg-primary @from-30% @to-bg-secondary
          `}
      >
        {navItemObject.map((option) => (
          <li key={option.text} className="@cursor-pointer @h-full">
            <NavItem
              text={option.text}
              location={option.location}
              handleBurgerMenu={handleBurgerMenu}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
