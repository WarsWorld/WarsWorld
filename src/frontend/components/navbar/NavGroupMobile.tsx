import { useClickOutsideRef } from "frontend/utils/useClickOutsideRef";
import { useState } from "react";
import DropdownItem from "./DropdownItem";
import NavbarDropdown from "./NavbarDropdown";
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
      {/* USER */}
      <NavbarDropdown
        show={showUserDropdown}
        refClickOutsideUserDropdown={refClickOutsideUserDropdown}
      >
        <UserSectionDropdown />
      </NavbarDropdown>
      {/* NAVIGATION */}
      <NavbarDropdown
        show={showBurgerDropdown}
        refClickOutsideUserDropdown={refClickOutsideBurgerMenu}
      >
        <ul className="@flex @flex-col @gap-2 @pt-2">
          {navItemObject.map((option) => (
            <DropdownItem
              key={option.text}
              className="@border-b-2 @border-bg-tertiary @py-1 last:@border-0"
              href={option.location}
              text={option.text}
            />
          ))}
        </ul>
      </NavbarDropdown>
    </>
  );
}
