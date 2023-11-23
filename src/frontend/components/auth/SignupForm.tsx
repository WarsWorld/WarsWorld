import SquareButton from "../layout/SquareButton";
import FormInput from "../layout/FormInput";
import { useState } from "react";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import { trpc } from "frontend/utils/trpc-client";
import ErrorSuccessBlock from "../layout/ErrorSuccessBlock";

type Props = {
  setIsSignupForm: (value: boolean, callbackUrl?: string | null) => Promise<void>;
  setDidSignUp: Dispatch<SetStateAction<boolean>>;
  callbackUrl: string | null;
}

export default function SignupForm({
  setIsSignupForm,
  setDidSignUp,
  callbackUrl,
}: Props) {
  const [signupData, setSignupData] = useState({
    user: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const areInputsFilled =
    signupData.password.trim() !== "" &&
    signupData.confirmPassword.trim() !== "" &&
    signupData.email.trim() !== "" &&
    signupData.user.trim() !== "";

  const showPasswordsDoNotMatch =
    signupData.password !== signupData.confirmPassword &&
    signupData.password.trim() !== "" &&
    signupData.confirmPassword.trim() !== "";

  const {
    mutateAsync: registerAsync,
    isError,
    error,
  } = trpc.user.registerUser.useMutation();

  const onChangeGenericHandler = (identifier: string, value: string) => {
    setSignupData((prevData) => ({
      ...prevData,
      [identifier]: value,
    }));
  };

  const onSubmitSignupForm = async (event: FormEvent) => {
    event.preventDefault();

    try {
      await registerAsync({
        email: signupData.email,
        name: signupData.user,
        password: signupData.password,
      });
    } catch (e) {
      return e;
    }

    void setIsSignupForm(false, callbackUrl);
    setDidSignUp(true);
  };

  const defineErrorMessage = () => {
    if (error?.data?.zodError) {
      return "Data validation error";
    }

    if (error) {
      return error.message;
    }
    
    if (showPasswordsDoNotMatch) {
      return "Passwords do not match";
    }
  };

  return (
    <>
      {(showPasswordsDoNotMatch || isError) && (
        <ErrorSuccessBlock
          isError
          title={showPasswordsDoNotMatch ? "Warning" : "Couldn't sign up"}
          message={defineErrorMessage()}
        />
      )}
      <form className="@flex @flex-col @gap-6">
        <FormInput
          key="su_email"
          text="Email:"
          id="email"
          type="email"
          value={signupData.email}
          onChange={(event) =>
            onChangeGenericHandler(
              "email",
              (event.target as HTMLInputElement).value
            )
          }
        />
        <FormInput
          key="su_user"
          text="Username:"
          id="username"
          type="text"
          value={signupData.user}
          onChange={(event) =>
            onChangeGenericHandler(
              "user",
              (event.target as HTMLInputElement).value
            )
          }
        />
        <FormInput
          key="su_password"
          text="Password:"
          id="password"
          type="password"
          value={signupData.password}
          onChange={(event) =>
            onChangeGenericHandler(
              "password",
              (event.target as HTMLInputElement).value
            )
          }
        />
        <FormInput
          key="su_confirm_password"
          text="Confirm password:"
          id="confirm_password"
          type="password"
          value={signupData.confirmPassword}
          onChange={(event) =>
            onChangeGenericHandler(
              "confirmPassword",
              (event.target as HTMLInputElement).value
            )
          }
        />
        <div className="@flex @flex-col @items-center @justify-center @py-4 @px-10">
          <div className="@w-[80vw] smallscreen:@w-96 @h-16 @text-3xl @my-2">
            <SquareButton
              disabled={
                signupData.password !== signupData.confirmPassword ||
                !areInputsFilled
              }
              onClick={(event: FormEvent) => {
                void onSubmitSignupForm(event);
              }}
            >
              Signup
            </SquareButton>
          </div>
        </div>
      </form>
    </>
  );
}
