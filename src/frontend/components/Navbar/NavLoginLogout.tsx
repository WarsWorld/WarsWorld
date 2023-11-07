import { Dispatch, SetStateAction } from "react";
import SquareButton from "../layout/SquareButton";
import LoginSignupModal from "../modals/LoginSignupModal";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";

interface Props {
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  isOpen: boolean;
  width?: string;
}

export default function NavLoginLogout({ isOpen, setIsOpen, width }: Props) {
  const { data: session } = useSession();

  return (
    <>
      <div className="@flex @justify-center @items-center @text-2xl @w-full @h-full">
        {!session && (
          <>
            <div className="@w-32">
              <SquareButton onClick={() => setIsOpen((prev) => !prev)}>
                LOGIN
              </SquareButton>
            </div>
            <LoginSignupModal
              isOpen={isOpen}
              setIsOpen={setIsOpen}
              width={width ?? "50vw"}
            />
          </>
        )}
        {session?.user && (
          <div className="@flex @flex-col @w-full @align-middle @text-center @justify-center">
            <p className="@text-md">{session.user.name}</p>
            <div
              className="hover:@scale-[1.02] @text-lg @cursor-pointer @text-primary-light hover:@text-primary"
              onClick={() => signOut()}
            >
              LOGOUT
            </div>
          </div>
        )}
      </div>
    </>
  );
}
