import { NavItem } from "./NavItem";
import NavUserSection from "./user-settings/NavUserSection";

type Props = {
  showLinks: boolean;
  handleBurgerMenu: () => void;
  setIsOpen: (value: boolean, callbackUrl?: string) => Promise<void>;
  isOpen: boolean;
};

const navItemObject = [
  { text: "YOUR GAMES", location: "/your-matches" },
  { text: "CURRENT GAMES", location: "/your-matches#currentGames" },
  { text: "COMPLETED GAMES", location: "/your-matches#completedGames" },
  {
    text: "COMPETITION",
    location: "/",
    iconPath: "/img/layout/NeoTank_MSide-0.png",
    iconAlt: "Teal Galaxy Neo Tank",
    flip: true,
  },
  {
    text: "NEWS",
    location: "/news",
    iconPath: "/img/layout/Sub-0.png",
    iconAlt: "Yellow Comet Sub",
    flip: false,
  },
  {
    text: "HOW TO PLAY",
    location: "/howtoplay",
    iconPath: "/img/layout/APC_MSide-0.png",
    iconAlt: "Jade Sun APC",
    flip: true,
  },
  {
    text: "COMMUNITY",
    location: "/",
    iconPath: "/img/layout/Cruiser-0.png",
    iconAlt: "Blue Moon Cruiser",
    flip: false,
  },
];

export function NavGroupMobile({ showLinks, handleBurgerMenu, setIsOpen, isOpen }: Props) {
  return (
    <>
      <div className="@w-screen @flex @justify-end @items-center @relative @gap-8 tablet:@gap-10 laptop:@gap-16">
        <button
          className="@flex @justify-center @items-center @h-7 @w-7"
          onClick={handleBurgerMenu}
        >
          <div className="@flex @flex-col @gap-[0.35rem] smallscreen:@gap-[0.7rem] burgerMenuIcon active:@scale-105">
            <div className="@h-1 @w-9 smallscreen:@h-[0.3rem] smallscreen:@w-14 @rounded @bg-gradient-to-r @from-primary @to-primary-dark" />
            <div className="@h-1 @w-9 smallscreen:@h-[0.3rem] smallscreen:@w-14 @rounded @bg-gradient-to-r @from-primary @to-primary-dark" />
            <div className="@h-1 @w-9 smallscreen:@h-[0.3rem] smallscreen:@w-14 @rounded @bg-gradient-to-r @from-primary @to-primary-dark" />
          </div>
        </button>
        <div className="@flex @h-full @justify-center @items-center @relative">
          <NavUserSection isOpen={isOpen} setIsOpen={setIsOpen} width="95vw" />
        </div>
      </div>
      <ul
        className={`@absolute @m-0 @p-0 @list-none @overflow-y-hidden @shadow-black @shadow-lg @right-0 @w-full smallscreen:@w-[45vw] @top-[calc(100%_+_0.3em)]
      @bg-gradient-to-r @from-bg-primary @from-30% @to-bg-secondary @z-50 @duration-[750ms]
          ${showLinks ? "@max-h-[100vh]" : "@max-h-0"}`}
      >
        {navItemObject.map((option) => (
          <li
            key={option.text}
            className={`@py-3 @px-4 large_monitor:@py-4 @cursor-pointer @border-primary-dark @border-b-[1px]`}
          >
            <NavItem
              text={option.text}
              location={option.location}
              handleBurgerMenu={handleBurgerMenu}
            />
          </li>
        ))}
      </ul>
    </>
  );
}
