import SquareButton from "../layout/SquareButton";
import FormInput from "../layout/FormInput";
import { Dispatch, FormEvent, SetStateAction, useState } from "react";
import { trpc } from "frontend/utils/trpc-client";
import ErrorSuccessBlock from "../layout/ErrorSuccessBlock";

interface Props {
  setIsSignupForm: (value: boolean, callbackUrl?: string) => Promise<void>;
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

  const doPasswordsMatch =
    signupData.password === signupData.confirmPassword ||
    signupData.password === "" ||
    signupData.confirmPassword === "";

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

    if (signupData.confirmPassword !== signupData.password) {
      throw "Passwords do not match";
    }

    try {
      await registerAsync({
        email: signupData.email,
        username: signupData.user,
        password: signupData.password,
      });
    } catch (e) {
      return e;
    }

    setIsSignupForm(false, callbackUrl == null ? undefined : callbackUrl);
    setDidSignUp(true);
  };

  const defineErrorMessage = () => {
    if (!doPasswordsMatch) return "Passwords do not match";
    if (error?.data?.zodError) return "Data validation error";
    if (error) return error.message;
  };

  return (
    <>
      {(!doPasswordsMatch || isError) && (
        <ErrorSuccessBlock
          isError
          title={!doPasswordsMatch ? "Warning" : "Couldn't sign up"}
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
            <SquareButton onClick={onSubmitSignupForm}>Signup</SquareButton>
          </div>
        </div>
      </form>
    </>
  );
}
