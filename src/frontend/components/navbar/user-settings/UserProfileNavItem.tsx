import { useClickOutsideRef } from "frontend/utils/useClickOutsideRef";
import { useState } from "react";
import UserSectionDropdown from "./UserSectionDropdown";

export function UserProfileNavItem() {
  const refClickOutsideUserDropdown = useClickOutsideRef(() => setShowUserDropdown(false));
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  return (
    <div ref={refClickOutsideUserDropdown}>
      <button
        className="@group @relative @cursor-pointer"
        onClick={() => setShowUserDropdown((prev) => !prev)}
      >
        <div
          className={`@absolute @flex @flex-col @items-center @justify-center @bg-bg-secondary group-hover:@bg-bg-secondary/100 @rounded-full @min-w-6 @min-h-6 @max-w-6 @max-h-6 @-bottom-1 @-right-1 @text-sm @overflow-hidden`}
        >
          <div className="@flex @flex-col @align-middle @items-center @justify-center @w-8 @h-8 @bg-transparent group-hover:@bg-black/30">
            <span>&#x25BC;</span>
          </div>
        </div>
        <div
          className={`@min-w-14 @max-w-14 @min-h-14 @max-h-14 @rounded-full @bg-black/50 @text-center @overflow-hidden`}
        >
          <img src={`\\img\\CO\\smoothFull\\Awds-sasha.webp`} alt="grit" />
        </div>
      </button>
      <UserSectionDropdown showUserDropdown={showUserDropdown} ref={refClickOutsideUserDropdown} />
    </div>
  );
}
