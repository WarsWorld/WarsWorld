import { usePlayers } from "frontend/context/players";
import { signOut } from "next-auth/react";
import Link from "next/link";
import type { RefObject } from "react";
import UserDropdownItem from "./UserDropdownItems";

type Props = {
  showUserDropdown: boolean;
  ref: RefObject<HTMLDivElement>;
};

export default function UserSectionDropdown({ showUserDropdown, ref }: Props) {
  const { currentPlayer } = usePlayers();

  return (
    <div
      className={`@absolute @list-none @overflow-y-hidden @m-0 @p-0 @z-50 @duration-500 @w-56 monitor:@w-96 @top-[calc(100%_+_1em)] laptop:@top-[calc(100%_+_0.8em)] @right-0 @shadow-black @shadow-lg @rounded @bg-bg-secondary ${
        showUserDropdown ? "@max-h-[30rem]" : "@max-h-0"
      }`}
      ref={ref}
    >
      <ul className={`@flex @flex-col @rounded @gap-2 @mb-2 @py-2`}>
        <li className="@border-b-2 @border-bg-tertiary">
          <Link
            className="@flex @flex-row @align-middle @justify-start @items-center @px-8 @mt-2 @mb-4 @py-3 @gap-4 @duration-0 hover:@bg-black/20 @text-white hover:@text-white"
            href={`/players/${currentPlayer?.name}`}
          >
            <div
              className={`@min-w-16 @max-w-16 @min-h-16 @max-h-16 @rounded-full @bg-black/50 @text-center @overflow-hidden`}
            >
              <img src={`\\img\\CO\\smoothFull\\Awds-sasha.webp`} alt="grit" />
            </div>
            <div className="@flex @flex-col">
              <span className="@text-lg @font-semibold">{currentPlayer?.displayName}</span>
              <span className="@text-base @text-gray-400">@{currentPlayer?.name}</span>
            </div>
          </Link>
        </li>
        <UserDropdownItem text="SWITCH PLAYERS" href="\" />
        <UserDropdownItem text="CONFIGURATION" href="\" />
        <li>
          <button
            className="@flex @flex-row @w-full @align-middle @justify-start @items-center @px-8 @py-2 @gap-6 @duration-0 hover:@bg-black/20 @text-white hover:@text-white"
            onClick={() => {
              void signOut();
            }}
          >
            <span className="@text-2xl">LOGOUT</span>
          </button>
        </li>
      </ul>
    </div>
  );
}
