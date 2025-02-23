import { useSession } from "next-auth/react";
import LoginNavItem from "./LoginNavItem";
import { UserProfileNavItem } from "./UserProfileNavItem";

type Props = {
  setIsOpen: (value: boolean, callbackUrl?: string) => Promise<void>;
  isOpen: boolean;
  width?: string;
};

export default function NavUserSection({ isOpen, setIsOpen, width }: Props) {
  const { status } = useSession();

  return (
    <>
      <div className="@relative @flex @justify-center @items-center @text-2xl @w-full @h-full">
        {status === "authenticated" ? (
          <UserProfileNavItem />
        ) : (
          <LoginNavItem isOpen={isOpen} setIsOpen={setIsOpen} width={width ?? "50vw"} />
        )}
      </div>
    </>
  );
}
