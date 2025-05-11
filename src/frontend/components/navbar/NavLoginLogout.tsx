import { usePlayers } from "frontend/context/players";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import SquareButton from "../layout/SquareButton";
import LoginSignupModal from "../modals/LoginSignupModal";

type Props = {
  setIsOpen: (value: boolean, callbackUrl?: string) => Promise<void>;
  isOpen: boolean;
  width?: string;
};

export default function NavLoginLogout({ isOpen, setIsOpen, width }: Props) {
  const { clearLSCurrentPlayer, currentPlayer } = usePlayers();
  const { data: session } = useSession();

  return (
    <>
      <div className="@flex @justify-center @items-center @text-2xl @w-full @h-full">
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
            <LoginSignupModal isOpen={isOpen} setIsOpen={setIsOpen} width={width ?? "50vw"} />
          </>
        )}
        {session?.user && (
          <div className="@flex @flex-col @w-full @align-middle @text-center @justify-center">
            <Link
              href={`/players/${currentPlayer?.name}`}
              className="@text-white hover:@text-white"
            >
              <p className="@text-md @cursor-pointer">{currentPlayer?.name}</p>
            </Link>
            <div
              className="hover:@scale-[1.02] @text-base smallscreen:@text-lg @cursor-pointer @text-primary-light hover:@text-primary"
              onClick={() => {
                clearLSCurrentPlayer();
                void signOut();
              }}
            >
              LOGOUT
            </div>
          </div>
        )}
      </div>
    </>
  );
}
