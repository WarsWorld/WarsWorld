import { useClickOutsideRef } from "frontend/utils/useClickOutsideRef";
import { useState } from "react";
import NavbarDropdown from "./NavbarDropdown";
import { NavItem } from "./NavItem";
import NavAuthItem from "./user-settings/NavAuthItem";
import UserSectionDropdown from "./user-settings/UserSectionDropdown";

type Props = {
  setIsOpen: (value: boolean, callbackUrl?: string) => Promise<void>;
  isOpen: boolean;
};

const navItemObject = [
  {
    text: "GAMES",
    location: "/your-matches",
    iconPath: "/img/layout/NeoTank_MSide-0.png",
    iconAlt: "Teal Galaxy Neo Tank",
    flip: true,
  },
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

export function NavGroup({ setIsOpen, isOpen }: Props) {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const refClickOutsideUserDropdown = useClickOutsideRef(
    () => setShowUserDropdown(false),
    "user-profile-nav-item",
  );

  return (
    <>
      <div className="@flex @items-center @justify-center @p-2 @gap-10 monitor:@gap-8 @h-full @w-[76%]">
        {navItemObject.map((item) => (
          <NavItem key={item.text} text={item.text} location={item.location} />
        ))}
      </div>
      <div className="@flex @h-12 @w-[12%] @justify-end @items-center @relative">
        <NavAuthItem
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          setShowUserDropdown={setShowUserDropdown}
        />
      </div>
      <NavbarDropdown
        show={showUserDropdown}
        refClickOutsideUserDropdown={refClickOutsideUserDropdown}
      >
        <UserSectionDropdown />
      </NavbarDropdown>
    </>
  );
}
