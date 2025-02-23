import { useClickOutsideRef } from "frontend/utils/useClickOutsideRef";
import { useState } from "react";
import { NavItem } from "./NavItem";
import NavAuthItem from "./user-settings/NavAuthItem";
import UserSectionDropdown from "./user-settings/UserSectionDropdown";

type Props = {
  setIsOpen: (value: boolean, callbackUrl?: string) => Promise<void>;
  isOpen: boolean;
};

const navItemObject = [
  { text: "GAMES", location: "/your-matches" },
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

export function NavGroupMobile({ setIsOpen, isOpen }: Props) {
  const [showBurgerDropdown, setShowBurgerDropdown] = useState(false);
  const refClickOutsideBurgerMenu = useClickOutsideRef(
    () => setShowBurgerDropdown(false),
    "burger-menu",
  );

  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const refClickOutsideUserDropdown = useClickOutsideRef(
    () => setShowUserDropdown(false),
    "user-profile-nav-item",
  );

  return (
    <>
      <div className="@w-screen @flex @justify-end @items-center @relative @gap-8 tablet:@gap-10 laptop:@gap-16">
        <div className="@flex @h-full @justify-center @items-center @relative">
          <NavAuthItem
            setShowUserDropdown={setShowUserDropdown}
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            width="95vw"
          />
        </div>
        <button
          id="burger-menu"
          className="@flex @justify-center @items-center @h-8 @w-8 @mx-2"
          onClick={() => setShowBurgerDropdown((prev) => !prev)}
        >
          <div className="@flex @flex-col @gap-[0.35rem] smallscreen:@gap-[0.7rem] burgerMenuIcon active:@scale-105">
            <div className="@h-[0.3rem] @w-9 smallscreen:@h-[0.3rem] smallscreen:@w-14 @rounded @bg-gradient-to-r @from-primary @to-primary-dark" />
            <div className="@h-[0.3rem] @w-9 smallscreen:@h-[0.3rem] smallscreen:@w-14 @rounded @bg-gradient-to-r @from-primary @to-primary-dark" />
            <div className="@h-[0.3rem] @w-9 smallscreen:@h-[0.3rem] smallscreen:@w-14 @rounded @bg-gradient-to-r @from-primary @to-primary-dark" />
          </div>
        </button>
      </div>
      <UserSectionDropdown
        showUserDropdown={showUserDropdown}
        refClickOutsideUserDropdown={refClickOutsideUserDropdown}
      />
      <div ref={refClickOutsideBurgerMenu}>
        <ul
          className={`@absolute @m-0 @p-0 @list-none @overflow-y-hidden @shadow-black @shadow-lg @right-0 @w-full smallscreen:@w-[45vw] @top-[calc(100%_+_0.1em)]
      @bg-bg-secondary @z-50
          ${showBurgerDropdown ? "@max-h-[100vh]" : "@max-h-0"}`}
        >
          {navItemObject.map((option) => (
            <li key={option.text} className={`@py-0 @px-4 @cursor-pointer`}>
              <NavItem
                text={option.text}
                location={option.location}
                closeBurgerMenu={() => setShowBurgerDropdown(false)}
              />
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
