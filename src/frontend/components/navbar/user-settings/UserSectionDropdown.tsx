import { usePlayers } from "frontend/context/players";
import { signOut } from "next-auth/react";
import Link from "next/link";
import type { RefObject } from "react";
import UserDropdownItem from "./UserDropdownItems";

type Props = {
  showUserDropdown: boolean;
  refClickOutsideUserDropdown: RefObject<HTMLDivElement>;
};

export default function UserSectionDropdown({
  showUserDropdown,
  refClickOutsideUserDropdown,
}: Props) {
  const { currentPlayer } = usePlayers();

  return (
    <div
      className={`@absolute @list-none @overflow-y-hidden @m-0 @p-0 @z-50 @w-full smallscreen:@w-96 @top-[calc(100%_+_0.1em)] @right-0 smallscreen:@right-2 @shadow-black @shadow-lg @rounded @bg-bg-secondary ${
        showUserDropdown ? "@max-h-[100vh]" : "@max-h-0"
      }`}
      ref={refClickOutsideUserDropdown}
    >
      <ul className={`@flex @flex-col @rounded @gap-2 @py-2`}>
        <li>
          <Link
            className="@flex @flex-row @align-middle @justify-start @items-center @px-8 @mt-2 @mb-3 @py-3 @gap-4 @duration-0 hover:@bg-black/20 @text-white hover:@text-white"
            href={`/players/${currentPlayer?.name}`}
          >
            <div
              className={`@min-w-16 @max-w-16 @min-h-16 @max-h-16 @rounded-full @bg-black/50 @text-center @overflow-hidden`}
            >
              <img src={`/img/CO/smoothFull/Awds-sasha.webp`} alt="grit" />
            </div>
            <div className="@flex @flex-col">
              <span className="@text-lg @font-semibold">{currentPlayer?.displayName}</span>
              <span className="@text-base @text-gray-400">@{currentPlayer?.name}</span>
            </div>
          </Link>
        </li>
        <div className="@h-[2px] @w-full @bg-bg-tertiary" />
        <UserDropdownItem text="SWITCH PLAYERS" href="/" />
        <UserDropdownItem text="CONFIGURATION" href="/" />
        <div className="@h-[2px] @w-full @bg-bg-tertiary" />
        <UserDropdownItem text="YOUR GAMES" href="/your-matches" />
        <UserDropdownItem text="CURRENT GAMES" href="/your-matches#currentGames" />
        <UserDropdownItem text="COMPLETED GAMES" href="/your-matches#completedGames" />
        <div className="@h-[2px] @w-full @bg-bg-tertiary" />
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
