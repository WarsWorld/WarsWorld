import { Dialog } from "@headlessui/react";
import { useState } from "react";
import DefaultDialogDesign from "../layout/modal/DefaultDialogDesign";
import SquareButton from "../layout/SquareButton";
import Link from "next/link";
import LoginForm from "../auth/LoginForm";
import SignupForm from "../auth/SignupForm";
import SocialMediaSignInButton from "../layout/SocialMediaSignInButton";
import ErrorSuccessBlock from "../layout/ErrorSuccessBlock";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/router";

interface Props {
  width?: string;
  isOpen: boolean;
  setIsOpen: (value: boolean, callbackUrl?: string) => Promise<void>;
}

export default function LoginSignupModal({ isOpen, setIsOpen, width }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [didSignUp, setDidSignUp] = useState(false);
  const isSignupForm = searchParams.has("SignUpForm");
  const callbackUrl = searchParams.get("callbackUrl");

  const setIsSignupForm = async (value: boolean, callbackUrl?: string) => {
    if (value)
      await router.replace("", {
        query: `authModalOpen&SignUpForm${
          callbackUrl && "&callbackUrl=" + encodeURIComponent(callbackUrl)
        }`,
      });
    else
      await router.replace("", {
        query: `authModalOpen${
          callbackUrl && "&callbackUrl=" + encodeURIComponent(callbackUrl)
        }`,
      });
  };

  const onLoginSuccess = async () =>
    await setIsOpen(
      false,
      callbackUrl === null ? undefined : decodeURIComponent(callbackUrl)
    );

  const onClose = async () => await setIsOpen(false);

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
                      setIsSignupForm(
                        false,
                        callbackUrl == null ? undefined : callbackUrl
                      )
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
                  {["GitHub", "Discord", "Google"].map((socialMedia) => (
                    <div
                      key={socialMedia}
                      className="@h-14 @text-2xl large_monitor:@text-3xl @w-[75vw] smallscreen:@w-48 large_monitor:@w-56"
                    >
                      <SocialMediaSignInButton name={socialMedia} />
                    </div>
                  ))}
                </div>
                <div className="@h-[0.15rem] @w-full @bg-bg-primary @my-2" />
                <p className="@text-lg smallscreen:@text">
                  Don&apos;t have an account?
                </p>
                <div className="@my-2 @w-[80vw] smallscreen:@w-80 @h-20 cellphone:@h-14 @text-2xl">
                  <SquareButton
                    onClick={() =>
                      setIsSignupForm(
                        true,
                        callbackUrl == null ? undefined : callbackUrl
                      )
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
