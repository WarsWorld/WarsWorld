import { Dialog } from "@headlessui/react";
import { useEffect, useState } from "react";
import DefaultDialogDesign from "../layout/modal/DefaultDialogDesign";
import SquareButton from "../layout/SquareButton";
import Link from "next/link";
import LoginForm from "../auth/LoginForm";
import SignupForm from "../auth/SignupForm";
import SocialMediaSignInButton from "../layout/forms/SocialMediaSignInButton";
import ErrorSuccessBlock from "../layout/forms/ErrorSuccessBlock";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import { getProviders } from "next-auth/react";

const possibleProviders = ["github", "discord", "google"];

type Props = {
  width?: string;
  isOpen: boolean;
  setIsOpen: (value: boolean, callbackUrl?: string) => Promise<void>;
}

export default function LoginSignupModal({ isOpen, setIsOpen, width }: Props) {
  const [currentProviders, setCurrentProviders] =
    useState<Awaited<ReturnType<typeof getProviders>>>();

  const searchParams = useSearchParams();
  const router = useRouter();

  const [didSignUp, setDidSignUp] = useState(false);

  const isSignupForm = searchParams.has("SignUpForm");
  const callbackUrl = searchParams.get("callbackUrl");

  useEffect(() => {
    // NOTE: In production erase all the existing logic related to checking
    // if the providers are correctly configured.
    // This will make a request to check the proviers ever refresh.
    void getProviders().then((providers) => setCurrentProviders(providers));
  }, []);

  const setIsSignupForm = async (value: boolean, callbackUrl: string | null) => {
    if (value) 
    {
      await router.replace("", {
        query: `authModalOpen&SignUpForm${
          callbackUrl !== null ? "&callbackUrl=" + encodeURIComponent(callbackUrl) : ""
        }`,
      });
    } 
    else
    {
      await router.replace("", {
        query: `authModalOpen${
          callbackUrl !== null ? "&callbackUrl=" + encodeURIComponent(callbackUrl) : ""
        }`,
      });
    }
  };

  const onLoginSuccess = async () =>
    await setIsOpen(
      false,
      callbackUrl === null ? undefined : decodeURIComponent(callbackUrl)
    );

  const onClose = () => {
    void setIsOpen(false);
  }

  return (
    <>
      <Dialog open={isOpen} onClose={onClose} className="@relative @z-40">
        {isSignupForm ? (
          /* SIGNUP */
          <DefaultDialogDesign title="Signup" width={width ?? "50vw"}>
            <div className="@pt-4 smallscreen:@pt-8 @px-4 smallscreen:@px-20">
              {didSignUp && (
                <ErrorSuccessBlock title="Successfully signed up" />
              )}
              <SignupForm
                setIsSignupForm={setIsSignupForm}
                setDidSignUp={setDidSignUp}
                callbackUrl={callbackUrl}
              />
              <div className="@flex @flex-col @items-center @justify-center @pb-6 @px-10 @gap-2">
                <div className="@h-[0.15rem] @w-full @bg-bg-primary @my-2" />
                <p className="@text-lg smallscreen:@text">
                  Already have an account?
                </p>
                <div className="@my-2 @w-[80vw] smallscreen:@w-80 @h-14 @text-2xl">
                  <SquareButton
                    onClick={() =>
                      void setIsSignupForm(false, callbackUrl)
                    }
                  >
                    Login
                  </SquareButton>
                </div>
              </div>
            </div>
          </DefaultDialogDesign>
        ) : (
          /* LOGIN */
          <DefaultDialogDesign title="Login" width={width ?? "50vw"}>
            <div className="@pt-4 smallscreen:@pt-8 @px-4 smallscreen:@px-20">
              {didSignUp && (
                <ErrorSuccessBlock title="Successfully signed up" />
              )}
              <LoginForm onLoginSuccess={onLoginSuccess} />
              <div className="@flex @flex-col @items-center @justify-center @pb-6 smallscreen:@px-10 @gap-2">
                <Link
                  className="@my-2 @text-xl smallscreen:@text @no-underline hover:@underline"
                  href="."
                  onClick={onClose}
                >
                  Forgot password?
                </Link>

                <p className="@pt-4 @text-lg smallscreen:@text">
                  You can also sign in with:
                </p>
                <div className="@flex @flex-wrap @justify-center @w-full @gap-4">
                  {possibleProviders.map((socialMedia) => (
                    <div
                      key={socialMedia}
                      className="@h-14 @text-2xl large_monitor:@text-3xl @w-[75vw] smallscreen:@w-48 large_monitor:@w-56"
                    >
                      <SocialMediaSignInButton
                        name={socialMedia}
                        disabled={
                          !currentProviders?.[socialMedia]
                        }
                      />
                    </div>
                  ))}
                </div>
                <p className="@pt-6 @text-lg smallscreen:@text @text-center">
                  Developer note: If you want to sign in with one of these
                  proviers, you must follow the respective directions on
                  README.md to set it up.
                </p>
                <div className="@h-[0.15rem] @w-full @bg-bg-primary @my-2" />
                <p className="@text-lg smallscreen:@text">
                  Don&apos;t have an account?
                </p>
                <div className="@my-2 @w-[80vw] smallscreen:@w-80 @h-20 cellphone:@h-14 @text-2xl">
                  <SquareButton
                    onClick={() =>
                      void setIsSignupForm(true, callbackUrl)
                    }
                  >
                    Create New Account
                  </SquareButton>
                </div>
              </div>
            </div>
          </DefaultDialogDesign>
        )}
      </Dialog>
    </>
  );
}
