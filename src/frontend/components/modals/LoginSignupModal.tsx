import { Dialog } from "@headlessui/react";
import { Dispatch, SetStateAction, useState } from "react";
import DefaultDialogDesign from "../layout/modal/DefaultDialogDesign";
import SquareButton from "../layout/SquareButton";
import Link from "next/link";
import LoginForm from "../auth/LoginForm";
import SignupForm from "../auth/SignupForm";
import SocialMediaSignInButton from "../layout/SocialMediaSignInButton";
import ErrorSuccessBlock from "../layout/ErrorSuccessBlock";

interface Props {
  width?: string;
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}

export default function LoginSignupModal({ isOpen, setIsOpen, width }: Props) {
  const [isSignupForm, setIsSignupForm] = useState(false);
  const [didSignUp, setDidSignUp] = useState(false);

  const onSubmitEndBehaviour = () => {
    setIsSignupForm(false);
    setIsOpen(false);
    setDidSignUp(false);
  };

  return (
    <>
      <Dialog
        open={isOpen}
        onClose={onSubmitEndBehaviour}
        className="@relative @z-40"
      >
        {isSignupForm ? (
          /* SIGNUP */
          <DefaultDialogDesign title="Signup" width={width ?? "50vw"}>
            <div className="@pt-8 @px-20">
              {didSignUp && (
                <ErrorSuccessBlock title="Successfully signed up" />
              )}
              <SignupForm
                setIsSignupForm={setIsSignupForm}
                setDidSignUp={setDidSignUp}
              />
              <div className="@flex @flex-col @items-center @justify-center @pb-6 @px-10 @gap-2">
                <div className="@h-[0.15rem] @w-full @bg-bg-primary @my-2" />
                <p>Already have an account?</p>
                <div className="@my-2 @w-80 @h-12 @text-2xl">
                  <SquareButton onClick={() => setIsSignupForm(false)}>
                    Login
                  </SquareButton>
                </div>
              </div>
            </div>
          </DefaultDialogDesign>
        ) : (
          /* LOGIN */
          <DefaultDialogDesign title="Login" width={width ?? "50vw"}>
            <div className="@pt-8 @px-20">
              {didSignUp && (
                <ErrorSuccessBlock title="Successfully signed up" />
              )}
              <LoginForm onSubmitEndBehaviour={onSubmitEndBehaviour} />
              <div className="@flex @flex-col @items-center @justify-center @pb-6 @px-10 @gap-2">
                <Link
                  className="@my-2 @text @no-underline hover:@underline"
                  href="."
                  onClick={() => setIsOpen(false)}
                >
                  Forgot password?
                </Link>

                <div className="@flex @flex-wrap @justify-center @w-full @gap-4">
                  {["GitHub", "Discord"].map((socialMedia) => (
                    <div
                      key={socialMedia}
                      className="@h-14 @text-3xl @w-72 @my-2"
                    >
                      <SocialMediaSignInButton name={socialMedia} />
                    </div>
                  ))}
                </div>
                <div className="@h-[0.15rem] @w-full @bg-bg-primary @my-2" />
                <p>Don&apos;t have an account?</p>
                <div className="@my-2 @w-80 @h-12 @text-2xl">
                  <SquareButton onClick={() => setIsSignupForm(true)}>
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
