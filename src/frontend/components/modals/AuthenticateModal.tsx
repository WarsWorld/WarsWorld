import { Dialog } from "@headlessui/react";
import { getProviders } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import ErrorSuccessBlock from "../layout/forms/ErrorSuccessBlock";
import SocialMediaSignInButton from "../layout/forms/SocialMediaSignInButton";
import DefaultDialogDesign from "../layout/modal/DefaultDialogDesign";

const possibleProviders = ["github", "discord", "google"];

type Props = {
  width?: string;
  isOpen: boolean;
  setIsOpen: (value: boolean, callbackUrl?: string) => Promise<void>;
};

export default function AuthenticateModal({ isOpen, setIsOpen, width }: Props) {
  const [currentProviders, setCurrentProviders] =
    useState<Awaited<ReturnType<typeof getProviders>>>();
  const searchParams = useSearchParams();

  useEffect(() => {
    // NOTE: In production erase all the existing logic related to checking
    // if the providers are correctly configured.
    // This will make a request to check the proviers ever refresh.
    void getProviders().then((providers) => setCurrentProviders(providers));
  }, []);

  const onClose = () => {
    void setIsOpen(false);
  };

  const errorParam = searchParams.get("error");

  return (
    <>
      <Dialog open={isOpen} onClose={onClose} className="@relative @z-40">
        <DefaultDialogDesign title="Login" width={width ?? "50vw"}>
          <div className="@pt-4 smallscreen:@pt-8 @px-4 smallscreen:@px-20">
            {errorParam !== null && errorParam.trim() !== "" && (
              <ErrorSuccessBlock isError title={getErrorMessage(errorParam)} />
            )}
            <div className="@flex @flex-col @items-center @justify-center @pb-6 smallscreen:@px-10 @gap-2">
              <div className="@flex @flex-wrap @justify-center @w-full @gap-4">
                {possibleProviders.map((socialMedia) => (
                  <div
                    key={socialMedia}
                    className="@h-14 @text-2xl large_monitor:@text-3xl @w-[75vw] smallscreen:@w-48 large_monitor:@w-56"
                  >
                    <SocialMediaSignInButton
                      name={socialMedia}
                      disabled={!currentProviders?.[socialMedia]}
                    />
                  </div>
                ))}
              </div>
              <p className="@pt-6 @text-lg smallscreen:@text @text-center">
                Developer note: If you want to sign in with one of these proviers, you must follow
                the respective directions on README.md to set it up.
              </p>
            </div>
          </div>
        </DefaultDialogDesign>
      </Dialog>
    </>
  );
}

function getErrorMessage(error: string) {
  switch (error) {
    case "ProtectedPage":
      return "You must be logged in to access this page.";
    case "OAuthAccountNotLinked":
      return "There is already an user with that email";
    case "Callback":
    default:
      return "Error trying to login with that provider.";
  }
}
