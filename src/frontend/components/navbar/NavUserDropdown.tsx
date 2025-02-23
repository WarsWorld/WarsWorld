import { usePlayers } from "frontend/context/players";
import { useClickOutsideRef } from "frontend/utils/useClickOutsideRef";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import SquareButton from "../layout/SquareButton";
import AuthenticateModal from "../modals/AuthenticateModal";
import { NavItem } from "./NavItem";

type Props = {
  setIsOpen: (value: boolean, callbackUrl?: string) => Promise<void>;
  isOpen: boolean;
  width?: string;
};

export default function NavUserDropdown({ isOpen, setIsOpen, width }: Props) {
  const refClickOutsideUserDropdown = useClickOutsideRef(() => setShowUserDropdown(false));
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const { clearLSCurrentPlayer, currentPlayer } = usePlayers();
  const { data: session } = useSession();

  return (
    <>
      <div className="@relative @flex @justify-center @items-center @text-2xl @w-full @h-full">
        {!session && (
          <>
            <div className="@w-32">
              <SquareButton
                onClick={() => {
                  void setIsOpen(true);
                }}
              >
                LOGIN
              </SquareButton>
            </div>
            <AuthenticateModal isOpen={isOpen} setIsOpen={setIsOpen} width={width ?? "50vw"} />
          </>
        )}
        {session?.user && currentPlayer && (
          <>
            <button
              className="@group @relative @cursor-pointer"
              onClick={() => setShowUserDropdown(!showUserDropdown)}
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
            <div
              className={`@absolute @list-none @overflow-y-hidden @m-0 @p-0 @z-50 @duration-[750ms] @w-56 monitor:@w-96 @top-[calc(100%_+_1em)] laptop:@top-[calc(100%_+_0.8em)] @right-0 @shadow-black @shadow-lg @rounded @bg-gradient-to-r @from-bg-primary @from-30% @to-bg-secondary ${
                showUserDropdown ? "@max-h-[30rem]" : "@max-h-0"
              }`}
              ref={refClickOutsideUserDropdown}
            >
              <ul
                className={`@py-1 @shadow-black @shadow-lg @rounded
                    @bg-gradient-to-r @from-bg-primary @from-30% @to-bg-secondary
                        `}
              >
                <li className="@cursor-pointer @h-full">
                  <NavItem text="PROFILE" location="/" />
                  <NavItem text="SWITCH PLAYER" location="/" />
                  <NavItem text="CONFIGURATION" location="/" />
                  <div className="@flex @justify-center @items-center @gap-2 @h-full">
                    <div
                      className="@py-4 @cursor-pointer @text-primary-light hover:@text-primary"
                      onClick={() => {
                        clearLSCurrentPlayer();
                        void signOut();
                      }}
                    >
                      LOGOUT
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </>
        )}
      </div>
    </>
  );
}
